import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import type { FilterState, Release } from '../../types';

interface FeedbackFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  releases: Release[];
  totalResultsCount: number;
}

export const FeedbackFilterBar: React.FC<FeedbackFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  releases,
  totalResultsCount,
}) => {
  const isFiltered = filters.search || filters.source || filters.sentiment || filters.urgency || filters.category || filters.releaseId;

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedback text, user name, keywords, complaints..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full bg-[#0f1420] border border-[#1e293b] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-medium">Matching Signals:</span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
            {totalResultsCount} items
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-950/30 border border-amber-800/40"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Source Filter */}
        <select
          value={filters.source}
          onChange={(e) => onFilterChange({ source: e.target.value })}
          className="bg-[#0f1420] border border-[#1e293b] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
        >
          <option value="">All Sources</option>
          <option value="App Store">App Store</option>
          <option value="Google Play">Google Play</option>
          <option value="Zendesk">Zendesk Tickets</option>
          <option value="Intercom">Intercom Chat</option>
          <option value="Twitter/X">Twitter/X</option>
          <option value="Survey">Typeform Survey</option>
          <option value="CSV Upload">CSV Imports</option>
        </select>

        {/* Sentiment Filter */}
        <select
          value={filters.sentiment}
          onChange={(e) => onFilterChange({ sentiment: e.target.value })}
          className="bg-[#0f1420] border border-[#1e293b] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive (+)</option>
          <option value="negative">Negative (-)</option>
          <option value="neutral">Neutral (0)</option>
          <option value="mixed">Mixed (~)</option>
        </select>

        {/* Urgency Filter */}
        <select
          value={filters.urgency}
          onChange={(e) => onFilterChange({ urgency: e.target.value })}
          className="bg-[#0f1420] border border-[#1e293b] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
        >
          <option value="">All Urgencies</option>
          <option value="critical">Critical (P0)</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="bg-[#0f1420] border border-[#1e293b] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
        >
          <option value="">All Feature Areas</option>
          <option value="Checkout & Billing">Checkout & Billing</option>
          <option value="Bugs & Crashes">Bugs & Crashes</option>
          <option value="UI & Usability">UI & Usability</option>
          <option value="Performance & Speed">Performance & Speed</option>
          <option value="Security & Auth">Security & Auth</option>
          <option value="Onboarding">Onboarding</option>
          <option value="Feature Request">Feature Request</option>
        </select>

        {/* Linked Release Filter */}
        <select
          value={filters.releaseId}
          onChange={(e) => onFilterChange({ releaseId: e.target.value })}
          className="bg-[#0f1420] border border-[#1e293b] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
        >
          <option value="">All Releases</option>
          {releases.map(rel => (
            <option key={rel.id} value={rel.id}>
              {rel.version} - {rel.title.slice(0, 16)}...
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
