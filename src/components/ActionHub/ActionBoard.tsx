import React from 'react';
import { 
  Kanban, 
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ActionTicket, TicketStatus } from '../../types';

interface ActionBoardProps {
  tickets: ActionTicket[];
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onOpenCreateTicketModal: () => void;
  onSelectFeedback: (feedbackId: string) => void;
}

const STATUS_COLUMNS: { id: TicketStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog (From Insights)', color: 'border-gray-700 text-gray-400' },
  { id: 'in_progress', label: 'In Development', color: 'border-blue-700 text-blue-400' },
  { id: 'in_review', label: 'QA / Review', color: 'border-purple-700 text-purple-400' },
  { id: 'resolved', label: 'Resolved in Release', color: 'border-emerald-700 text-emerald-400' },
];

export const ActionBoard: React.FC<ActionBoardProps> = ({
  tickets,
  onUpdateTicketStatus,
  onOpenCreateTicketModal,
  onSelectFeedback,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    onUpdateTicketStatus(ticketId, newStatus);
    if (newStatus === 'resolved') {
      triggerConfetti();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-amber-400" />
            <span>Action Hub — Closing the Feedback Loop</span>
          </h3>
          <p className="text-xs text-gray-400">Transform AI customer insights directly into prioritizeable product backlog tickets</p>
        </div>

        <button
          onClick={onOpenCreateTicketModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Product Ticket</span>
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const colTickets = tickets.filter(t => t.status === col.id);

          return (
            <div key={col.id} className="glass-panel p-3.5 space-y-3 flex flex-col justify-between">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#121826] text-gray-300 border border-[#1e293b]">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 min-h-[300px]">
                {colTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3.5 rounded-xl bg-[#0f1420] border border-[#1e293b] hover:border-gray-500 transition-all space-y-2.5 relative group"
                  >
                    {/* Header: Priority & Category */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ticket.priority.startsWith('P0') ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' :
                        ticket.priority.startsWith('P1') ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{ticket.id}</span>
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h4 className="font-bold text-xs text-white leading-snug">{ticket.title}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Evidence & Impacted count */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#1e293b]">
                      <span className="text-cyan-400 font-semibold font-mono">
                        {ticket.impactedUsersCount} Users Impacted
                      </span>
                      {ticket.linkedFeedbackIds.length > 0 ? (
                        <button
                          onClick={() => onSelectFeedback(ticket.linkedFeedbackIds[0])}
                          className="text-xs text-purple-300 hover:text-purple-200 underline font-medium"
                        >
                          {ticket.linkedFeedbackIds.length} Evidence &rarr;
                        </button>
                      ) : (
                        <span className="text-gray-500">0 Evidence</span>
                      )}
                    </div>

                    {/* Assignee & Status Change */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-gray-400 italic">
                        {ticket.assignedTo ? ticket.assignedTo : 'Unassigned'}
                      </span>

                      {/* Status Dropdown */}
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                        className="bg-[#172033] border border-[#23304b] text-[10px] text-gray-200 rounded px-1.5 py-0.5 font-semibold cursor-pointer"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in_progress">In Dev</option>
                        <option value="in_review">In Review</option>
                        <option value="resolved">Resolved ✓</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colTickets.length === 0 && (
                  <div className="text-center py-10 text-xs text-gray-500 italic">
                    No tickets in {col.label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
