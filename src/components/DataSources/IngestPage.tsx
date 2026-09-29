import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import type { FeedbackItem, Release } from '../../types';

interface IngestPageProps {
  releases: Release[];
  onIngestItems: (items: FeedbackItem[]) => void;
}

type IngestStep = 'upload' | 'parse' | 'analyze' | 'themes' | 'complete';

const STEPS: { id: IngestStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'parse', label: 'Parse' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'themes', label: 'Extract themes' },
  { id: 'complete', label: 'Complete' },
];

const STEP_ORDER: IngestStep[] = ['upload', 'parse', 'analyze', 'themes', 'complete'];

export const IngestPage: React.FC<IngestPageProps> = ({ releases: _releases, onIngestItems: _onIngestItems }) => {
  const [step, setStep] = useState<IngestStep>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({
    imported: 0, analyzed: 0, themes: 0, critical: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const currentStepIdx = STEP_ORDER.indexOf(step);

  const simulateIngest = (name: string) => {
    setFileName(name);
    setStep('parse');
    setProgress(0);

    const simulate = (steps: { s: IngestStep; p: number; delay: number }[]) => {
      steps.forEach(({ s, p, delay }) => {
        setTimeout(() => {
          setStep(s);
          setProgress(p);
          if (s === 'complete') {
            setResults({ imported: 1248, analyzed: 1203, themes: 42, critical: 17 });
          }
        }, delay);
      });
    };

    simulate([
      { s: 'parse', p: 20, delay: 400 },
      { s: 'analyze', p: 50, delay: 1200 },
      { s: 'themes', p: 80, delay: 2400 },
      { s: 'complete', p: 100, delay: 3600 },
    ]);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    simulateIngest(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStep('upload');
    setFileName(null);
    setProgress(0);
    setResults({ imported: 0, analyzed: 0, themes: 0, critical: 0 });
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 700 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#F2F0E9', letterSpacing: '-0.3px', marginBottom: 6 }}>
          Ingest Feedback
        </h1>
        <p style={{ fontSize: 13, color: '#737D7A' }}>
          Upload CSV, JSON or TXT files. AI will parse, analyze, and index into memory automatically.
        </p>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => {
          const done = STEP_ORDER.indexOf(s.id) < currentStepIdx;
          const active = s.id === step;
          return (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `1px solid ${done ? '#5FAFA3' : active ? '#5FAFA3' : '#2B3437'}`,
                  background: done ? '#5FAFA3' : active ? 'rgba(95,175,163,0.15)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {done
                    ? <CheckCircle size={13} style={{ color: '#101416' }} />
                    : <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        color: active ? '#5FAFA3' : '#737D7A',
                      }}>
                        {i + 1}
                      </span>
                  }
                </div>
                <span style={{
                  fontSize: 12,
                  color: done ? '#6FAF8F' : active ? '#F2F0E9' : '#737D7A',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 1,
                  background: done ? '#5FAFA3' : '#2B3437',
                  margin: '0 8px',
                  opacity: done ? 0.5 : 1,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Upload area */}
      {step === 'upload' && (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1px dashed ${isDragging ? '#5FAFA3' : '#2B3437'}`,
              borderRadius: 6,
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'rgba(95,175,163,0.04)' : '#171C1F',
              transition: 'all 0.15s ease',
              marginBottom: 16,
            }}
          >
            <Upload size={24} style={{ color: '#737D7A', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#F2F0E9', marginBottom: 6 }}>
              Drop file here or click to browse
            </div>
            <div style={{ fontSize: 12, color: '#737D7A' }}>
              Supports CSV, JSON, TXT · Max 50MB
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json,.txt"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>

          {/* Or demo */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: '#737D7A' }}>or</span>
            <button
              onClick={() => simulateIngest('fintech_feedback_q4_2026.csv')}
              style={{
                background: 'none',
                border: 'none',
                color: '#5FAFA3',
                fontSize: 12,
                cursor: 'pointer',
                marginLeft: 6,
                padding: 0,
              }}
            >
              run a demo import
            </button>
          </div>

          {/* Supported formats */}
          <div style={{
            marginTop: 20,
            display: 'flex',
            gap: 10,
          }}>
            {[
              { ext: 'CSV', desc: 'Spreadsheet exports from any tool' },
              { ext: 'JSON', desc: 'API response or structured export' },
              { ext: 'TXT', desc: 'Raw text, one entry per line' },
            ].map(fmt => (
              <div key={fmt.ext} style={{
                flex: 1,
                padding: '12px',
                background: '#1D2427',
                border: '1px solid #2B3437',
                borderRadius: 5,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#5FAFA3', marginBottom: 3 }}>
                  .{fmt.ext}
                </div>
                <div style={{ fontSize: 11, color: '#737D7A', lineHeight: 1.4 }}>{fmt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing state */}
      {(step === 'parse' || step === 'analyze' || step === 'themes') && (
        <div className="surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <FileText size={18} style={{ color: '#5FAFA3' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#F2F0E9' }}>{fileName}</div>
              <div style={{ fontSize: 11, color: '#737D7A' }}>Processing…</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: '#2B3437', borderRadius: 2, marginBottom: 12 }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: '#5FAFA3',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>

          <div style={{ fontSize: 12, color: '#737D7A' }}>
            {step === 'parse' && 'Parsing file structure…'}
            {step === 'analyze' && 'AI analyzing sentiment and urgency…'}
            {step === 'themes' && 'Extracting themes and patterns…'}
          </div>
        </div>
      )}

      {/* Complete */}
      {step === 'complete' && (
        <div>
          <div className="surface" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <CheckCircle size={18} style={{ color: '#6FAF8F' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#F2F0E9' }}>Import complete</div>
                <div style={{ fontSize: 11, color: '#737D7A' }}>{fileName}</div>
              </div>
            </div>

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Records imported', value: results.imported.toLocaleString(), color: '#F2F0E9' },
                { label: 'AI analyzed', value: results.analyzed.toLocaleString(), color: '#6FAF8F' },
                { label: 'Themes detected', value: results.themes.toString(), color: '#5FAFA3' },
                { label: 'Critical issues', value: results.critical.toString(), color: '#C96D67' },
              ].map(r => (
                <div key={r.label} style={{
                  background: '#232B2E',
                  border: '1px solid #2B3437',
                  borderRadius: 5,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 10, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: r.color }}>
                    {r.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Memory update notice */}
            <div style={{
              background: 'rgba(95,175,163,0.06)',
              border: '1px solid rgba(95,175,163,0.18)',
              borderRadius: 5,
              padding: '10px 12px',
              fontSize: 12,
              color: '#A8B0AE',
              lineHeight: 1.5,
            }}>
              AI Memory has been updated. New themes and issues are now available across all views.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={reset}>
              Import another file
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
