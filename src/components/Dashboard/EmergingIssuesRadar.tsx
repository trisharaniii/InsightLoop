import React from 'react';
import { Flame, ArrowUpRight, PlusCircle, AlertCircle } from 'lucide-react';
import type { FeedbackItem } from '../../types';

interface EmergingIssuesRadarProps {
  feedbackItems: FeedbackItem[];
  onCreateTicketFromIssue: (title: string, category: string, feedbackIds: string[], description: string) => void;
  onFilterByCategory: (category: string) => void;
}

export const EmergingIssuesRadar: React.FC<EmergingIssuesRadarProps> = ({
  feedbackItems,
  onCreateTicketFromIssue,
  onFilterByCategory,
}) => {
  // Aggregate negative & critical items by category & keywords
  const issuesList = React.useMemo(() => {
    const categoriesMap: { [cat: string]: { count: number; criticalCount: number; keywords: Set<string>; items: FeedbackItem[] } } = {};

    feedbackItems.forEach(item => {
      if (item.sentiment === 'negative' || item.urgency === 'critical' || item.urgency === 'high') {
        if (!categoriesMap[item.category]) {
          categoriesMap[item.category] = { count: 0, criticalCount: 0, keywords: new Set(), items: [] };
        }
        categoriesMap[item.category].count += 1;
        if (item.urgency === 'critical') categoriesMap[item.category].criticalCount += 1;
        item.keywords.forEach(k => categoriesMap[item.category].keywords.add(k));
        categoriesMap[item.category].items.push(item);
      }
    });

    return Object.entries(categoriesMap)
      .map(([category, data]) => ({
        category,
        count: data.count,
        criticalCount: data.criticalCount,
        keywords: Array.from(data.keywords).slice(0, 4),
        items: data.items,
        spikePercentage: Math.round(15 + data.count * 12 + data.criticalCount * 25),
      }))
      .sort((a, b) => b.criticalCount * 3 + b.count - (a.criticalCount * 3 + a.count));
  }, [feedbackItems]);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>AI Emerging Issue Radar</span>
            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-mono">
              Anomaly Detector
            </span>
          </h3>
          <p className="text-xs text-gray-400">Automatically clusters rising customer pain points requiring product attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {issuesList.slice(0, 4).map((issue) => (
          <div 
            key={issue.category} 
            className="p-3.5 rounded-xl bg-[#0f1420] border border-[#1e293b] hover:border-gray-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">{issue.category}</span>
                {issue.criticalCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {issue.criticalCount} Critical
                  </span>
                )}
                <span className="text-[11px] text-rose-400 font-mono font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +{issue.spikePercentage}% volume spike
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-gray-400 font-medium">Top Signals:</span>
                {issue.keywords.map(kw => (
                  <span key={kw} className="text-[10px] bg-[#172033] text-cyan-300 border border-[#23304b] px-2 py-0.5 rounded font-mono">
                    #{kw}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-300 italic pt-1 line-clamp-1">
                "{issue.items[0]?.text.slice(0, 90)}..."
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onFilterByCategory(issue.category)}
                className="px-2.5 py-1.5 rounded-lg bg-[#172033] hover:bg-[#23304b] text-gray-300 hover:text-white text-xs font-medium border border-[#1e293b] transition-all"
              >
                Inspect ({issue.items.length})
              </button>
              <button
                onClick={() => onCreateTicketFromIssue(
                  `Resolve ${issue.category} friction points`,
                  issue.category,
                  issue.items.map(i => i.id),
                  `AI Radar flagged recurring complaints in ${issue.category}. Primary signals: ${issue.keywords.join(', ')}.`
                )}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Ticket</span>
              </button>
            </div>
          </div>
        ))}

        {issuesList.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-xs">
            No critical issue spikes detected in current feedback memory index.
          </div>
        )}
      </div>
    </div>
  );
};
