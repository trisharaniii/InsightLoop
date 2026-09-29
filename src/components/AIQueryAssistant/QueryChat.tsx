import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Lightbulb, 
  CheckCircle2, 
  Database
} from 'lucide-react';
import type { ChatMessage, FeedbackItem, Release } from '../../types';
import { RAGQueryEngine } from '../../services/ragQueryEngine';

interface QueryChatProps {
  feedbackMemory: FeedbackItem[];
  releases: Release[];
  onSelectFeedbackCitation: (feedbackId: string) => void;
  onCreateTicketFromAction: (title: string, description: string) => void;
}

const PRESET_PROMPTS = [
  "What are users saying about checkout after v2.4?",
  "What are the top 3 critical bugs blocking users right now?",
  "Why is sentiment dropping in billing and subscription tiers?",
  "Summarize feedback regarding OLED dark mode in v2.3",
  "What features are enterprise users requesting most?"
];

export const QueryChat: React.FC<QueryChatProps> = ({
  feedbackMemory,
  releases,
  onSelectFeedbackCitation,
  onCreateTicketFromAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **InsightLoop AI Assistant**. I have indexed **${feedbackMemory.length} feedback items** across App Store, Zendesk, Twitter, and Surveys into persistent memory.\n\nAsk me anything about user experience, product releases, sentiment shifts, or emerging bugs.`,
      timestamp: new Date().toISOString(),
      confidenceScore: 99,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const response = RAGQueryEngine.queryMemory(text, feedbackMemory, releases);
      setMessages(prev => [...prev, response]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="glass-panel p-5 space-y-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Conversational Feedback Memory (RAG Engine)</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Active Memory
              </span>
            </h3>
            <p className="text-xs text-gray-400">Query historical feedback with context-aware AI synthesis & evidence citations</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-mono">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>{feedbackMemory.length} Items Indexed</span>
        </div>
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-400 font-semibold shrink-0 text-[11px]">Suggested Queries:</span>
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-[#121826] hover:bg-[#1a2336] text-gray-300 hover:text-white border border-[#1e293b] shrink-0 text-[11px] transition-all"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#0f1420] border border-[#1e293b] text-gray-100 rounded-tl-none'
                }`}
              >
                {/* Confidence Badge for AI response */}
                {!isUser && msg.confidenceScore && (
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 text-[11px]">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Insight Synthesis
                    </span>
                    <span className="text-gray-400 font-mono">
                      Confidence: <strong className="text-emerald-400">{msg.confidenceScore}%</strong>
                    </span>
                  </div>
                )}

                {/* Text Content */}
                <p className="text-xs leading-relaxed font-sans whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Key Takeaways */}
                {!isUser && msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#090d16] border border-[#1e293b] space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Key Synthesis Takeaways:
                    </span>
                    <ul className="space-y-1 text-xs text-gray-300 pl-4 list-disc">
                      {msg.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx}>{takeaway}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Product Actions */}
                {!isUser && msg.recommendedActions && msg.recommendedActions.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1.5">
                    <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      Recommended Product Actions:
                    </span>
                    <div className="space-y-1.5">
                      {msg.recommendedActions.map((action, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-gray-200 gap-2">
                          <span>• {action}</span>
                          <button
                            onClick={() => onCreateTicketFromAction(action, `Action item generated from AI Chat query.`)}
                            className="px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-[10px] font-semibold border border-purple-700/50 shrink-0"
                          >
                            + Ticket
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Citations */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-[#1e293b] space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Evidence & Sources ({msg.citations.length} Citations):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite) => (
                        <div
                          key={cite.feedbackId}
                          onClick={() => onSelectFeedbackCitation(cite.feedbackId)}
                          className="p-2 rounded-lg bg-[#07090e] border border-[#1e293b] hover:border-cyan-500/50 cursor-pointer transition-all space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-cyan-300">{cite.userName} ({cite.source})</span>
                            <span className={`badge ${
                              cite.sentiment === 'positive' ? 'badge-positive' : 'badge-negative'
                            }`}>
                              {cite.sentiment}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 line-clamp-2 italic">
                            "{cite.textSnippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3 items-center text-xs text-cyan-400">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-[#0f1420] border border-[#1e293b] text-gray-400 flex items-center gap-2">
              <span className="shimmer-loading px-3 py-1 rounded text-transparent">Analyzing vector memory index...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-[#1e293b]"
      >
        <input
          type="text"
          placeholder="Ask AI Memory (e.g., 'What complaints are highest priority in v2.4 checkout?')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-[#0f1420] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isThinking}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow flex items-center gap-1.5 transition-all"
        >
          <span>Query</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
