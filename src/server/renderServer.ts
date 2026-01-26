import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Render job state management
interface RenderJob {
  id: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  outputPath: string | null;
  error: string | null;
  createdAt: Date;
}

const jobs = new Map<string, RenderJob>();

// Temporary file directories
const TEMP_DIR = path.join(process.cwd(), 'temp');
const OUTPUT_DIR = path.join(process.cwd(), 'out');

// Create directories if they don't exist
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start render endpoint
app.post('/api/render', async (req, res) => {
  console.log('Received render request:', req.body);
  try {
    const { mechanic, options } = req.body;

    if (!mechanic) {
      res.status(400).json({ error: 'mechanic data is required' });
      return;
    }

    const jobId = uuidv4();
    const propsPath = path.join(TEMP_DIR, `${jobId}.json`);
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

    // Save props file
    fs.writeFileSync(propsPath, JSON.stringify({ mechanic }));

    // Create job
    const job: RenderJob = {
      id: jobId,
      status: 'queued',
      progress: 0,
      outputPath: null,
      error: null,
      createdAt: new Date(),
    };
    jobs.set(jobId, job);

    // Start render asynchronously
    startRender(jobId, propsPath, outputPath, options);

    res.json({ jobId });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: 'Failed to start render' });
  }
});

// Execute render
function startRender(
  jobId: string,
  propsPath: string,
  outputPath: string,
  options?: { width?: number; height?: number; quality?: 'low' | 'medium' | 'high' }
) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'rendering';

  // Quality settings
  const qualitySettings = {
    low: { crf: 28, scale: 0.5 }, // 640x360
    medium: { crf: 23, scale: 0.75 }, // 960x540
    high: { crf: 18, scale: 1 }, // 1920x1080
  };

  const quality = options?.quality || 'high';
  const settings = qualitySettings[quality];
  const width = Math.round(1920 * settings.scale);
  const height = Math.round(1080 * settings.scale);

  // Remotion CLI command
  const args = [
    'remotion',
    'render',
    'src/index.ts',
    'MechanicComposition',
    outputPath,
    `--props=${propsPath}`,
    `--width=${width}`,
    `--height=${height}`,
    `--crf=${settings.crf}`,
    '--log=verbose',
  ];

  console.log(`Starting render job ${jobId}:`, args.join(' '));

  const renderProcess = spawn('npx', args, {
    cwd: process.cwd(),
    shell: true,
  });

  // Parse progress
  renderProcess.stderr.on('data', (data: Buffer) => {
    const output = data.toString();
    console.log(`[${jobId}] ${output}`);

    // Parse progress (e.g., "Rendered 30 out of 300 frames (10%)")
    const progressMatch = output.match(/(\d+)%/);
    if (progressMatch) {
      job.progress = parseInt(progressMatch[1], 10);
    }
  });

  renderProcess.stdout.on('data', (data: Buffer) => {
    console.log(`[${jobId}] ${data.toString()}`);
  });

  renderProcess.on('close', (code) => {
    if (code === 0) {
      job.status = 'completed';
      job.progress = 100;
      job.outputPath = outputPath;
      console.log(`Render job ${jobId} completed`);
    } else {
      job.status = 'failed';
      job.error = `Render failed with code ${code}`;
      console.error(`Render job ${jobId} failed`);
    }

    // Delete props file
    try {
      fs.unlinkSync(propsPath);
    } catch {
      // ignore
    }
  });

  renderProcess.on('error', (error) => {
    job.status = 'failed';
    job.error = error.message;
    console.error(`Render job ${jobId} error:`, error);
  });
}

// Status check endpoint
app.get('/api/render/:jobId/status', (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json({
    status: job.status,
    progress: job.progress,
    error: job.error,
  });
});

// Download endpoint
app.get('/api/render/:jobId/download', (req, res) => {
  const job = jobs.get(req.params.jobId);
  const filename = (req.query.filename as string) || 'mechanic';

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  if (job.status !== 'completed' || !job.outputPath) {
    res.status(400).json({ error: 'Render not completed' });
    return;
  }

  if (!fs.existsSync(job.outputPath)) {
    res.status(404).json({ error: 'Output file not found' });
    return;
  }

  // Download
  res.download(job.outputPath, `${filename}.mp4`, (err) => {
    if (err) {
      console.error('Download error:', err);
    } else {
      // Delete file after download completes
      setTimeout(() => {
        try {
          if (job.outputPath && fs.existsSync(job.outputPath)) {
            fs.unlinkSync(job.outputPath);
            console.log(`Deleted: ${job.outputPath}`);
          }
          jobs.delete(job.id);
        } catch {
          console.error('Cleanup error');
        }
      }, 5000); // Delete after 5 seconds
    }
  });
});

// Cleanup old jobs (older than 1 hour)
setInterval(
  () => {
    const now = new Date();
    for (const [id, job] of jobs.entries()) {
      const age = now.getTime() - job.createdAt.getTime();
      if (age > 60 * 60 * 1000) {
        // 1 hour
        // Delete file
        if (job.outputPath && fs.existsSync(job.outputPath)) {
          try {
            fs.unlinkSync(job.outputPath);
          } catch {
            // ignore
          }
        }
        jobs.delete(id);
        console.log(`Cleaned up old job: ${id}`);
      }
    }
  },
  10 * 60 * 1000
); // Check every 10 minutes

const PORT = process.env.RENDER_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Render server running on http://localhost:${PORT}`);
});

export default app;
