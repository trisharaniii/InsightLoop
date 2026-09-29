import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FeedbackItem } from '../../types';

interface SourceBreakdownProps {
  feedbackItems: FeedbackItem[];
}

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

export const SourceBreakdown: React.FC<SourceBreakdownProps> = ({ feedbackItems }) => {
  const sourceCounts = React.useMemo(() => {
    const map: { [key: string]: number } = {};
    feedbackItems.forEach(item => {
      map[item.source] = (map[item.source] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [feedbackItems]);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Multi-Source Distribution</h3>
        <p className="text-xs text-gray-400">Feedback ingest broken down by channel</p>
      </div>

      <div className="h-52 w-full flex items-center justify-center">
        {sourceCounts.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceCounts}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {sourceCounts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#07090e" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-xs text-gray-500">No source data available</div>
        )}
      </div>
    </div>
  );
};
