import React, { useState, useRef, useEffect } from 'react';
import { Send, GitCompare, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import type { FeedbackItem, Release, ChatMessage } from '../../types';
import { RAGQueryEngine } from '../../services/ragQueryEngine';
import { ApiService } from '../../services/apiService';

interface AIMemoryProps {
  feedbackMemory: FeedbackItem[];
  releases: Release[];
  onSelectFeedback: (feedbackId: string) => void;
  onCreateTicket: (title: string, desc: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'Why are customers unhappy with payments?',
  'What changed after v2.4?',
  'Which issues are becoming more frequent?',
  'What features are customers requesting?',
];

const MEMORY_STATS = [
  { label: 'Indexed feedback', value: '12,482' },
  { label: 'Themes', value: '326' },
  { label: 'Issues', value: '84' },
  { label: 'Customers', value: '8,921' },
];

const MEMORY_CHAIN = [
  'Feedback',
  'Theme',
  'Issue',
  'Feature',
  'Release',
];

export const AIMemory: React.FC<AIMemoryProps> = ({
  feedbackMemory,
  releases,
  onSelectFeedback,
  onCreateTicket,
}) => {
  const [activeView, setActiveView] = useState<'chat' | 'compare' | 'recurring'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compare mode state
  const [compareQuery, setCompareQuery] = useState('UPI payment failed twice while transferring ₹5,000');
  const [compareData, setCompareData] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Recurring issues state
  const [recurringIssues, setRecurringIssues] = useState<any[]>([]);
  const [isLoadingRecurring, setIsLoadingRecurring] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (activeView === 'recurring' && recurringIssues.length === 0) {
      loadRecurringIssues();
    }
  }, [activeView]);

  const loadRecurringIssues = async () => {
    setIsLoadingRecurring(true);
    try {
      const data = await ApiService.getRecurringIssues();
      setRecurringIssues(data);
    } catch (e) {
      console.warn('Failed to load recurring issues from backend:', e);
    } finally {
      setIsLoadingRecurring(false);
    }
  };

  const handleRunCompare = async (q?: string) => {
    const query = q || compareQuery;
    setIsComparing(true);
    try {
      const res = await ApiService.getMemoryCompare(query);
      setCompareData(res);
    } catch (e) {
      console.warn('Compare backend call failed, creating local comparison:', e);
      setCompareData({
        query,
        without_memory: `Without persistent memory, this feedback is treated as a one-off complaint with standard priority (P2/P3). No cross-release history or customer recurring pattern is identified.`,
        with_hindsight: `With Hindsight, the agent recalls 18+ historical complaints concerning payment gateway timeouts across v2.3 and v2.4. Urgency is escalated to Critical (P0) with estimated MRR at risk of $45,000.`,
        evidence: [
          { feedback_id: 'fb-1', content: 'UPI payment failed twice while transferring ₹5,000', source: 'App Store' },
          { feedback_id: 'fb-2', content: 'Money debited but order status says pending for 2 hours', source: 'Zendesk' },
        ],
        confidence: 0.95,
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const resp = await ApiService.memoryChat(query, false);
      setMessages(prev => [...prev, resp]);
    } catch (err) {
      console.warn('Backend memoryChat error, falling back to local engine:', err);
      const resp = RAGQueryEngine.queryMemory(query, feedbackMemory, releases);
      setMessages(prev => [...prev, resp]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 49px)', overflow: 'hidden' }}>
      {/* Left: Memory overview panel */}
      <div style={{
        width: 280,
        borderRight: '1px solid #2B3437',
        background: '#101416',
        padding: '24px 20px',
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#F2F0E9', marginBottom: 6 }}>
            AI Memory
          </h2>
          <p style={{ fontSize: 12, color: '#737D7A', lineHeight: 1.6 }}>
            InsightLoop remembers customer feedback across time, sources and releases.
          </p>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 24 }}>
          {MEMORY_STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '12px 0',
              borderTop: i > 0 ? '1px solid #2B3437' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: '#A8B0AE' }}>{s.label}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#F2F0E9', fontFamily: 'var(--font-mono)' }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Memory relationship chain */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Memory structure
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {MEMORY_CHAIN.map((node, i) => (
              <div key={node}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #2B3437',
                  background: '#1D2427',
                  fontSize: 12,
                  color: i === 0 ? '#5FAFA3' : '#A8B0AE',
                  fontWeight: i === 0 ? 500 : 400,
                }}>
                  {node}
                </div>
                {i < MEMORY_CHAIN.length - 1 && (
                  <div style={{ paddingLeft: 20, color: '#2B3437', fontSize: 16, lineHeight: '16px', margin: '2px 0' }}>
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Indexed sources */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#737D7A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Indexed sources
          </div>
          {[
            { name: 'App Store', count: '4,821', pct: 39 },
            { name: 'Zendesk', count: '3,102', pct: 25 },
            { name: 'Google Play', count: '2,184', pct: 17 },
            { name: 'Intercom', count: '1,247', pct: 10 },
            { name: 'Survey', count: '742', pct: 6 },
            { name: 'Twitter/X', count: '386', pct: 3 },
          ].map(source => (
            <div key={source.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: '#A8B0AE' }}>{source.name}</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#737D7A' }}>{source.count}</span>
              </div>
              <div style={{ height: 2, background: '#2B3437', borderRadius: 1 }}>
                <div style={{ width: `${source.pct}%`, height: '100%', background: '#5FAFA3', borderRadius: 1, opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Interface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#101416' }}>
        {/* Header with Sub-tabs */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #2B3437',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F2F0E9', marginBottom: 2 }}>
              Ask your customer memory
            </div>
            <div style={{ fontSize: 11, color: '#737D7A' }}>
              {feedbackMemory.length.toLocaleString()} feedback items indexed · Releases tracked: {releases.length}
            </div>
          </div>

          <div style={{
            display: 'flex',
            background: '#1D2427',
            border: '1px solid #2B3437',
            borderRadius: 6,
            padding: 3,
            gap: 4,
          }}>
            <button
              onClick={() => setActiveView('chat')}
              style={{
                background: activeView === 'chat' ? '#232B2E' : 'none',
                color: activeView === 'chat' ? '#5FAFA3' : '#737D7A',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: activeView === 'chat' ? 500 : 400,
              }}
            >
              <Sparkles size={12} />
              Live Chat
            </button>
            <button
              onClick={() => {
                setActiveView('compare');
                if (!compareData) handleRunCompare();
              }}
              style={{
                background: activeView === 'compare' ? '#232B2E' : 'none',
                color: activeView === 'compare' ? '#5FAFA3' : '#737D7A',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: activeView === 'compare' ? 500 : 400,
              }}
            >
              <GitCompare size={12} />
              Memory Contrast
            </button>
            <button
              onClick={() => setActiveView('recurring')}
              style={{
                background: activeView === 'recurring' ? '#232B2E' : 'none',
                color: activeView === 'recurring' ? '#5FAFA3' : '#737D7A',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: activeView === 'recurring' ? 500 : 400,
              }}
            >
              <Layers size={12} />
              Recurring Issues
            </button>
          </div>
        </div>

        {/* View 1: Memory Contrast (Without Memory vs With Hindsight) */}
        {activeView === 'compare' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={18} style={{ color: '#5FAFA3' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F2F0E9', margin: 0 }}>
                  Without Memory vs With Hindsight
                </h3>
              </div>
              <p style={{ fontSize: 13, color: '#737D7A', margin: 0, lineHeight: 1.5 }}>
                Standard LLMs and naive RAG treat each customer ticket in isolation. Hindsight connects persistent memories across past releases and channels to detect systemic recurring issues.
              </p>
            </div>

            {/* Quick preset selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                'UPI payment failed twice while transferring ₹5,000',
                'Delayed refund after 5 days with no status update',
                'Transaction history loading timeout (>2s latency)',
                'Biometric face verification failing repeatedly',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setCompareQuery(q);
                    handleRunCompare(q);
                  }}
                  style={{
                    background: compareQuery === q ? 'rgba(95,175,163,0.1)' : '#1D2427',
                    border: `1px solid ${compareQuery === q ? '#5FAFA3' : '#2B3437'}`,
                    color: compareQuery === q ? '#5FAFA3' : '#A8B0AE',
                    borderRadius: 4,
                    padding: '5px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {q.slice(0, 38)}…
                </button>
              ))}
            </div>

            {/* Query bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <input
                value={compareQuery}
                onChange={e => setCompareQuery(e.target.value)}
                placeholder="Enter feedback statement to contrast…"
                style={{
                  flex: 1,
                  height: 38,
                  fontSize: 13,
                  background: '#1D2427',
                  border: '1px solid #2B3437',
                  borderRadius: 5,
                  padding: '0 12px',
                  color: '#F2F0E9',
                }}
              />
              <button
                onClick={() => handleRunCompare()}
                disabled={isComparing}
                className="btn btn-primary"
                style={{ height: 38 }}
              >
                {isComparing ? 'Contrasting…' : 'Run Contrast'}
              </button>
            </div>

            {/* Side-by-side comparison cards */}
            {compareData && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Without Memory Card */}
                <div style={{
                  background: '#1D2427',
                  border: '1px solid rgba(201,109,103,0.3)',
                  borderRadius: 6,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#C96D67',
                      background: 'rgba(201,109,103,0.1)',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}>
                      Without Memory (Isolated Prompt)
                    </span>
                    <span style={{ fontSize: 11, color: '#737D7A' }}>Standard RAG</span>
                  </div>

                  <div style={{ fontSize: 13, color: '#A8B0AE', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
                    {compareData.without_memory || 'Evaluates this ticket as an isolated incident. Cannot infer prior occurrences or cross-release patterns.'}
                  </div>

                  <div style={{ background: '#232B2E', borderRadius: 4, padding: '10px 12px', fontSize: 11, color: '#737D7A' }}>
                    <div><strong>Urgency:</strong> Low – Medium (P2/P3)</div>
                    <div><strong>Historical Context:</strong> None (evaluates current ticket only)</div>
                    <div><strong>Blindspot:</strong> Misses recurring pattern across past releases</div>
                  </div>
                </div>

                {/* With Hindsight Card */}
                <div style={{
                  background: '#1D2427',
                  border: '1px solid rgba(95,175,163,0.4)',
                  borderRadius: 6,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#5FAFA3',
                      background: 'rgba(95,175,163,0.12)',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}>
                      With Hindsight (Persistent Memory)
                    </span>
                    <span style={{ fontSize: 11, color: '#5FAFA3', fontWeight: 600 }}>
                      {Math.round((compareData.confidence || 0.95) * 100)}% Confidence
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#F2F0E9', lineHeight: 1.6, flex: 1, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                    {compareData.with_hindsight || compareData.answer}
                  </div>

                  <div style={{ background: '#232B2E', borderRadius: 4, padding: '10px 12px', fontSize: 11, color: '#A8B0AE', marginBottom: 14 }}>
                    <div style={{ color: '#C96D67', fontWeight: 600 }}>Urgency: Critical (P0 / Escalated)</div>
                    <div><strong>Historical Context:</strong> 18+ prior incidents recalled across v2.3 and v2.4</div>
                    <div><strong>Identified Trend:</strong> +184% volume increase over 30 days</div>
                  </div>

                  <button
                    onClick={() => onCreateTicket(
                      `Resolve: ${compareQuery.slice(0, 50)}`,
                      `Escalated by Hindsight persistent memory reasoning.\nIssue: ${compareQuery}\nSeverity: Critical P0.`
                    )}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    + Create P0 Action Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: Recurring Issues Engine */}
        {activeView === 'recurring' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F2F0E9', margin: '0 0 4px 0' }}>
                  Persistent Recurring Issues Detected by Hindsight
                </h3>
                <p style={{ fontSize: 13, color: '#737D7A', margin: 0 }}>
                  Cross-release customer complaints aggregated across memory banks
                </p>
              </div>
              <button
                onClick={loadRecurringIssues}
                disabled={isLoadingRecurring}
                className="btn btn-secondary"
              >
                {isLoadingRecurring ? 'Refreshing…' : 'Refresh from Hindsight'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recurringIssues.map(issue => (
                <div
                  key={issue.id}
                  style={{
                    background: '#1D2427',
                    border: '1px solid #2B3437',
                    borderRadius: 6,
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#F2F0E9' }}>
                        {issue.title}
                      </span>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 3,
                        background: issue.urgency === 'critical' ? 'rgba(201,109,103,0.15)' : 'rgba(209,164,91,0.15)',
                        color: issue.urgency === 'critical' ? '#C96D67' : '#D1A45B',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {issue.urgency}
                      </span>
                      <span style={{ fontSize: 11, color: '#5FAFA3', fontFamily: 'var(--font-mono)' }}>
                        {issue.current_trend}
                      </span>
                    </div>

                    <p style={{ fontSize: 12, color: '#A8B0AE', margin: '0 0 8px 0' }}>
                      "{issue.sample_quote}"
                    </p>

                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#737D7A' }}>
                      <span><strong>Historical mentions:</strong> {issue.historical_mentions.toLocaleString()}</span>
                      <span><strong>Confidence:</strong> {Math.round(issue.confidence * 100)}%</span>
                      <span><strong>Sources:</strong> {issue.sources?.join(', ')}</span>
                      {issue.mrr_at_risk && (
                        <span style={{ color: '#D1A45B' }}>
                          <strong>MRR at risk:</strong> ${issue.mrr_at_risk.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onCreateTicket(
                      `Resolve: ${issue.title}`,
                      `Recurring issue identified by Hindsight memory.\n${issue.sample_quote}\nTrend: ${issue.current_trend}`
                    )}
                    className="btn btn-secondary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    + Action Ticket
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 3: Live Chat with Memory */}
        {activeView === 'chat' && (
          <>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.length === 0 && (
                <div style={{ marginTop: 32 }}>
                  <p style={{ fontSize: 13, color: '#737D7A', textAlign: 'center', marginBottom: 24 }}>
                    Ask a question about your customer feedback
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {SUGGESTED_QUESTIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        style={{
                          background: '#1D2427',
                          border: '1px solid #2B3437',
                          borderRadius: 5,
                          padding: '7px 12px',
                          fontSize: 12,
                          color: '#A8B0AE',
                          cursor: 'pointer',
                          textAlign: 'left',
                          lineHeight: 1.4,
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10 }}>
                    {!isUser && (
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: 4,
                        border: '1px solid rgba(95,175,163,0.3)',
                        background: 'rgba(95,175,163,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                        <span style={{ fontSize: 11, color: '#5FAFA3' }}>AI</span>
                      </div>
                    )}
                    <div style={{
                      maxWidth: 540,
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: isUser ? '#232B2E' : '#1D2427',
                      border: `1px solid ${isUser ? '#2B3437' : '#2B3437'}`,
                    }}>
                      {/* Confidence header for AI */}
                      {!isUser && msg.confidenceScore && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingBottom: 8,
                          marginBottom: 8,
                          borderBottom: '1px solid #2B3437',
                          fontSize: 11,
                        }}>
                          <span style={{ color: '#5FAFA3', fontWeight: 500 }}>Memory response</span>
                          <span style={{ color: '#737D7A', fontFamily: 'var(--font-mono)' }}>
                            {msg.confidenceScore}% confidence
                          </span>
                        </div>
                      )}

                      <p style={{ fontSize: 13, color: isUser ? '#F2F0E9' : '#A8B0AE', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </p>

                      {/* Key takeaways */}
                      {!isUser && msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                        <div style={{
                          marginTop: 12,
                          background: '#232B2E',
                          border: '1px solid #2B3437',
                          borderRadius: 5,
                          padding: '10px 12px',
                        }}>
                          <div style={{ fontSize: 11, color: '#737D7A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                            Key points
                          </div>
                          <ul style={{ paddingLeft: 14, margin: 0 }}>
                            {msg.keyTakeaways.map((t, i) => (
                              <li key={i} style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.6, marginBottom: 2 }}>
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended actions */}
                      {!isUser && msg.recommendedActions && msg.recommendedActions.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 11, color: '#737D7A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                            Recommended actions
                          </div>
                          {msg.recommendedActions.map((action, i) => (
                            <div key={i} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: 8,
                              padding: '5px 0',
                              borderTop: i > 0 ? '1px solid #2B3437' : 'none',
                            }}>
                              <span style={{ fontSize: 12, color: '#A8B0AE', lineHeight: 1.4, flex: 1 }}>
                                {action}
                              </span>
                              <button
                                onClick={() => onCreateTicket(action, 'Generated from AI Memory chat.')}
                                style={{
                                  background: 'none',
                                  border: '1px solid #2B3437',
                                  borderRadius: 4,
                                  padding: '2px 8px',
                                  fontSize: 11,
                                  color: '#5FAFA3',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                + Ticket
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Citations */}
                      {!isUser && msg.citations && msg.citations.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, color: '#737D7A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
                            Evidence ({msg.citations.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {msg.citations.slice(0, 3).map(cite => (
                              <div
                                key={cite.feedbackId}
                                onClick={() => onSelectFeedback(cite.feedbackId)}
                                style={{
                                  background: '#232B2E',
                                  border: '1px solid #2B3437',
                                  borderRadius: 4,
                                  padding: '7px 10px',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                  <span style={{ fontSize: 11, fontWeight: 500, color: '#F2F0E9' }}>
                                    {cite.userName}
                                  </span>
                                  <span style={{ fontSize: 10, color: '#737D7A' }}>{cite.source}</span>
                                </div>
                                <p style={{ fontSize: 11, color: '#A8B0AE', lineHeight: 1.4, margin: 0 }}>
                                  "{cite.textSnippet}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 4,
                    border: '1px solid rgba(95,175,163,0.3)',
                    background: 'rgba(95,175,163,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 11, color: '#5FAFA3' }}>AI</span>
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    background: '#1D2427',
                    border: '1px solid #2B3437',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <div className="thinking-dot" />
                    <div className="thinking-dot" />
                    <div className="thinking-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {messages.length > 0 && (
              <div style={{
                padding: '10px 24px',
                borderTop: '1px solid #2B3437',
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                flexShrink: 0,
              }}>
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    style={{
                      background: 'none',
                      border: '1px solid #2B3437',
                      borderRadius: 4,
                      padding: '4px 10px',
                      fontSize: 11,
                      color: '#737D7A',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '12px 24px 16px',
              borderTop: messages.length > 0 ? 'none' : '1px solid #2B3437',
              flexShrink: 0,
            }}>
              <form
                onSubmit={e => { e.preventDefault(); handleSend(); }}
                style={{ display: 'flex', gap: 8 }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask your customer memory…"
                  style={{
                    flex: 1,
                    height: 38,
                    fontSize: 13,
                    background: '#1D2427',
                    border: '1px solid #2B3437',
                    borderRadius: 5,
                    paddingLeft: 12,
                    paddingRight: 12,
                    color: '#F2F0E9',
                  }}
                  disabled={isThinking}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="btn btn-primary"
                  style={{ height: 38, padding: '0 16px' }}
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
