import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ActionTicket, TicketStatus } from '../../types';

interface ActionHubProps {
  tickets: ActionTicket[];
  onUpdateTicketStatus: (id: string, status: TicketStatus) => void;
  onOpenCreateModal: () => void;
  onSelectFeedback: (id: string) => void;
}

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: 'backlog', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'resolved', label: 'Resolved' },
];

const STATUS_COLORS: Record<TicketStatus, string> = {
  backlog: '#737D7A',
  in_progress: '#5FAFA3',
  in_review: '#D1A45B',
  resolved: '#6FAF8F',
};

const PRIORITY_COLORS: Record<string, string> = {
  'P0 - Critical': '#C96D67',
  'P1 - High': '#D1A45B',
  'P2 - Medium': '#5FAFA3',
  'P3 - Low': '#737D7A',
};

export const ActionHub: React.FC<ActionHubProps> = ({
  tickets,
  onUpdateTicketStatus,
  onOpenCreateModal,
  onSelectFeedback,
}) => {
  const [view, setView] = useState<'list' | 'board'>('list');

  const handleStatusChange = (id: string, status: TicketStatus) => {
    onUpdateTicketStatus(id, status);
    if (status === 'resolved') {
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#F2F0E9', letterSpacing: '-0.3px', marginBottom: 6 }}>
            Action Hub
          </h1>
          <p style={{ fontSize: 13, color: '#737D7A' }}>
            Turn insights into product work · {tickets.filter(t => t.status !== 'resolved').length} open actions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            background: '#1D2427',
            border: '1px solid #2B3437',
            borderRadius: 5,
            overflow: 'hidden',
          }}>
            {(['list', 'board'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  background: view === v ? '#232B2E' : 'none',
                  border: 'none',
                  color: view === v ? '#F2F0E9' : '#737D7A',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <Plus size={13} />
            New action
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="surface" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Action</th>
                <th style={{ width: 110 }}>Priority</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 130 }}>Owner</th>
                <th style={{ width: 90, textAlign: 'right' }}>Impact</th>
                <th style={{ width: 120 }}>Change status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#737D7A' }}>
                      {ticket.id}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#F2F0E9', marginBottom: 2 }}>
                        {ticket.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#737D7A' }}>{ticket.category}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: PRIORITY_COLORS[ticket.priority] || '#737D7A',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, color: '#A8B0AE' }}>{ticket.priority}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: STATUS_COLORS[ticket.status],
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: '#A8B0AE', textTransform: 'capitalize' }}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: '#737D7A' }}>
                      {ticket.assignedTo || 'Unassigned'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#F2F0E9' }}>
                      {ticket.impactedUsersCount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, color: '#737D7A', marginLeft: 3 }}>users</span>
                    {ticket.linkedFeedbackIds.length > 0 && (
                      <button
                        onClick={() => onSelectFeedback(ticket.linkedFeedbackIds[0])}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#5FAFA3', fontSize: 11, marginLeft: 6,
                        }}
                      >
                        {ticket.linkedFeedbackIds.length}↗
                      </button>
                    )}
                  </td>
                  <td>
                    <select
                      value={ticket.status}
                      onChange={e => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                      style={{
                        background: '#232B2E',
                        border: '1px solid #2B3437',
                        borderRadius: 4,
                        padding: '3px 6px',
                        fontSize: 11,
                        color: '#A8B0AE',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      <option value="backlog">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tickets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#737D7A', fontSize: 13 }}>
              No actions yet. Create one from an insight.
            </div>
          )}
        </div>
      )}

      {/* BOARD VIEW */}
      {view === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {COLUMNS.map(col => {
            const colTickets = tickets.filter(t => t.status === col.id);
            return (
              <div key={col.id}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 10,
                  padding: '0 2px',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: STATUS_COLORS[col.id],
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#A8B0AE' }}>{col.label}</span>
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--font-mono)', color: '#737D7A',
                    marginLeft: 'auto',
                  }}>
                    {colTickets.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
                  {colTickets.map(ticket => (
                    <div key={ticket.id} className="surface" style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                          color: '#737D7A',
                        }}>
                          {ticket.id}
                        </span>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: PRIORITY_COLORS[ticket.priority],
                          marginTop: 3, flexShrink: 0,
                        }} />
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 500, color: '#F2F0E9', lineHeight: 1.4, marginBottom: 8 }}>
                        {ticket.title}
                      </div>

                      <div style={{ fontSize: 11, color: '#737D7A', marginBottom: 8 }}>
                        {ticket.impactedUsersCount} users impacted
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: '#737D7A' }}>
                          {ticket.assignedTo?.split(' ')[0] || 'Unassigned'}
                        </span>
                        <select
                          value={ticket.status}
                          onChange={e => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                          onClick={e => e.stopPropagation()}
                          style={{
                            background: '#232B2E',
                            border: '1px solid #2B3437',
                            borderRadius: 3,
                            padding: '2px 4px',
                            fontSize: 10,
                            color: '#A8B0AE',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          <option value="backlog">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {colTickets.length === 0 && (
                    <div style={{
                      border: '1px dashed #2B3437',
                      borderRadius: 5,
                      padding: '20px',
                      textAlign: 'center',
                      fontSize: 11,
                      color: '#737D7A',
                    }}>
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
