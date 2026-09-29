import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Plus } from 'lucide-react';

const SOURCES = [
  {
    id: 'google-play',
    name: 'Google Play',
    category: 'App Store',
    status: 'connected',
    lastSynced: '2 hours ago',
    feedbackCount: 4821,
    icon: '▶',
    color: '#6FAF8F',
  },
  {
    id: 'app-store',
    name: 'App Store',
    category: 'App Store',
    status: 'connected',
    lastSynced: '2 hours ago',
    feedbackCount: 3102,
    icon: '◆',
    color: '#6FAF8F',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'Support',
    status: 'connected',
    lastSynced: '45 minutes ago',
    feedbackCount: 2184,
    icon: 'Z',
    color: '#6FAF8F',
  },
  {
    id: 'intercom',
    name: 'Intercom',
    category: 'Support',
    status: 'syncing',
    lastSynced: 'Syncing now…',
    feedbackCount: 1247,
    icon: 'I',
    color: '#D1A45B',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    category: 'Social',
    status: 'connected',
    lastSynced: '6 hours ago',
    feedbackCount: 742,
    icon: 'X',
    color: '#6FAF8F',
  },
  {
    id: 'csv',
    name: 'CSV Uploads',
    category: 'Import',
    status: 'connected',
    lastSynced: 'On demand',
    feedbackCount: 386,
    icon: '≡',
    color: '#6FAF8F',
  },
];

export const DataSourcesPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const handleRefresh = (id: string) => {
    setRefreshing(id);
    setTimeout(() => setRefreshing(null), 2000);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#F2F0E9', letterSpacing: '-0.3px', marginBottom: 6 }}>
            Data Sources
          </h1>
          <p style={{ fontSize: 13, color: '#737D7A' }}>
            {SOURCES.filter(s => s.status === 'connected').length} of {SOURCES.length} sources connected
          </p>
        </div>
        <button className="btn btn-secondary">
          <Plus size={13} />
          Add source
        </button>
      </div>

      {/* Sources table */}
      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Category</th>
              <th>Status</th>
              <th>Last synced</th>
              <th style={{ textAlign: 'right' }}>Feedback</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map(source => (
              <tr key={source.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 5,
                      background: '#232B2E',
                      border: '1px solid #2B3437',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#A8B0AE',
                      flexShrink: 0,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {source.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#F2F0E9' }}>{source.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 12, color: '#737D7A' }}>{source.category}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {source.status === 'connected' ? (
                      <>
                        <CheckCircle size={13} style={{ color: '#6FAF8F' }} />
                        <span style={{ fontSize: 12, color: '#6FAF8F' }}>Connected</span>
                      </>
                    ) : source.status === 'syncing' ? (
                      <>
                        <RefreshCw size={13} style={{ color: '#D1A45B', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: 12, color: '#D1A45B' }}>Syncing</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} style={{ color: '#C96D67' }} />
                        <span style={{ fontSize: 12, color: '#C96D67' }}>Disconnected</span>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 12, color: '#737D7A' }}>{source.lastSynced}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#F2F0E9' }}>
                    {source.feedbackCount.toLocaleString()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleRefresh(source.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #2B3437',
                        borderRadius: 4,
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#737D7A',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Refresh"
                    >
                      <RefreshCw
                        size={12}
                        style={{
                          animation: refreshing === source.id ? 'spin 1s linear infinite' : 'none',
                        }}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        background: '#1D2427',
        border: '1px solid #2B3437',
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 20,
      }}>
        {[
          { label: 'Total indexed', value: '12,482' },
          { label: 'Auto-synced', value: '4 sources' },
          { label: 'Last full sync', value: '2h ago' },
        ].map((stat, i) => (
          <div key={stat.label} style={{
            padding: '14px 20px',
            borderRight: i < 2 ? '1px solid #2B3437' : 'none',
          }}>
            <div style={{ fontSize: 10, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#F2F0E9' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
