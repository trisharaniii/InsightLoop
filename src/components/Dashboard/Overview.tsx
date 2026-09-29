import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import type { FeedbackItem, Release } from '../../types';

interface OverviewProps {
  feedbackItems: FeedbackItem[];
  releases: Release[];
  onNavigate: (tab: string) => void;
}

const EMERGING_ISSUES = [
  { name: 'Payment failures', mentions: 2184, change: 184, severity: 'critical' },
  { name: 'Refund delays', mentions: 742, change: 42, severity: 'high' },
  { name: 'KYC verification', mentions: 431, change: 31, severity: 'medium' },
  { name: 'App load speed', mentions: 318, change: 19, severity: 'medium' },
  { name: '2FA SMS timeouts', mentions: 284, change: 67, severity: 'high' },
];

function getSentimentData(feedbackItems: FeedbackItem[]) {
  const daysMap: Record<string, { date: string; positive: number; negative: number; neutral: number }> = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    daysMap[key] = { date: label, positive: 0, negative: 0, neutral: 0 };
  }
  feedbackItems.forEach(item => {
    const key = item.timestamp.split('T')[0];
    if (daysMap[key]) {
      if (item.sentiment === 'positive') daysMap[key].positive++;
      else if (item.sentiment === 'negative') daysMap[key].negative++;
      else daysMap[key].neutral++;
    }
  });
  return Object.values(daysMap);
}

type Range = '7D' | '30D' | '90D' | '6M';

export const Overview: React.FC<OverviewProps> = ({ feedbackItems, releases, onNavigate }) => {
  const [sentimentRange, setSentimentRange] = useState<Range>('30D');

  const totalCount = feedbackItems.length;
  const analyzed = feedbackItems.filter(f => f.aiSummary).length;
  const posCount = feedbackItems.filter(f => f.sentiment === 'positive').length;
  const negCount = feedbackItems.filter(f => f.sentiment === 'negative').length;
  const nss = totalCount > 0 ? Math.round(((posCount - negCount) / totalCount) * 100) : 0;
  const criticalCount = feedbackItems.filter(f => f.urgency === 'critical').length;
  const featureRequests = feedbackItems.filter(f => f.category === 'Feature Request').length;

  const chartData = useMemo(() => getSentimentData(feedbackItems), [feedbackItems]);

  const metrics = [
    { label: 'Total Feedback', value: totalCount.toLocaleString(), sub: 'All sources', positive: true },
    { label: 'AI Analyzed', value: analyzed.toLocaleString(), sub: `${totalCount > 0 ? Math.round((analyzed / totalCount) * 100) : 0}% coverage`, positive: true },
    { label: 'Net Sentiment', value: nss > 0 ? `+${nss}` : `${nss}`, sub: nss >= 30 ? 'Healthy' : 'Needs attention', positive: nss >= 0 },
    { label: 'Critical Issues', value: criticalCount.toString(), sub: 'Require action', positive: false },
    { label: 'Feature Requests', value: featureRequests.toString(), sub: 'Open items', positive: true },
  ];

  const severityColors: Record<string, string> = {
    critical: '#C96D67',
    high: '#D1A45B',
    medium: '#5FAFA3',
    low: '#737D7A',
  };

  const latestRelease = releases[0];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22,
          fontWeight: 600,
          color: '#F2F0E9',
          letterSpacing: '-0.3px',
          marginBottom: 6,
        }}>
          Customer Feedback Intelligence
        </h1>
        <p style={{ fontSize: 13, color: '#A8B0AE', lineHeight: 1.5 }}>
          Understand what customers are saying, what is changing, and what needs attention.
        </p>
      </div>

      {/* Key Metrics — compact row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0,
        background: '#1D2427',
        border: '1px solid #2B3437',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              padding: '16px 20px',
              borderRight: i < metrics.length - 1 ? '1px solid #2B3437' : 'none',
            }}
          >
            <div style={{ fontSize: 11, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, marginBottom: 8 }}>
              {m.label}
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.5px',
              color: m.label === 'Critical Issues' ? '#C96D67' : m.label === 'Net Sentiment' ? (nss >= 0 ? '#6FAF8F' : '#C96D67') : '#F2F0E9',
              marginBottom: 4,
            }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: '#737D7A' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main content: Sentiment chart + Emerging issues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
        {/* Sentiment Chart */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F2F0E9', marginBottom: 2 }}>
                Customer sentiment over time
              </div>
              <div style={{ fontSize: 11, color: '#737D7A' }}>
                Daily volume of positive vs negative feedback
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['7D', '30D', '90D', '6M'] as Range[]).map(r => (
                <button
                  key={r}
                  onClick={() => setSentimentRange(r)}
                  style={{
                    background: sentimentRange === r ? '#232B2E' : 'none',
                    border: '1px solid',
                    borderColor: sentimentRange === r ? '#2B3437' : 'transparent',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 11,
                    color: sentimentRange === r ? '#F2F0E9' : '#737D7A',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6FAF8F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6FAF8F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C96D67" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#C96D67" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#2B3437" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="none"
                  tick={{ fill: '#737D7A', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  stroke="none"
                  tick={{ fill: '#737D7A', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#232B2E',
                    border: '1px solid #2B3437',
                    borderRadius: 5,
                    fontSize: 11,
                    color: '#F2F0E9',
                  }}
                  itemStyle={{ color: '#F2F0E9' }}
                  cursor={{ stroke: '#2B3437' }}
                />
                <Area
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke="#6FAF8F"
                  fill="url(#posGrad)"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  name="Negative"
                  stroke="#C96D67"
                  fill="url(#negGrad)"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  name="Neutral"
                  stroke="#737D7A"
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {[
              { label: 'Positive', color: '#6FAF8F' },
              { label: 'Negative', color: '#C96D67' },
              { label: 'Neutral', color: '#737D7A' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#737D7A' }}>
                <div style={{ width: 20, height: 2, background: l.color, borderRadius: 1 }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Emerging Issues */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F2F0E9', marginBottom: 4 }}>
            Emerging issues
          </div>
          <div style={{ fontSize: 11, color: '#737D7A', marginBottom: 16 }}>
            By mention volume change
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {EMERGING_ISSUES.map((issue, i) => (
              <div
                key={issue.name}
                style={{
                  padding: '11px 0',
                  borderTop: i > 0 ? '1px solid #2B3437' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate('explorer')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#F2F0E9' }}>{issue.name}</div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '1px 6px',
                    borderRadius: 3,
                    background: `${severityColors[issue.severity]}18`,
                    color: severityColors[issue.severity],
                    border: `1px solid ${severityColors[issue.severity]}28`,
                    textTransform: 'capitalize',
                    flexShrink: 0,
                  }}>
                    {issue.severity}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#737D7A', fontFamily: 'var(--font-mono)' }}>
                    {issue.mentions.toLocaleString()} mentions
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: '#C96D67',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <TrendingUp size={10} />
                    +{issue.change}%
                  </span>
                </div>

                {/* Simple bar */}
                <div style={{ height: 2, background: '#2B3437', borderRadius: 1, marginTop: 6 }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((issue.mentions / 2500) * 100, 100)}%`,
                    background: severityColors[issue.severity],
                    borderRadius: 1,
                    opacity: 0.6,
                  }} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('insights')}
            style={{
              marginTop: 14,
              width: '100%',
              padding: '6px',
              background: 'none',
              border: '1px solid #2B3437',
              borderRadius: 5,
              color: '#A8B0AE',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            View all insights
            <ArrowUpRight size={11} />
          </button>
        </div>
      </div>

      {/* Bottom row: AI Insight + Release Impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* AI Insight */}
        <div className="ai-insight-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#5FAFA3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Insight
            </div>
            <span style={{ fontSize: 10, color: '#737D7A', fontFamily: 'var(--font-mono)' }}>Confidence: 94%</span>
          </div>
          <p style={{ fontSize: 13, color: '#F2F0E9', lineHeight: 1.6, marginBottom: 10 }}>
            Payment-failure complaints increased <strong style={{ color: '#C96D67' }}>184%</strong> after v2.4.
            1,284 related feedback items found across App Store reviews, support tickets and surveys.
          </p>
          <p style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.5, marginBottom: 14 }}>
            The pattern correlates with the new one-click payment flow introduced in v2.4.0. 
            Enterprise users in EU regions are disproportionately affected (67% of volume).
          </p>
          <button
            onClick={() => onNavigate('insights')}
            style={{
              background: 'none',
              border: 'none',
              color: '#5FAFA3',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: 0,
            }}
          >
            View evidence
            <ArrowUpRight size={12} />
          </button>
        </div>

        {/* Latest Release Card */}
        {latestRelease && (
          <div className="surface" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, marginBottom: 12 }}>
              Latest release
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 16,
                fontWeight: 600,
                color: '#F2F0E9',
              }}>
                {latestRelease.version}
              </span>
              <span style={{
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 3,
                background: latestRelease.impactStatus === 'positive'
                  ? 'rgba(111,175,143,0.12)'
                  : latestRelease.impactStatus === 'mixed'
                  ? 'rgba(209,164,91,0.12)'
                  : 'rgba(201,109,103,0.12)',
                color: latestRelease.impactStatus === 'positive' ? '#6FAF8F'
                  : latestRelease.impactStatus === 'mixed' ? '#D1A45B' : '#C96D67',
                border: `1px solid ${latestRelease.impactStatus === 'positive' ? 'rgba(111,175,143,0.22)' : latestRelease.impactStatus === 'mixed' ? 'rgba(209,164,91,0.22)' : 'rgba(201,109,103,0.22)'}`,
                textTransform: 'capitalize',
              }}>
                {latestRelease.impactStatus} impact
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#A8B0AE', marginBottom: 14, lineHeight: 1.5 }}>
              {latestRelease.title}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#737D7A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Sentiment shift
                </div>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  color: latestRelease.sentimentAfter > latestRelease.sentimentBefore ? '#6FAF8F' : '#C96D67',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  {latestRelease.sentimentBefore > 0 ? `+${latestRelease.sentimentBefore}` : latestRelease.sentimentBefore}
                  {' → '}
                  {latestRelease.sentimentAfter > 0 ? `+${latestRelease.sentimentAfter}` : latestRelease.sentimentAfter}
                  {latestRelease.sentimentAfter > latestRelease.sentimentBefore
                    ? <TrendingUp size={12} />
                    : <TrendingDown size={12} />
                  }
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#737D7A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Issue volume
                </div>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  color: latestRelease.issueVolumeAfter < latestRelease.issueVolumeBefore ? '#6FAF8F' : '#C96D67',
                }}>
                  {latestRelease.issueVolumeBefore} → {latestRelease.issueVolumeAfter}
                  <span style={{ fontSize: 11, marginLeft: 4 }}>
                    ({latestRelease.issueVolumeAfter < latestRelease.issueVolumeBefore ? '-' : '+'}
                    {Math.abs(latestRelease.issueVolumeAfter - latestRelease.issueVolumeBefore)})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('releases')}
              style={{
                marginTop: 14,
                background: 'none',
                border: 'none',
                color: '#5FAFA3',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
              }}
            >
              View full release analysis
              <ArrowUpRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
