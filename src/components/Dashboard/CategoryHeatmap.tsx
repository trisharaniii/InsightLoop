import React from 'react';
import type { CategoryType, FeedbackItem } from '../../types';

interface CategoryHeatmapProps {
  feedbackItems: FeedbackItem[];
  onSelectCategory: (cat: string) => void;
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

export const CategoryHeatmap: React.FC<CategoryHeatmapProps> = ({ feedbackItems, onSelectCategory }) => {
  const categoryStats = React.useMemo(() => {
    return CATEGORIES.map(cat => {
      const items = feedbackItems.filter(f => f.category === cat);
      const total = items.length;
      const pos = items.filter(f => f.sentiment === 'positive').length;
      const neg = items.filter(f => f.sentiment === 'negative').length;
      const nss = total > 0 ? Math.round(((pos - neg) / total) * 100) : 0;

      return {
        category: cat,
        total,
        pos,
        neg,
        nss,
      };
    }).sort((a, b) => b.total - a.total);
  }, [feedbackItems]);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Feature Area Intelligence Matrix</h3>
        <p className="text-xs text-gray-400">Volume & Net Sentiment Score by product module</p>
      </div>

      <div className="space-y-2.5">
        {categoryStats.map(stat => (
          <div 
            key={stat.category}
            onClick={() => onSelectCategory(stat.category)}
            className="p-2.5 rounded-lg bg-[#0f1420] border border-[#1e293b] hover:border-cyan-500/40 cursor-pointer transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-200">{stat.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono">{stat.total} items</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                  stat.nss > 20 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  stat.nss >= 0 ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                  'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  NSS {stat.nss > 0 ? `+${stat.nss}` : stat.nss}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#172033] rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${stat.total > 0 ? (stat.pos / stat.total) * 100 : 0}%` }} 
                title={`${stat.pos} Positive`}
              />
              <div 
                className="h-full bg-rose-500" 
                style={{ width: `${stat.total > 0 ? (stat.neg / stat.total) * 100 : 0}%` }} 
                title={`${stat.neg} Negative`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
