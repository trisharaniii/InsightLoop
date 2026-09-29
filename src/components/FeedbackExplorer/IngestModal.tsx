import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import type { FeedbackItem, FeedbackSource, Release } from '../../types';
import { AIAnalysisService } from '../../services/aiAnalysisService';
import { PRESET_DATASETS } from '../../data/seedData';

interface IngestModalProps {
  onClose: () => void;
  onIngestItems: (newItems: FeedbackItem[]) => void;
  onSelectPreset: (presetId: string) => void;
  releases: Release[];
}

export const IngestModal: React.FC<IngestModalProps> = ({
  onClose,
  onIngestItems,
  onSelectPreset,
  releases,
}) => {
  const [tab, setTab] = useState<'single' | 'batch' | 'file' | 'preset'>('single');

  // Single form state
  const [source, setSource] = useState<FeedbackSource>('App Store');
  const [userName, setUserName] = useState('');
  const [userSegment, setUserSegment] = useState<'Free' | 'Pro' | 'Enterprise' | 'Beta Tester'>('Pro');
  const [rating, setRating] = useState<number>(5);
  const [rawText, setRawText] = useState('');

  // Batch form state
  const [batchText, setBatchText] = useState('');

  // Processing indicator
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const newItem: Partial<FeedbackItem> = {
        id: `ingest-${Date.now()}`,
        source,
        user: { name: userName.trim() || 'Customer User', segment: userSegment },
        text: rawText.trim(),
        rating,
        timestamp: new Date().toISOString(),
        status: 'new',
      };

      const analyzed = AIAnalysisService.batchAnalyze([newItem], releases);
      onIngestItems(analyzed);
      setIsAnalyzing(false);
      onClose();
    }, 400);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const lines = batchText.split('\n').filter(line => line.trim().length > 5);
      const rawItems: Partial<FeedbackItem>[] = lines.map((line, idx) => ({
        id: `batch-${Date.now()}-${idx}`,
        source: 'CSV Upload',
        user: { name: `Batch User #${idx + 1}`, segment: 'Pro' },
        text: line.trim(),
        timestamp: new Date().toISOString(),
        status: 'new',
      }));

      const analyzed = AIAnalysisService.batchAnalyze(rawItems, releases);
      onIngestItems(analyzed);
      setIsAnalyzing(false);
      onClose();
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const lines = content.split('\n').filter(l => l.trim().length > 3);
      // Skip header if header line exists
      const dataLines = lines[0].toLowerCase().includes('feedback') || lines[0].toLowerCase().includes('text') 
        ? lines.slice(1) 
        : lines;

      const rawItems: Partial<FeedbackItem>[] = dataLines.map((line, idx) => {
        const parts = line.split(',');
        const text = parts.length > 1 ? parts.slice(1).join(',').replace(/^"|"$/g, '') : parts[0];
        return {
          id: `csv-${Date.now()}-${idx}`,
          source: 'CSV Upload',
          user: { name: `Imported Customer #${idx + 1}`, segment: 'Pro' },
          text: text.trim(),
          timestamp: new Date().toISOString(),
          status: 'new',
        };
      });

      const analyzed = AIAnalysisService.batchAnalyze(rawItems, releases);
      onIngestItems(analyzed);
      setIsAnalyzing(false);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-6 max-w-xl w-full space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Ingest Scattered Customer Feedback</h3>
              <p className="text-xs text-gray-400">AI automatically indexes sentiment, themes, and urgency</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-[#121826] text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2 text-xs font-semibold">
          <button
            onClick={() => setTab('single')}
            className={`px-3 py-1.5 rounded-lg transition-all ${tab === 'single' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Single Entry
          </button>
          <button
            onClick={() => setTab('batch')}
            className={`px-3 py-1.5 rounded-lg transition-all ${tab === 'batch' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Paste Batch Text
          </button>
          <button
            onClick={() => setTab('file')}
            className={`px-3 py-1.5 rounded-lg transition-all ${tab === 'file' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-gray-400 hover:text-gray-200'}`}
          >
            CSV Upload
          </button>
          <button
            onClick={() => setTab('preset')}
            className={`px-3 py-1.5 rounded-lg transition-all ${tab === 'preset' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Prebuilt Datasets
          </button>
        </div>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="p-8 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
            <h4 className="text-sm font-bold text-white">AI Vector Memory Indexing Active</h4>
            <p className="text-xs text-gray-400">Analyzing sentiment, extracting key complaints, tagging urgency...</p>
          </div>
        )}

        {!isAnalyzing && tab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Feedback Channel</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as FeedbackSource)}
                  className="w-full bg-[#0f1420] border border-[#1e293b] rounded-lg p-2 text-white"
                >
                  <option value="App Store">App Store</option>
                  <option value="Google Play">Google Play</option>
                  <option value="Zendesk">Zendesk Support Ticket</option>
                  <option value="Intercom">Intercom Chat</option>
                  <option value="Twitter/X">Twitter/X Post</option>
                  <option value="Survey">Typeform Survey</option>
                  <option value="Manual">Internal Team Note</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">User Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#0f1420] border border-[#1e293b] rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">User Tier / Segment</label>
                <select
                  value={userSegment}
                  onChange={(e) => setUserSegment(e.target.value as any)}
                  className="w-full bg-[#0f1420] border border-[#1e293b] rounded-lg p-2 text-white"
                >
                  <option value="Pro">Pro Plan</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Free">Free Plan</option>
                  <option value="Beta Tester">Beta Tester</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Star Rating (Optional)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-[#0f1420] border border-[#1e293b] rounded-lg p-2 text-white"
                >
                  <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                  <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                  <option value={3}>3 Stars ⭐⭐⭐</option>
                  <option value={2}>2 Stars ⭐⭐</option>
                  <option value={1}>1 Star ⭐</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Customer Feedback Text</label>
              <textarea
                rows={4}
                required
                placeholder="Paste customer review, support ticket content, or user quote..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-[#0f1420] border border-[#1e293b] rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#121826] text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow"
              >
                Run AI Ingestion
              </button>
            </div>
          </form>
        )}

        {!isAnalyzing && tab === 'batch' && (
          <form onSubmit={handleBatchSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Paste Raw Feedback (1 item per line)</label>
              <textarea
                rows={6}
                required
                placeholder="Line 1: Dark mode font is too small on mobile screen...&#10;Line 2: Instant Apple Pay checkout is incredibly fast!&#10;Line 3: 2FA SMS code timer times out after 30 seconds."
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                className="w-full bg-[#0f1420] border border-[#1e293b] rounded-lg p-2.5 text-white font-mono text-[11px]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#121826] text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow"
              >
                Batch Analyze & Index
              </button>
            </div>
          </form>
        )}

        {!isAnalyzing && tab === 'file' && (
          <div className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-[#1e293b] hover:border-cyan-500 rounded-xl p-8 text-center space-y-3 bg-[#090d16]">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-white">Upload Feedback Dataset CSV File</p>
                <p className="text-xs text-gray-400">File should contain raw customer feedback text column</p>
              </div>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="inline-block px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shadow"
              >
                Browse CSV File
              </label>
            </div>
          </div>
        )}

        {!isAnalyzing && tab === 'preset' && (
          <div className="space-y-3 text-xs">
            <p className="text-gray-300">Quickly load curated industry datasets with realistic release timelines:</p>
            {PRESET_DATASETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset.id);
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#0f1420] border border-[#1e293b] hover:border-purple-500/50 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{preset.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px]">{preset.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
