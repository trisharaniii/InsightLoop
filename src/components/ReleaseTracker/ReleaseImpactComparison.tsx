import React from 'react';
import { 
  GitCommit, 
  Sparkles,
  ArrowRight,
  MessageSquare,
  Calendar
} from 'lucide-react';
import type { Release, FeedbackItem } from '../../types';

interface ReleaseImpactComparisonProps {
  releases: Release[];
  selectedReleaseId: string;
  onSelectRelease: (releaseId: string) => void;
  feedbackItems: FeedbackItem[];
  onSelectFeedback: (item: FeedbackItem) => void;
  onOpenNewReleaseModal: () => void;
}

export const ReleaseImpactComparison: React.FC<ReleaseImpactComparisonProps> = ({
  releases,
  selectedReleaseId,
  onSelectRelease,
  feedbackItems,
  onSelectFeedback,
  onOpenNewReleaseModal,
}) => {
  const currentRelease = releases.find(r => r.id === selectedReleaseId) || releases[0];

  const taggedFeedback = React.useMemo(() => {
    if (!currentRelease) return [];
    return feedbackItems.filter(f => f.releaseId === currentRelease.id);
  }, [currentRelease, feedbackItems]);

  if (!currentRelease) return null;

  const sentimentDiff = Number((currentRelease.sentimentAfter - currentRelease.sentimentBefore).toFixed(2));
  const issueDiff = currentRelease.issueVolumeAfter - currentRelease.issueVolumeBefore;

  return (
    <div className="space-y-5">
      {/* Top Banner & Selector */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-purple-400" />
              <span>Release & Feature Impact Verification Tracker</span>
            </h3>
            <p className="text-xs text-gray-400">Compare customer sentiment and complaint volume BEFORE vs AFTER product deployments</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentRelease.id}
              onChange={(e) => onSelectRelease(e.target.value)}
              className="bg-[#0f1420] border border-[#1e293b] text-white text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
            >
              {releases.map(rel => (
                <option key={rel.id} value={rel.id}>
                  {rel.version} — {rel.title}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenNewReleaseModal}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow"
            >
              + Log Release
            </button>
          </div>
        </div>

        {/* Selected Release Header Details */}
        <div className="p-4 rounded-xl bg-[#0d1320] border border-purple-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white font-mono">{currentRelease.version}</span>
              <span className="font-semibold text-sm text-purple-300">{currentRelease.title}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                currentRelease.impactStatus === 'positive' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                currentRelease.impactStatus === 'mixed' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {currentRelease.impactStatus} Impact
              </span>
            </div>
            <p className="text-xs text-gray-300">{currentRelease.description}</p>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
              <Calendar className="w-3 h-3 text-purple-400" />
              <span>Deployed: {new Date(currentRelease.releaseDate).toLocaleDateString()}</span>
              <span>•</span>
              <span>Target Areas: {currentRelease.targetAreas.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* BEFORE vs AFTER Metrics Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Sentiment Shift Matrix */}
          <div className="p-4 rounded-xl bg-[#0f1420] border border-[#1e293b] space-y-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              1. Average Customer Sentiment Shift
            </span>
            <div className="flex items-center justify-around py-2 border-y border-[#1e293b]">
              <div className="text-center">
                <span className="text-[10px] text-gray-400 block uppercase">14-Day Before</span>
                <span className="text-xl font-extrabold font-mono text-gray-300">
                  {currentRelease.sentimentBefore > 0 ? `+${currentRelease.sentimentBefore}` : currentRelease.sentimentBefore}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-5 h-5 text-purple-400" />
                <span className={`text-xs font-bold font-mono ${sentimentDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {sentimentDiff >= 0 ? `+${sentimentDiff}` : sentimentDiff}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-gray-400 block uppercase">14-Day After</span>
                <span className={`text-xl font-extrabold font-mono ${currentRelease.sentimentAfter >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentRelease.sentimentAfter > 0 ? `+${currentRelease.sentimentAfter}` : currentRelease.sentimentAfter}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 italic">
              {sentimentDiff >= 0 
                ? `Customer satisfaction surged +${Math.round(sentimentDiff * 100)} points after rollout.` 
                : `Sentiment dropped by ${Math.abs(Math.round(sentimentDiff * 100))} points. Check new regressions below.`}
            </p>
          </div>

          {/* Complaint Volume Shift Matrix */}
          <div className="p-4 rounded-xl bg-[#0f1420] border border-[#1e293b] space-y-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              2. Support Complaint Volume Shift
            </span>
            <div className="flex items-center justify-around py-2 border-y border-[#1e293b]">
              <div className="text-center">
                <span className="text-[10px] text-gray-400 block uppercase">Complaints Before</span>
                <span className="text-xl font-extrabold font-mono text-rose-400">
                  {currentRelease.issueVolumeBefore}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-5 h-5 text-purple-400" />
                <span className={`text-xs font-bold font-mono ${issueDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {issueDiff <= 0 ? `${issueDiff} issues` : `+${issueDiff} issues`}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-gray-400 block uppercase">Complaints After</span>
                <span className={`text-xl font-extrabold font-mono ${currentRelease.issueVolumeAfter < currentRelease.issueVolumeBefore ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentRelease.issueVolumeAfter}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 italic">
              {issueDiff <= 0 
                ? `Successfully resolved ${Math.abs(issueDiff)} recurring customer complaints.` 
                : `Issue volume increased by ${issueDiff} tickets. Urgent QA investigation recommended.`}
            </p>
          </div>
        </div>

        {/* AI Key Insights Bullet Points */}
        {currentRelease.keyInsights && (
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Impact Assessment Takeaways</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-200 pl-4 list-disc">
              {currentRelease.keyInsights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Linked Feedback Items */}
      <div className="glass-panel p-5 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Feedback Signals Tagged to {currentRelease.version} ({taggedFeedback.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {taggedFeedback.map((fb) => (
            <div
              key={fb.id}
              onClick={() => onSelectFeedback(fb)}
              className="p-3.5 rounded-xl bg-[#0f1420] border border-[#1e293b] hover:border-cyan-500/50 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{fb.user.name} ({fb.source})</span>
                <span className={`badge ${
                  fb.sentiment === 'positive' ? 'badge-positive' : 'badge-negative'
                }`}>
                  {fb.sentiment}
                </span>
              </div>
              <p className="text-xs text-gray-300 line-clamp-2 italic">
                "{fb.text}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#1e293b]">
                <span>Category: {fb.category}</span>
                <span className="text-cyan-400 hover:underline">Inspect &rarr;</span>
              </div>
            </div>
          ))}
          {taggedFeedback.length === 0 && (
            <div className="text-xs text-gray-500 col-span-2 text-center py-4">
              No individual feedback entries specifically tagged with this release version.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
