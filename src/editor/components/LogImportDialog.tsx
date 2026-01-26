import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';
import { actLogParser, toMechanicData, getUniqueDebuffs, getJobAbbreviation } from '../../parser';
import type { ParsedLogData } from '../../parser';

interface LogImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStep = 'upload' | 'configure' | 'preview';

// File size thresholds
const FILE_SIZE_WARNING_MB = 50;
const FILE_SIZE_MAX_MB = 200;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LogImportDialog({ isOpen, onClose }: LogImportDialogProps) {
  const { setMechanic } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep] = useState<ImportStep>('upload');

  // Upload step
  const [logText, setLogText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedLogData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [fileSize, setFileSize] = useState(0);

  // Configure step
  const [mechanicName, setMechanicName] = useState('Imported Mechanic');
  const [fps, setFps] = useState(30);
  const [startOffset, setStartOffset] = useState(0); // seconds
  const [endOffset, setEndOffset] = useState(0); // seconds from end (0 = use full log)

  // Unique debuffs for preview - must be before early return
  const uniqueDebuffs = useMemo(
    () => (parsedData ? getUniqueDebuffs(parsedData) : []),
    [parsedData]
  );

  // Compute log duration in seconds
  const logDurationSec = parsedData
    ? Math.round((parsedData.endTime.getTime() - parsedData.startTime.getTime()) / 1000)
    : 0;

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeBytes = file.size;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    setFileSize(fileSizeBytes);

    // Check file size limit
    if (fileSizeMB > FILE_SIZE_MAX_MB) {
      setParseError(`File too large (${formatFileSize(fileSizeBytes)}). Maximum size is ${FILE_SIZE_MAX_MB}MB. Try splitting the log or using a shorter time range.`);
      e.target.value = '';
      return;
    }

    setIsParsing(true);
    setParseProgress(0);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Don't store full text for large files - parse directly
      if (fileSizeMB < 10) {
        setLogText(text);
      }
      // Parse asynchronously
      parseLog(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const parseLog = async (text: string) => {
    setParseError(null);
    setIsParsing(true);
    setParseProgress(0);

    try {
      // Use async parser for chunked processing
      const result = await actLogParser.parseAsync(text, {
        onProgress: (progress) => {
          setParseProgress(Math.round(progress * 100));
        },
      });

      if (result.players.length === 0) {
        setParseError('No players found in log. Make sure this is an ACT Network log file.');
        setIsParsing(false);
        return;
      }

      setParsedData(result);
      setIsParsing(false);
      setStep('configure');
    } catch (err) {
      setParseError(`Failed to parse log: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsParsing(false);
    }
  };

  const handleTextPaste = () => {
    if (!logText.trim()) {
      setParseError('Please paste or enter log text');
      return;
    }
    setFileSize(new Blob([logText]).size);
    parseLog(logText);
  };

  const handleImport = () => {
    if (!parsedData) return;

    const logDuration = parsedData.endTime.getTime() - parsedData.startTime.getTime();
    const startMs = startOffset * 1000;
    const endMs = endOffset > 0 ? logDuration - endOffset * 1000 : undefined;

    try {
      const mechanic = toMechanicData(parsedData, {
        mechanicName,
        fps,
        startTimeOffset: startMs,
        endTimeOffset: endMs,
      });

      setMechanic(mechanic);
      handleClose();
    } catch (err) {
      setParseError(`Failed to convert: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setLogText('');
    setParseError(null);
    setParsedData(null);
    setIsParsing(false);
    setParseProgress(0);
    setFileSize(0);
    setMechanicName('Imported Mechanic');
    setFps(30);
    setStartOffset(0);
    setEndOffset(0);
    onClose();
  };

  const handleBack = () => {
    if (step === 'configure') setStep('upload');
    else if (step === 'preview') setStep('configure');
  };

  const handleNext = () => {
    if (step === 'configure') setStep('preview');
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const dialogStyle: React.CSSProperties = {
    background: '#1a1a2e',
    borderRadius: '8px',
    border: '1px solid #3a3a5a',
    padding: '24px',
    width: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    color: '#fff',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#3753c7',
    borderColor: '#4a63d7',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Import ACT Log</h2>
          <button onClick={handleClose} style={{ ...buttonStyle, padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['upload', 'configure', 'preview'].map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                padding: '8px',
                textAlign: 'center',
                background: step === s ? '#3753c7' : '#2a2a4a',
                borderRadius: '4px',
                fontSize: '12px',
                textTransform: 'capitalize',
              }}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {/* Error display */}
        {parseError && (
          <div
            style={{
              padding: '12px',
              background: '#4a2a2a',
              border: '1px solid #6a3a3a',
              borderRadius: '4px',
              marginBottom: '16px',
              color: '#ff8888',
            }}
          >
            {parseError}
          </div>
        )}

        {/* Step content */}
        {step === 'upload' && (
          <div>
            <p style={{ color: '#aaa', marginBottom: '16px' }}>
              Upload an ACT Network log file or paste the log text directly.
            </p>

            {/* File size warning */}
            <div
              style={{
                padding: '12px',
                background: '#3a3a2a',
                border: '1px solid #5a5a3a',
                borderRadius: '4px',
                marginBottom: '16px',
                color: '#cccc88',
                fontSize: '12px',
              }}
            >
              Large logs (100MB+) will be sampled to prevent performance issues.
              For best results, extract the specific fight section from your log.
            </div>

            {/* Parsing progress */}
            {isParsing && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Parsing log...</span>
                  <span>{parseProgress}%</span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: '#2a2a4a',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${parseProgress}%`,
                      background: '#3753c7',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                {fileSize > 0 && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    File size: {formatFileSize(fileSize)}
                  </div>
                )}
              </div>
            )}

            {/* File upload */}
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={isParsing ? { ...buttonStyle, opacity: 0.5, cursor: 'not-allowed' } : buttonStyle}
                disabled={isParsing}
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".log,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '16px', color: '#666', textAlign: 'center' }}>
              - or -
            </div>

            {/* Text paste */}
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Paste ACT log text here..."
              disabled={isParsing}
              style={{
                ...inputStyle,
                height: '200px',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '12px',
                opacity: isParsing ? 0.5 : 1,
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={handleTextPaste}
                style={isParsing ? { ...primaryButtonStyle, opacity: 0.5, cursor: 'not-allowed' } : primaryButtonStyle}
                disabled={isParsing}
              >
                {isParsing ? 'Parsing...' : 'Parse Log'}
              </button>
            </div>
          </div>
        )}

        {step === 'configure' && parsedData && (
          <div>
            {/* Player summary */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Detected Players ({parsedData.players.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {parsedData.players.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      padding: '4px 8px',
                      background: '#2a2a4a',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#88aaff' }}>{getJobAbbreviation(player.jobId)}</span>
                    {' '}
                    {player.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                  Mechanic Name
                </label>
                <input
                  type="text"
                  value={mechanicName}
                  onChange={(e) => setMechanicName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    FPS
                  </label>
                  <input
                    type="number"
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value) || 30)}
                    min={1}
                    max={60}
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    Log Duration
                  </label>
                  <input
                    type="text"
                    value={`${logDurationSec}s`}
                    disabled
                    style={{ ...inputStyle, opacity: 0.6 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    Start Offset (seconds)
                  </label>
                  <input
                    type="number"
                    value={startOffset}
                    onChange={(e) => setStartOffset(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={logDurationSec}
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    Trim from End (seconds)
                  </label>
                  <input
                    type="number"
                    value={endOffset}
                    onChange={(e) => setEndOffset(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={logDurationSec}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button onClick={handleBack} style={buttonStyle}>
                Back
              </button>
              <button onClick={handleNext} style={primaryButtonStyle}>
                Next: Preview
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && parsedData && (
          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Import Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Mechanic Name:</span>
                <span>{mechanicName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Duration:</span>
                <span>{Math.round((logDurationSec - startOffset - endOffset) * fps)} frames ({logDurationSec - startOffset - endOffset}s at {fps} FPS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Players:</span>
                <span>{parsedData.players.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Enemies:</span>
                <span>{parsedData.enemies.filter(e => e.name && !e.name.startsWith('E00')).slice(0, 5).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Debuff Events:</span>
                <span>{uniqueDebuffs.reduce((sum, d) => sum + d.count, 0)}</span>
              </div>
            </div>

            {/* Debuff list */}
            {uniqueDebuffs.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>Debuffs to Import</h4>
                <div
                  style={{
                    maxHeight: '150px',
                    overflow: 'auto',
                    background: '#2a2a4a',
                    borderRadius: '4px',
                    padding: '8px',
                  }}
                >
                  {uniqueDebuffs.slice(0, 20).map((debuff) => (
                    <div
                      key={debuff.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: '1px solid #3a3a5a',
                        fontSize: '12px',
                      }}
                    >
                      <span>{debuff.name}</span>
                      <span style={{ color: '#666' }}>×{debuff.count}</span>
                    </div>
                  ))}
                  {uniqueDebuffs.length > 20 && (
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                      ...and {uniqueDebuffs.length - 20} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleBack} style={buttonStyle}>
                Back
              </button>
              <button onClick={handleImport} style={primaryButtonStyle}>
                Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
