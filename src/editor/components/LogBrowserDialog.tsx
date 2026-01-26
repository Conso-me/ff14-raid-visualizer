import React, { useState, useRef, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';
import { logBrowserParser, LogBrowserParser } from '../../parser/LogBrowserParser';
import { toMechanicData, getJobAbbreviation } from '../../parser';
import type { ZoneSession, Encounter, LogBrowserData, ParsedLogData } from '../../parser/types';

interface LogBrowserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type BrowserStep = 'upload' | 'zones' | 'encounters' | 'timerange';

const FILE_SIZE_MAX_MB = 500;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LogBrowserDialog({ isOpen, onClose }: LogBrowserDialogProps) {
  const { setMechanic } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep] = useState<BrowserStep>('upload');

  // Upload step state
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);

  // Browser data
  const [browserData, setBrowserData] = useState<LogBrowserData | null>(null);
  const [logText, setLogText] = useState<string>('');

  // Selection state
  const [selectedZone, setSelectedZone] = useState<ZoneSession | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

  // Time range state
  const [startTimeOffset, setStartTimeOffset] = useState(0); // seconds from encounter start
  const [endTimeOffset, setEndTimeOffset] = useState(0); // seconds to trim from end
  const [mechanicName, setMechanicName] = useState('');
  const [fps, setFps] = useState(30);

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedLogData | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeBytes = file.size;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    setFileSize(fileSizeBytes);

    if (fileSizeMB > FILE_SIZE_MAX_MB) {
      setParseError(`File too large (${formatFileSize(fileSizeBytes)}). Maximum is ${FILE_SIZE_MAX_MB}MB.`);
      e.target.value = '';
      return;
    }

    setIsParsing(true);
    setParseProgress(0);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setLogText(text);

      try {
        const data = await logBrowserParser.parseStructure(text, file.name, {
          onProgress: (progress) => setParseProgress(Math.round(progress * 100)),
        });

        setBrowserData(data);
        setIsParsing(false);

        if (data.zones.length === 0) {
          setParseError('No zones found in log file.');
        } else {
          setStep('zones');
        }
      } catch (err) {
        setParseError(`Failed to parse log: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSelectZone = (zone: ZoneSession) => {
    setSelectedZone(zone);
    setSelectedEncounter(null);
    setStep('encounters');
  };

  const handleSelectEncounter = (encounter: Encounter) => {
    setSelectedEncounter(encounter);
    setMechanicName(encounter.bossName || 'Imported Mechanic');
    setStartTimeOffset(0);
    setEndTimeOffset(0);
    setStep('timerange');
  };

  const handleImport = async () => {
    if (!selectedEncounter || !selectedZone || !logText) return;

    setIsImporting(true);
    setImportProgress(0);
    setParseError(null);

    try {
      // Calculate actual time range
      const startTime = new Date(selectedEncounter.startTime.getTime() + startTimeOffset * 1000);
      const endTime = new Date(selectedEncounter.endTime.getTime() - endTimeOffset * 1000);

      // Parse the time range, using pre-detected zone players
      const data = await logBrowserParser.parseTimeRange(logText, startTime, endTime, {
        onProgress: (progress) => setImportProgress(Math.round(progress * 100)),
        zonePlayers: selectedZone.players, // Use pre-detected players from zone parsing
      });

      if (data.players.length === 0) {
        setParseError('No players found in selected time range.');
        setIsImporting(false);
        return;
      }

      setParsedData(data);

      // Convert to mechanic data
      const mechanic = toMechanicData(data, {
        mechanicName,
        fps,
      });

      setMechanic(mechanic);
      handleClose();
    } catch (err) {
      setParseError(`Failed to import: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setIsParsing(false);
    setParseProgress(0);
    setParseError(null);
    setFileSize(0);
    setBrowserData(null);
    setLogText('');
    setSelectedZone(null);
    setSelectedEncounter(null);
    setStartTimeOffset(0);
    setEndTimeOffset(0);
    setMechanicName('');
    setFps(30);
    setIsImporting(false);
    setImportProgress(0);
    setParsedData(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'zones') setStep('upload');
    else if (step === 'encounters') setStep('zones');
    else if (step === 'timerange') setStep('encounters');
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
    width: '700px',
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

  const listItemStyle: React.CSSProperties = {
    padding: '12px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const encounterDurationSec = selectedEncounter
    ? Math.round(selectedEncounter.duration / 1000)
    : 0;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Log Browser</h2>
          <button onClick={handleClose} style={{ ...buttonStyle, padding: '4px 8px' }}>
            X
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['upload', 'zones', 'encounters', 'timerange'] as BrowserStep[]).map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                padding: '8px',
                textAlign: 'center',
                background: step === s ? '#3753c7' : '#2a2a4a',
                borderRadius: '4px',
                fontSize: '11px',
                textTransform: 'capitalize',
              }}
            >
              {i + 1}. {s === 'timerange' ? 'Time Range' : s}
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

        {/* Step: Upload */}
        {step === 'upload' && (
          <div>
            <p style={{ color: '#aaa', marginBottom: '16px' }}>
              Select a large ACT Network log file. The browser will extract zones and encounters.
            </p>

            {/* Parsing progress */}
            {isParsing && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Scanning log structure...</span>
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
                Choose Log File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".log,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div
              style={{
                padding: '12px',
                background: '#2a2a3a',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#888',
              }}
            >
              <strong>Supported:</strong> ACT Network log files (Network_*.log)
              <br />
              <strong>Max size:</strong> {FILE_SIZE_MAX_MB}MB
            </div>
          </div>
        )}

        {/* Step: Zones */}
        {step === 'zones' && browserData && (
          <div>
            <p style={{ color: '#aaa', marginBottom: '16px' }}>
              Found {browserData.zones.length} zone(s) in {browserData.filename}
            </p>

            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {browserData.zones.map((zone, index) => (
                <div
                  key={`${zone.zoneId}-${index}`}
                  style={listItemStyle}
                  onClick={() => handleSelectZone(zone)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#3a3a5a')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#2a2a4a')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {zone.zoneName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {LogBrowserParser.formatTime(zone.startTime)} - {LogBrowserParser.formatTime(zone.endTime)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#88aaff' }}>
                        {zone.encounters.length} encounter(s)
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Zone ID: {zone.zoneId.toString(16).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px' }}>
              <button onClick={handleBack} style={buttonStyle}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step: Encounters */}
        {step === 'encounters' && selectedZone && (
          <div>
            <p style={{ color: '#aaa', marginBottom: '16px' }}>
              <strong>{selectedZone.zoneName}</strong> - {selectedZone.encounters.length} encounter(s)
            </p>

            {selectedZone.encounters.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                No combat encounters detected in this zone.
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {selectedZone.encounters.map((encounter, index) => (
                  <div
                    key={encounter.id}
                    style={listItemStyle}
                    onClick={() => handleSelectEncounter(encounter)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#3a3a5a')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#2a2a4a')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          #{index + 1}: {encounter.bossName || 'Unknown Boss'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {LogBrowserParser.formatTime(encounter.startTime)} -{' '}
                          {LogBrowserParser.formatTime(encounter.endTime)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            color:
                              encounter.result === 'clear'
                                ? '#44ff44'
                                : encounter.result === 'wipe'
                                ? '#ff4444'
                                : '#888',
                          }}
                        >
                          {encounter.result === 'clear'
                            ? 'Clear'
                            : encounter.result === 'wipe'
                            ? 'Wipe'
                            : 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {LogBrowserParser.formatDuration(encounter.duration)} |{' '}
                          {encounter.playerCount} players
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px' }}>
              <button onClick={handleBack} style={buttonStyle}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step: Time Range */}
        {step === 'timerange' && selectedEncounter && (
          <div>
            <p style={{ color: '#aaa', marginBottom: '16px' }}>
              Configure import for: <strong>{selectedEncounter.bossName || 'Unknown Boss'}</strong>
            </p>

            {/* Import progress */}
            {isImporting && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Importing log data...</span>
                  <span>{importProgress}%</span>
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
                      width: `${importProgress}%`,
                      background: '#3753c7',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Encounter info */}
              <div
                style={{
                  padding: '12px',
                  background: '#2a2a4a',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#888' }}>Duration:</span>
                  <span>{LogBrowserParser.formatDuration(selectedEncounter.duration)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#888' }}>Start:</span>
                  <span>{LogBrowserParser.formatTime(selectedEncounter.startTime)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#888' }}>End:</span>
                  <span>{LogBrowserParser.formatTime(selectedEncounter.endTime)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Result:</span>
                  <span
                    style={{
                      color:
                        selectedEncounter.result === 'clear'
                          ? '#44ff44'
                          : selectedEncounter.result === 'wipe'
                          ? '#ff4444'
                          : '#888',
                    }}
                  >
                    {selectedEncounter.result === 'clear'
                      ? 'Clear'
                      : selectedEncounter.result === 'wipe'
                      ? 'Wipe'
                      : 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Mechanic name */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                  Mechanic Name
                </label>
                <input
                  type="text"
                  value={mechanicName}
                  onChange={(e) => setMechanicName(e.target.value)}
                  style={inputStyle}
                  disabled={isImporting}
                />
              </div>

              {/* FPS and time range */}
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
                    disabled={isImporting}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    Total Duration
                  </label>
                  <input
                    type="text"
                    value={`${encounterDurationSec - startTimeOffset - endTimeOffset}s`}
                    disabled
                    style={{ ...inputStyle, opacity: 0.6 }}
                  />
                </div>
              </div>

              {/* Time offsets */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    Start Offset (seconds)
                  </label>
                  <input
                    type="number"
                    value={startTimeOffset}
                    onChange={(e) => setStartTimeOffset(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={0}
                    max={encounterDurationSec - endTimeOffset - 1}
                    style={inputStyle}
                    disabled={isImporting}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    Trim from End (seconds)
                  </label>
                  <input
                    type="number"
                    value={endTimeOffset}
                    onChange={(e) => setEndTimeOffset(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={0}
                    max={encounterDurationSec - startTimeOffset - 1}
                    style={inputStyle}
                    disabled={isImporting}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button
                onClick={handleBack}
                style={isImporting ? { ...buttonStyle, opacity: 0.5, cursor: 'not-allowed' } : buttonStyle}
                disabled={isImporting}
              >
                Back
              </button>
              <button
                onClick={handleImport}
                style={isImporting ? { ...primaryButtonStyle, opacity: 0.5, cursor: 'not-allowed' } : primaryButtonStyle}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
