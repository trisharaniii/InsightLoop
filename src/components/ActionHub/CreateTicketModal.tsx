import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { ActionTicket, CategoryType, TicketPriority } from '../../types';

interface CreateTicketModalProps {
  initialTitle?: string;
  initialDescription?: string;
  initialCategory?: string;
  initialFeedbackIds?: string[];
  onClose: () => void;
  onCreateTicket: (ticket: ActionTicket) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  initialTitle = '',
  initialDescription = '',
  initialCategory = 'Checkout & Billing',
  initialFeedbackIds = [],
  onClose,
  onCreateTicket,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<TicketPriority>('P1 - High');
  const [category, setCategory] = useState<CategoryType>(initialCategory as CategoryType);
  const [assignedTo, setAssignedTo] = useState('Product Engineering');
  const [impactedCount, setImpactedCount] = useState(120);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTicket: ActionTicket = {
      id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'backlog',
      category,
      linkedFeedbackIds: initialFeedbackIds,
      impactedUsersCount: impactedCount,
      assignedTo,
      createdAt: new Date().toISOString(),
    };

    onCreateTicket(newTicket);
    onClose();
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
        maxWidth: 500,
        width: '100%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #2B3437' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#F2F0E9' }}>Create action</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737D7A', display: 'flex', padding: 2 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Fix 2FA SMS delivery for EU enterprise users"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TicketPriority)} style={inputStyle}>
                <option value="P0 - Critical">P0 — Critical</option>
                <option value="P1 - High">P1 — High</option>
                <option value="P2 - Medium">P2 — Medium</option>
                <option value="P3 - Low">P3 — Low</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Product area</label>
              <select value={category} onChange={e => setCategory(e.target.value as CategoryType)} style={inputStyle}>
                <option value="Checkout & Billing">Checkout & Billing</option>
                <option value="Bugs & Crashes">Bugs & Crashes</option>
                <option value="UI & Usability">UI & Usability</option>
                <option value="Performance & Speed">Performance & Speed</option>
                <option value="Security & Auth">Security & Auth</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={3}
              placeholder="Describe the issue, root cause, and expected outcome…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Owner</label>
              <input
                type="text"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Impacted users</label>
              <input
                type="number"
                value={impactedCount}
                onChange={e => setImpactedCount(Number(e.target.value))}
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4, borderTop: '1px solid #2B3437', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
