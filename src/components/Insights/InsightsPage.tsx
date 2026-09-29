import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { ApiService } from '../../services/apiService';

interface InsightItem {
  id: string;
  category: string;
  title: string;
  explanation: string;
  evidence: string;
  mentions: number;
  change: number;
  confidence: number;
  impact: 'critical' | 'high' | 'medium' | 'low';
}

const INSIGHTS: InsightItem[] = [
  {
    id: 'ins-1',
    category: 'Emerging Trends',
    title: 'Payment reliability is becoming the dominant negative theme',
    explanation: 'Complaints about failed or delayed transactions have risen sharply since v2.4 rolled out the new checkout flow. The pattern is consistent across App Store, Zendesk, and social channels.',
    evidence: '1,284 mentions across 4 sources',
    mentions: 1284,
    change: 184,
    confidence: 94,
    impact: 'critical',
  },
  {
    id: 'ins-2',
    category: 'Recurring Problems',
    title: '2FA SMS delivery failing for EU enterprise accounts',
    explanation: 'International SMS carrier routing issues introduced in v2.4 are preventing enterprise users in Germany, France, and Netherlands from completing checkout verification.',
    evidence: '284 mentions · 142 enterprise accounts',
    mentions: 284,
    change: 67,
    confidence: 91,
    impact: 'critical',
  },
  {
    id: 'ins-3',
    category: 'Feature Requests',
    title: 'Slack and webhook integrations are the top enterprise request',
    explanation: 'Enterprise customers with 100+ seats consistently request real-time alert integrations. Slack, PagerDuty, and Zapier are mentioned most frequently.',
    evidence: '520 users · 38 support threads',
    mentions: 520,
    change: 22,
    confidence: 88,
    impact: 'high',
  },
  {
    id: 'ins-4',
    category: 'Churn Signals',
    title: 'Free-tier users dropping off after accidental annual billing',
    explanation: 'The v2.2 billing toggle default led to unintentional yearly charges. Even after the fix in v2.2.1, trust erosion is visible in 30-day retention data.',
    evidence: '310 affected users · 42 refund requests',
    mentions: 310,
    change: -18,
    confidence: 82,
    impact: 'high',
  },
  {
    id: 'ins-5',
    category: 'Customer Pain Points',
    title: 'Onboarding walkthrough too long for new signups',
    explanation: 'New users consistently abandon the 12-step onboarding tour at step 4–5. Mobile users are 3x more likely to skip than desktop.',
    evidence: '431 survey responses',
    mentions: 431,
    change: 12,
    confidence: 86,
    impact: 'medium',
  },
  {
    id: 'ins-6',
    category: 'Opportunities',
    title: 'OLED dark mode drove highest satisfaction spike this year',
    explanation: 'v2.3 dark mode received the most consistently positive feedback of any release. Users cite battery life, eye comfort, and aesthetics. A scheduling feature is frequently requested.',
    evidence: '894 mentions · 4.8 avg rating',
    mentions: 894,
    change: 94,
    confidence: 97,
    impact: 'medium',
  },
  {
    id: 'ins-7',
    category: 'Emerging Trends',
    title: 'Android 14 login crash affecting fresh installs',
    explanation: 'A biometric credential handler exception introduced in v2.4 causes app crashes on Android 14 devices during first login. Volume is growing week-over-week.',
    evidence: '89 crash reports · Play Store reviews',
    mentions: 89,
    change: 43,
    confidence: 93,
    impact: 'critical',
  },
  {
    id: 'ins-8',
    category: 'Feature Requests',
    title: 'Executive PDF reports requested by VP-level users',
    explanation: 'Senior stakeholders at enterprise accounts want automated monthly sentiment summary exports to share with leadership. Currently requires manual exports.',
    evidence: '156 requests · Enterprise segment',
    mentions: 156,
    change: 8,
    confidence: 79,
    impact: 'medium',
  },
  {
    id: 'ins-9',
    category: 'Recurring Problems',
    title: 'CSV analytics export button intermittently unclickable',
    explanation: 'A state management bug causes the export button to render as disabled until a page refresh. Reproducible on Chrome and Safari. Affects Free and Pro tiers.',
    evidence: '74 reports · Intercom logs',
    mentions: 74,
    change: 31,
    confidence: 89,
    impact: 'high',
  },
  {
    id: 'ins-10',
    category: 'Opportunities',
    title: 'Query performance improvement praised by power users',
    explanation: 'The indexing speedup in v2.4 reduced query latency from 4s to under 300ms on large datasets. Power users on Twitter and App Store are vocal advocates.',
    evidence: '312 positive mentions',
    mentions: 312,
    change: 78,
    confidence: 95,
    impact: 'low',
  },
];

const CATEGORIES = ['All', 'Emerging Trends', 'Recurring Problems', 'Feature Requests', 'Customer Pain Points', 'Churn Signals', 'Opportunities'];

const IMPACT_COLORS: Record<string, string> = {
  critical: '#C96D67',
  high: '#D1A45B',
  medium: '#5FAFA3',
  low: '#737D7A',
};

interface InsightsPageProps {
  onCreateAction: (title: string, desc: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onCreateAction }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [insightsList, setInsightsList] = useState<InsightItem[]>(INSIGHTS);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadBackendInsights() {
      try {
        const raw = await ApiService.getInsights();
        if (raw && raw.length > 0) {
          const mapped: InsightItem[] = raw.map((c: any) => ({
            id: c.id,
            category: c.category || 'Emerging Trends',
            title: c.title,
            explanation: c.explanation || c.description || '',
            evidence: c.evidence || `${c.feedback_count || 120} customer feedback mentions`,
            mentions: c.mentions || c.feedback_count || 120,
            change: Math.round(c.change_pct || c.trend_delta || 15),
            confidence: Math.round((c.confidence || 0.9) * 100),
            impact: (c.impact || 'medium').toLowerCase() as any,
          }));
          setInsightsList(mapped);
        }
      } catch (e) {
        console.warn('Backend insights fetch skipped:', e);
      }
    }
    loadBackendInsights();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const raw = await ApiService.generateInsights();
      if (raw && raw.length > 0) {
        const mapped: InsightItem[] = raw.map((c: any) => ({
          id: c.id,
          category: c.category || 'Emerging Trends',
          title: c.title,
          explanation: c.explanation || c.description || '',
          evidence: c.evidence || `${c.feedback_count || 120} customer feedback mentions`,
          mentions: c.mentions || c.feedback_count || 120,
          change: Math.round(c.change_pct || c.trend_delta || 15),
          confidence: Math.round((c.confidence || 0.9) * 100),
          impact: (c.impact || 'medium').toLowerCase() as any,
        }));
        setInsightsList(mapped);
      }
    } catch (e) {
      console.warn('Generate insights error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const filtered = activeCategory === 'All'
    ? insightsList
    : insightsList.filter(i => i.category === activeCategory);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#F2F0E9', letterSpacing: '-0.3px', marginBottom: 6 }}>
            Insights
          </h1>
          <p style={{ fontSize: 13, color: '#737D7A' }}>
            AI-detected patterns across {insightsList.length} intelligence items
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Sparkles size={13} style={{ color: '#5FAFA3' }} />
          {isGenerating ? 'Synthesizing with Hindsight…' : 'Generate AI Insights'}
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '5px 12px',
              borderRadius: 4,
              border: '1px solid',
              borderColor: activeCategory === cat ? '#2B3437' : 'transparent',
              background: activeCategory === cat ? '#1D2427' : 'none',
              color: activeCategory === cat ? '#F2F0E9' : '#737D7A',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: activeCategory === cat ? 500 : 400,
            }}
          >
            {cat}
            {cat !== 'All' && (
              <span style={{ marginLeft: 5, color: '#737D7A' }}>
                {INSIGHTS.filter(i => i.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Insights list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(insight => (
          <div
            key={insight.id}
            className="surface"
            style={{ padding: '18px 20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                {/* Category tag + impact */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#737D7A', fontWeight: 500 }}>
                    {insight.category}
                  </span>
                  <span style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: IMPACT_COLORS[insight.impact],
                    display: 'inline-block',
                  }} />
                  <span style={{ fontSize: 10, color: IMPACT_COLORS[insight.impact], fontWeight: 500, textTransform: 'capitalize' }}>
                    {insight.impact} impact
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#F2F0E9', lineHeight: 1.4, marginBottom: 6 }}>
                  {insight.title}
                </h3>

                {/* Explanation */}
                <p style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.6, marginBottom: 10 }}>
                  {insight.explanation}
                </p>

                {/* Evidence + stats row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#737D7A' }}>{insight.evidence}</span>

                  <span style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: insight.change > 0 ? '#C96D67' : '#6FAF8F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <TrendingUp size={10} />
                    {insight.change > 0 ? '+' : ''}{insight.change}%
                  </span>

                  <span style={{ fontSize: 11, color: '#737D7A' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#5FAFA3' }}>{insight.confidence}%</span> confidence
                  </span>
                </div>
              </div>

              {/* Trend bar */}
              <div style={{ flexShrink: 0, width: 80 }}>
                <div style={{ height: 40, display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 4 }}>
                  {Array.from({ length: 6 }, (_, i) => {
                    const h = 8 + Math.random() * 28;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: i === 5 ? 40 : h,
                          background: i === 5 ? IMPACT_COLORS[insight.impact] : '#2B3437',
                          borderRadius: 2,
                          opacity: i === 5 ? 0.9 : 0.5 + (i / 10),
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ fontSize: 10, color: '#737D7A', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  trend
                </div>
              </div>
            </div>

            {/* Action footer */}
            <div style={{
              borderTop: '1px solid #2B3437',
              paddingTop: 10,
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => onCreateAction(insight.title, insight.explanation)}
                style={{
                  background: 'none',
                  border: '1px solid #2B3437',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 11,
                  color: '#A8B0AE',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                Create action
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
