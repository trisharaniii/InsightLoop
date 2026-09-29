import React from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  ShieldAlert,
  Smile,
  Frown
} from 'lucide-react';
import type { FeedbackItem, Release } from '../../types';

interface MetricsOverviewProps {
  feedbackItems: FeedbackItem[];
  releases: Release[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ feedbackItems, releases }) => {
  const totalCount = feedbackItems.length;

  const posCount = feedbackItems.filter(f => f.sentiment === 'positive').length;
  const negCount = feedbackItems.filter(f => f.sentiment === 'negative').length;
  const neuCount = feedbackItems.filter(f => f.sentiment === 'neutral').length;
  const mixCount = feedbackItems.filter(f => f.sentiment === 'mixed').length;

  // Net Sentiment Score (NSS) = % Positive - % Negative (-100 to +100)
  const nss = totalCount > 0 ? Math.round(((posCount - negCount) / totalCount) * 100) : 0;

  const criticalCount = feedbackItems.filter(f => f.urgency === 'critical').length;
  const highCount = feedbackItems.filter(f => f.urgency === 'high').length;

  const latestRelease = releases[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Feedback & Volume */}
      <div className="glass-panel glass-panel-hover p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Feedback Memory</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">{totalCount}</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            +18% this week
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400 border-t border-[#1e293b] pt-2">
          <span className="text-emerald-400 font-semibold">{posCount} Positive</span>
          <span>•</span>
          <span className="text-rose-400 font-semibold">{negCount} Negative</span>
          <span>•</span>
          <span className="text-gray-400">{neuCount + mixCount} Other</span>
        </div>
      </div>

      {/* 2. Net Sentiment Score (NSS) */}
      <div className="glass-panel glass-panel-hover p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Sentiment Score (NSS)</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${nss >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {nss >= 0 ? <Smile className="w-4 h-4" /> : <Frown className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold font-mono ${nss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {nss > 0 ? `+${nss}` : nss}
          </span>
          <span className="text-xs text-gray-400">(-100 to +100)</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-[#1e293b] pt-2">
          <span>Target Benchmark: &gt; +30</span>
          <span className={`font-semibold ${nss >= 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {nss >= 30 ? 'Healthy' : 'Needs Focus'}
          </span>
        </div>
      </div>

      {/* 3. Emerging Critical Issues */}
      <div className="glass-panel glass-panel-hover p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emerging Critical Threats</span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-400 font-mono">{criticalCount}</span>
          <span className="text-xs text-amber-400 font-semibold flex items-center gap-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {highCount} High Priority
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] border-t border-[#1e293b] pt-2">
          <span className="text-gray-400">Action Required</span>
          <span className="text-rose-400 font-semibold animate-pulse">Immediate Review</span>
        </div>
      </div>

      {/* 4. Release Impact Velocity */}
      <div className="glass-panel glass-panel-hover p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Release Impact</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-white font-mono">{latestRelease ? latestRelease.version : 'v2.4.0'}</span>
          {latestRelease && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              latestRelease.impactStatus === 'positive' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              latestRelease.impactStatus === 'mixed' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {latestRelease.impactStatus.toUpperCase()}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-[#1e293b] pt-2">
          <span>Sentiment Shift:</span>
          {latestRelease ? (
            <span className={`font-mono font-bold ${latestRelease.sentimentAfter > latestRelease.sentimentBefore ? 'text-emerald-400' : 'text-rose-400'}`}>
              {latestRelease.sentimentBefore > 0 ? `+${latestRelease.sentimentBefore}` : latestRelease.sentimentBefore} → {latestRelease.sentimentAfter > 0 ? `+${latestRelease.sentimentAfter}` : latestRelease.sentimentAfter}
            </span>
          ) : (
            <span className="text-emerald-400 font-mono font-bold">+0.28</span>
          )}
        </div>
      </div>
    </div>
  );
};
