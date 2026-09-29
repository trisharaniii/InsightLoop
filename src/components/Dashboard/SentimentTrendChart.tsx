import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import type { FeedbackItem, Release } from '../../types';

interface SentimentTrendChartProps {
  feedbackItems: FeedbackItem[];
  releases: Release[];
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ feedbackItems, releases }) => {
  const chartData = useMemo(() => {
    // Group feedback by day for the last 14 days
    const daysMap: { [dateStr: string]: { date: string; positive: number; negative: number; neutral: number; score: number } } = {};

    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const displayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
      daysMap[key] = { date: displayLabel, positive: 0, negative: 0, neutral: 0, score: 0 };
    }

    feedbackItems.forEach(item => {
      const dateKey = item.timestamp.split('T')[0];
      if (daysMap[dateKey]) {
        if (item.sentiment === 'positive') daysMap[dateKey].positive += 1;
        else if (item.sentiment === 'negative') daysMap[dateKey].negative += 1;
        else daysMap[dateKey].neutral += 1;
      }
    });

    return Object.values(daysMap);
  }, [feedbackItems]);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Customer Sentiment Trajectory</span>
            <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full">
              14-Day Timeline
            </span>
          </h3>
          <p className="text-xs text-gray-400">Tracking daily volume of positive vs negative feedback signals</p>
        </div>

        {/* Release Markers */}
        <div className="flex items-center gap-2 text-xs">
          {releases.map(r => (
            <span key={r.id} className="flex items-center gap-1 bg-[#172033] border border-[#1e293b] px-2 py-1 rounded text-gray-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              {r.version} ({r.title.slice(0, 12)}...)
            </span>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" stroke="#6b7280" tickLine={false} fontSize={11} />
            <YAxis stroke="#6b7280" tickLine={false} fontSize={11} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#f3f4f6' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Area 
              type="monotone" 
              dataKey="positive" 
              name="Positive Feedback" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#posGrad)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="negative" 
              name="Negative / Complaints" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#negGrad)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
