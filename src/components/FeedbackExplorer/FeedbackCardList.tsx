import React from 'react';
import { 
  Star, 
  MessageSquare, 
  ExternalLink, 
  Sparkles,
  Plus,
  GitCommit
} from 'lucide-react';
import type { FeedbackItem, Release } from '../../types';

interface FeedbackCardListProps {
  items: FeedbackItem[];
  releases: Release[];
  onSelectFeedback: (item: FeedbackItem) => void;
  onCreateTicket: (item: FeedbackItem) => void;
}

export const FeedbackCardList: React.FC<FeedbackCardListProps> = ({
  items,
  releases,
  onSelectFeedback,
  onCreateTicket,
}) => {
  if (items.length === 0) {
    return (
      <div className="glass-panel p-12 text-center space-y-3">
        <MessageSquare className="w-10 h-10 text-gray-500 mx-auto animate-bounce" />
        <h4 className="text-base font-semibold text-white">No Customer Feedback Matches Filters</h4>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Try broadening your search criteria or ingest new feedback entries using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const linkedRelease = releases.find(r => r.id === item.releaseId);

        return (
          <div
            key={item.id}
            className="glass-panel glass-panel-hover p-4 flex flex-col justify-between space-y-3 relative group"
          >
            {/* Top Bar: User & Source Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow">
                  {item.user.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{item.user.name}</span>
                    {item.user.segment && (
                      <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded font-mono">
                        {item.user.segment}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {item.user.role ? item.user.role : `${item.source} • ${new Date(item.timestamp).toLocaleDateString()}`}
                  </span>
                </div>
              </div>

              {/* Source Badge */}
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#172033] text-gray-300 border border-[#23304b]">
                {item.source}
              </span>
            </div>

            {/* Middle: Rating stars & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Rating stars */}
              {item.rating && (
                <div className="flex items-center gap-0.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded text-[11px]">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="font-bold">{item.rating}/5</span>
                </div>
              )}

              {/* Sentiment badge */}
              <span className={`badge ${
                item.sentiment === 'positive' ? 'badge-positive' :
                item.sentiment === 'negative' ? 'badge-negative' :
                item.sentiment === 'mixed' ? 'badge-mixed' : 'badge-neutral'
              }`}>
                {item.sentiment} ({item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore})
              </span>

              {/* Urgency Badge */}
              <span className={`badge ${
                item.urgency === 'critical' ? 'badge-critical' :
                item.urgency === 'high' ? 'badge-high' :
                item.urgency === 'medium' ? 'badge-medium' : 'badge-low'
              }`}>
                {item.urgency}
              </span>

              {/* Linked Release Tag */}
              {linkedRelease && (
                <span className="flex items-center gap-1 text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
                  <GitCommit className="w-3 h-3" />
                  {linkedRelease.version}
                </span>
              )}
            </div>

            {/* Text content */}
            <p className="text-xs text-gray-200 leading-relaxed font-sans line-clamp-3">
              "{item.text}"
            </p>

            {/* AI Summary Banner */}
            <div className="p-2.5 rounded-lg bg-[#0d1320] border border-cyan-900/30 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                <Sparkles className="w-3 h-3" />
                <span>AI Insight & Suggested Action</span>
              </div>
              <p className="text-[11px] text-gray-300 italic">
                {item.aiSummary}
              </p>
            </div>

            {/* Keywords */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {item.keywords.map(kw => (
                <span key={kw} className="text-[10px] bg-[#121826] text-gray-400 border border-[#1e293b] px-2 py-0.5 rounded font-mono">
                  #{kw}
                </span>
              ))}
            </div>

            {/* Footer buttons */}
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400">
                ID: {item.id}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCreateTicket(item)}
                  className="px-2.5 py-1 rounded bg-[#172033] hover:bg-[#23304b] text-cyan-300 border border-cyan-800/50 text-[11px] font-medium flex items-center gap-1 transition-all"
                  title="Convert insight to Jira/Linear ticket"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ticket</span>
                </button>
                <button
                  onClick={() => onSelectFeedback(item)}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow transition-all"
                >
                  <span>Inspect</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
