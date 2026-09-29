import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import type { FeedbackItem, FilterState, Release } from '../../types';

interface FeedbackExplorerProps {
  feedbackItems: FeedbackItem[];
  releases: Release[];
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onCreateTicket: (item: FeedbackItem) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  'App Store': 'App Store',
  'Google Play': 'Play Store',
  'Zendesk': 'Zendesk',
  'Intercom': 'Intercom',
  'Twitter/X': 'Twitter/X',
  'Survey': 'Survey',
  'CSV Upload': 'CSV',
  'Manual': 'Manual',
};

function SentimentBadge({ value }: { value: string }) {
  const cls =
    value === 'positive' ? 'badge badge-positive'
    : value === 'negative' ? 'badge badge-negative'
    : value === 'mixed' ? 'badge badge-mixed'
    : 'badge badge-neutral';
  return <span className={cls}>{value}</span>;
}

function UrgencyBadge({ value }: { value: string }) {
  const cls =
    value === 'critical' ? 'badge badge-critical'
    : value === 'high' ? 'badge badge-high'
    : value === 'medium' ? 'badge badge-medium'
    : 'badge badge-low';
  return <span className={cls}>{value}</span>;
}

type SortKey = 'timestamp' | 'user.name' | 'sentiment' | 'urgency';

export const FeedbackExplorer: React.FC<FeedbackExplorerProps> = ({
  feedbackItems,
  releases: _releases,
  filters,
  onFilterChange,
  onResetFilters,
  onCreateTicket,
}) => {
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const isFiltered = !!(filters.search || filters.source || filters.sentiment || filters.urgency || filters.category || filters.releaseId);

  const filtered = useMemo(() => {
    let items = [...feedbackItems];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(i =>
        i.text.toLowerCase().includes(s) ||
        i.user.name.toLowerCase().includes(s) ||
        i.aiSummary.toLowerCase().includes(s) ||
        i.keywords.some(k => k.toLowerCase().includes(s))
      );
    }
    if (filters.source) items = items.filter(i => i.source === filters.source);
    if (filters.sentiment) items = items.filter(i => i.sentiment === filters.sentiment);
    if (filters.urgency) items = items.filter(i => i.urgency === filters.urgency);
    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.releaseId) items = items.filter(i => i.releaseId === filters.releaseId);

    items.sort((a, b) => {
      let aVal: string, bVal: string;
      if (sortKey === 'user.name') { aVal = a.user.name; bVal = b.user.name; }
      else { aVal = a[sortKey] as string; bVal = b[sortKey] as string; }
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return items;
  }, [feedbackItems, filters, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown size={11} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={11} style={{ color: '#5FAFA3' }} /> : <ChevronDown size={11} style={{ color: '#5FAFA3' }} />;
  };

  const headerBtn = (label: string, k: SortKey) => (
    <button
      onClick={() => toggleSort(k)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#737D7A', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'flex', alignItems: 'center', gap: 3, padding: 0,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {label}
      <SortIcon k={k} />
    </button>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 49px)', overflow: 'hidden' }}>
      {/* Main Table Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Page Header + Filters */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F2F0E9', marginBottom: 2 }}>
              Feedback Explorer
            </h1>
            <p style={{ fontSize: 12, color: '#737D7A' }}>
              {filtered.length.toLocaleString()} records
              {isFiltered ? ' (filtered)' : ''}
            </p>
          </div>

          {/* Filter bar */}
          <div style={{
            background: '#1D2427',
            border: '1px solid #2B3437',
            borderRadius: 6,
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 0,
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#737D7A' }} />
              <input
                value={filters.search}
                onChange={e => onFilterChange({ search: e.target.value })}
                placeholder="Search feedback, themes, customers…"
                style={{
                  width: '100%',
                  paddingLeft: 28,
                  paddingRight: filters.search ? 28 : 10,
                  height: 30,
                  fontSize: 12,
                  background: '#171C1F',
                  border: '1px solid #2B3437',
                  borderRadius: 4,
                }}
              />
              {filters.search && (
                <button
                  onClick={() => onFilterChange({ search: '' })}
                  style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#737D7A', display: 'flex' }}
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Dropdowns */}
            {([
              { key: 'source', placeholder: 'Source', options: ['App Store', 'Google Play', 'Zendesk', 'Intercom', 'Twitter/X', 'Survey', 'CSV Upload'] },
              { key: 'sentiment', placeholder: 'Sentiment', options: ['positive', 'negative', 'neutral', 'mixed'] },
              { key: 'urgency', placeholder: 'Priority', options: ['critical', 'high', 'medium', 'low'] },
              { key: 'category', placeholder: 'Topic', options: ['Checkout & Billing', 'Performance & Speed', 'UI & Usability', 'Bugs & Crashes', 'Feature Request', 'Onboarding', 'Security & Auth'] },
            ] as Array<{ key: keyof FilterState; placeholder: string; options: string[] }>).map(f => (
              <select
                key={f.key}
                value={filters[f.key] || ''}
                onChange={e => onFilterChange({ [f.key]: e.target.value })}
                style={{
                  height: 30,
                  fontSize: 12,
                  background: filters[f.key] ? '#232B2E' : '#171C1F',
                  border: `1px solid ${filters[f.key] ? '#5FAFA3' : '#2B3437'}`,
                  borderRadius: 4,
                  color: filters[f.key] ? '#F2F0E9' : '#A8B0AE',
                  paddingLeft: 8,
                  paddingRight: 20,
                  cursor: 'pointer',
                  minWidth: 90,
                }}
              >
                <option value="">{f.placeholder}</option>
                {f.options.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ))}

            {isFiltered && (
              <button
                onClick={onResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#737D7A',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '3px 6px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                <X size={11} />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 160 }}>{headerBtn('Customer', 'user.name')}</th>
                <th>Feedback</th>
                <th style={{ width: 90 }}>Source</th>
                <th style={{ width: 90 }}>{headerBtn('Sentiment', 'sentiment')}</th>
                <th style={{ width: 160 }}>Theme</th>
                <th style={{ width: 90 }}>{headerBtn('Priority', 'urgency')}</th>
                <th style={{ width: 80 }}>Conf.</th>
                <th style={{ width: 90 }}>{headerBtn('Date', 'timestamp')}</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{ background: selectedItem?.id === item.id ? '#1D2427' : undefined }}
                >
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#F2F0E9', marginBottom: 1 }}>
                      {item.user.name}
                    </div>
                    {item.user.segment && (
                      <div style={{ fontSize: 10, color: '#737D7A' }}>{item.user.segment}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.4, maxWidth: 340 }}
                      title={item.text}
                    >
                      {item.text.length > 80 ? item.text.slice(0, 80) + '…' : item.text}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: '#737D7A' }}>
                      {SOURCE_LABELS[item.source] || item.source}
                    </span>
                  </td>
                  <td><SentimentBadge value={item.sentiment} /></td>
                  <td>
                    <span style={{ fontSize: 11, color: '#A8B0AE' }}>{item.category}</span>
                  </td>
                  <td><UrgencyBadge value={item.urgency} /></td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: item.sentimentScore > 0.5 ? '#6FAF8F' : item.sentimentScore < -0.5 ? '#C96D67' : '#737D7A',
                    }}>
                      {Math.round(Math.abs(item.sentimentScore) * 100)}%
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: '#737D7A' }}>
                      {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td>
                    <ArrowRight size={12} style={{ color: '#737D7A' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#737D7A', fontSize: 13 }}>
              No feedback matches the current filters.
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer */}
      {selectedItem && (
        <div style={{
          width: 360,
          borderLeft: '1px solid #2B3437',
          background: '#171C1F',
          overflowY: 'auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #2B3437',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'sticky',
            top: 0,
            background: '#171C1F',
            zIndex: 10,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F2F0E9', marginBottom: 2 }}>
                {selectedItem.user.name}
              </div>
              <div style={{ fontSize: 11, color: '#737D7A' }}>
                {selectedItem.source} · {new Date(selectedItem.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737D7A', display: 'flex', padding: 2 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Original Feedback */}
            <section>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Original feedback
              </div>
              <p style={{
                fontSize: 13,
                color: '#F2F0E9',
                lineHeight: 1.6,
                background: '#1D2427',
                border: '1px solid #2B3437',
                borderRadius: 5,
                padding: '10px 12px',
              }}>
                "{selectedItem.text}"
              </p>
            </section>

            {/* AI Summary */}
            {selectedItem.aiSummary && (
              <section>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  AI summary
                </div>
                <p style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.6 }}>
                  {selectedItem.aiSummary}
                </p>
              </section>
            )}

            {/* Metadata grid */}
            <section>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                Analysis
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Sentiment', value: <SentimentBadge value={selectedItem.sentiment} /> },
                  { label: 'Priority', value: <UrgencyBadge value={selectedItem.urgency} /> },
                  { label: 'Topic', value: <span style={{ fontSize: 12, color: '#A8B0AE' }}>{selectedItem.category}</span> },
                  { label: 'Status', value: <span style={{ fontSize: 12, color: '#A8B0AE', textTransform: 'capitalize' }}>{selectedItem.status}</span> },
                  { label: 'Confidence', value: <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#6FAF8F' }}>{Math.round(Math.abs(selectedItem.sentimentScore) * 100)}%</span> },
                  { label: 'Source', value: <span style={{ fontSize: 12, color: '#A8B0AE' }}>{SOURCE_LABELS[selectedItem.source]}</span> },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: 10, color: '#737D7A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 500 }}>
                      {row.label}
                    </div>
                    {row.value}
                  </div>
                ))}
              </div>
            </section>

            {/* Keywords */}
            {selectedItem.keywords.length > 0 && (
              <section>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Themes
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {selectedItem.keywords.map(k => (
                    <span key={k} style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: '#1D2427',
                      border: '1px solid #2B3437',
                      color: '#A8B0AE',
                    }}>
                      {k}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Suggested action */}
            {selectedItem.suggestedAction && (
              <section>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Suggested action
                </div>
                <p style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.6, marginBottom: 12 }}>
                  {selectedItem.suggestedAction}
                </p>
                <button
                  onClick={() => onCreateTicket(selectedItem)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Create action ticket
                </button>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
