import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CategoryType, Release } from '../../types';

interface AddReleaseModalProps {
  onClose: () => void;
  onAddRelease: (newRel: Release) => void;
}

const CATEGORIES: CategoryType[] = [
  'Checkout & Billing',
  'Bugs & Crashes',
  'UI & Usability',
  'Performance & Speed',
  'Security & Auth',
  'Onboarding',
  'Feature Request',
];

export const AddReleaseModal: React.FC<AddReleaseModalProps> = ({ onClose, onAddRelease }) => {
  const [version, setVersion] = useState('v2.5.0');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAreas, setTargetAreas] = useState<CategoryType[]>(['Checkout & Billing']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRel: Release = {
      id: `rel-${Date.now()}`,
      version: version.trim(),
      title: title.trim(),
      releaseDate: new Date().toISOString(),
      description: description.trim() || 'New feature release deployed to production.',
      targetAreas,
      impactStatus: 'pending',
      sentimentBefore: 0.10,
      sentimentAfter: 0.45,
      issueVolumeBefore: 15,
      issueVolumeAfter: 4,
      keyInsights: ['Initial post-deployment telemetry active. Indexing incoming feedback...'],
    };

    onAddRelease(newRel);
    onClose();
  };

  const toggleCategory = (cat: CategoryType) => {
    if (targetAreas.includes(cat)) {
      if (targetAreas.length > 1) setTargetAreas(targetAreas.filter(c => c !== cat));
    } else {
      setTargetAreas([...targetAreas, cat]);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: '#737D7A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: 13,
    background: '#232B2E',
    border: '1px solid #2B3437',
    borderRadius: 5,
    padding: '8px 10px',
    color: '#F2F0E9',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div className="modal-backdrop">
      <div style={{
        background: '#1D2427',
        border: '1px solid #2B3437',
        borderRadius: 8,
        padding: '24px',
        maxWidth: 480,
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #2B3437' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#F2F0E9' }}>Log release</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737D7A', display: 'flex', padding: 2 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Version tag</label>
              <input
                type="text" required placeholder="v2.5.0"
                value={version} onChange={e => setVersion(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Release title</label>
              <input
                type="text" required placeholder="e.g. Slack Alerts & Auto-Theme"
                value={title} onChange={e => setTitle(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={3}
              placeholder="What changes, bug fixes or new features were included?"
              value={description} onChange={e => setDescription(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Target areas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 2 }}>
              {CATEGORIES.map(cat => {
                const isSel = targetAreas.includes(cat);
                return (
                  <button
                    type="button" key={cat}
                    onClick={() => toggleCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      cursor: 'pointer',
                      background: isSel ? 'rgba(95,175,163,0.12)' : '#232B2E',
                      color: isSel ? '#5FAFA3' : '#737D7A',
                      border: `1px solid ${isSel ? 'rgba(95,175,163,0.3)' : '#2B3437'}`,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4, borderTop: '1px solid #2B3437', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Log release</button>
          </div>
        </form>
      </div>
    </div>
  );
};
