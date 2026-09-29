import React from 'react';
import { X, Star } from 'lucide-react';
import type { FeedbackItem, Release } from '../../types';

interface FeedbackDetailModalProps {
  item: FeedbackItem | null;
  onClose: () => void;
  releases: Release[];
  onCreateTicket: (item: FeedbackItem) => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  item,
  onClose,
  releases,
  onCreateTicket,
}) => {
  if (!item) return null;

  const linkedRelease = releases.find(r => r.id === item.releaseId);

  const sentimentColor = item.sentiment === 'positive' ? '#6FAF8F'
    : item.sentiment === 'negative' ? '#C96D67'
    : '#D1A45B';

  const urgencyColor = item.urgency === 'critical' ? '#C96D67'
    : item.urgency === 'high' ? '#D1A45B'
    : item.urgency === 'medium' ? '#5FAFA3'
    : '#737D7A';

  return (
    <div className="modal-backdrop">
      <div style={{
        background: '#1D2427',
        border: '1px solid #2B3437',
        borderRadius: 8,
        padding: '24px',
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingBottom: 16,
          marginBottom: 20,
          borderBottom: '1px solid #2B3437',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 5,
              background: '#232B2E',
              border: '1px solid #2B3437',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: '#A8B0AE',
            }}>
              {item.user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F2F0E9' }}>{item.user.name}</div>
              <div style={{ fontSize: 11, color: '#737D7A', marginTop: 1 }}>
                {item.source} · {new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                {item.user.segment && ` · ${item.user.segment}`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737D7A', display: 'flex', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Original feedback */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Original feedback
            </div>
            <div style={{
              background: '#232B2E',
              border: '1px solid #2B3437',
              borderRadius: 5,
              padding: '12px 14px',
            }}>
              <p style={{ fontSize: 13, color: '#F2F0E9', lineHeight: 1.6, margin: 0 }}>
                "{item.text}"
              </p>
              {item.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={12}
                      style={{ color: i < item.rating! ? '#D1A45B' : '#2B3437' }}
                      fill={i < item.rating! ? '#D1A45B' : 'none'}
                    />
                  ))}
                  <span style={{ fontSize: 11, color: '#737D7A', marginLeft: 4 }}>{item.rating} / 5</span>
                </div>
              )}
            </div>
          </section>

          {/* AI Summary */}
          {item.aiSummary && (
            <section>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                AI summary
              </div>
              <p style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.6 }}>{item.aiSummary}</p>
            </section>
          )}

          {/* Analysis grid */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Analysis
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Sentiment', value: item.sentiment, color: sentimentColor },
                { label: 'Priority', value: item.urgency, color: urgencyColor },
                { label: 'Topic', value: item.category, color: '#A8B0AE' },
                { label: 'Sentiment score', value: `${item.sentimentScore > 0 ? '+' : ''}${item.sentimentScore}`, color: sentimentColor },
                { label: 'Status', value: item.status, color: '#A8B0AE' },
                { label: 'Confidence', value: `${Math.round(Math.abs(item.sentimentScore) * 100)}%`, color: '#6FAF8F' },
              ].map(row => (
                <div key={row.label} style={{
                  background: '#232B2E',
                  border: '1px solid #2B3437',
                  borderRadius: 4,
                  padding: '8px 10px',
                }}>
                  <div style={{ fontSize: 10, color: '#737D7A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: row.color, textTransform: 'capitalize' }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Keywords */}
          {item.keywords.length > 0 && (
            <section>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Themes
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {item.keywords.map(k => (
                  <span key={k} style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 3,
                    background: '#1D2427',
                    border: '1px solid #2B3437',
                    color: '#A8B0AE',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {k}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Linked release */}
          {linkedRelease && (
            <section>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Linked release
              </div>
              <div style={{
                background: '#232B2E',
                border: '1px solid #2B3437',
                borderRadius: 4,
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#F2F0E9', fontWeight: 600 }}>
                    {linkedRelease.version}
                  </span>
                  <span style={{ fontSize: 12, color: '#737D7A', marginLeft: 8 }}>{linkedRelease.title}</span>
                </div>
                <span style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 3,
                  background: linkedRelease.impactStatus === 'positive' ? 'rgba(111,175,143,0.12)' : 'rgba(201,109,103,0.12)',
                  color: linkedRelease.impactStatus === 'positive' ? '#6FAF8F' : '#C96D67',
                  border: `1px solid ${linkedRelease.impactStatus === 'positive' ? 'rgba(111,175,143,0.22)' : 'rgba(201,109,103,0.22)'}`,
                  textTransform: 'capitalize',
                }}>
                  {linkedRelease.impactStatus}
                </span>
              </div>
            </section>
          )}

          {/* Suggested action */}
          {item.suggestedAction && (
            <section>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Suggested action
              </div>
              <p style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.6 }}>{item.suggestedAction}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          paddingTop: 16,
          marginTop: 16,
          borderTop: '1px solid #2B3437',
        }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { onCreateTicket(item); onClose(); }}
          >
            Create action ticket
          </button>
        </div>
      </div>
    </div>
  );
};
