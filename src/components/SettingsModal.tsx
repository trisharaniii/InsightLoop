import React, { useState } from 'react';
import { X, Settings, Download, Upload, CheckCircle2, RotateCcw } from 'lucide-react';
import type { AIConfig } from '../types';
import { StorageService } from '../services/storageService';

interface SettingsModalProps {
  onClose: () => void;
  config: AIConfig;
  onSaveConfig: (newConfig: AIConfig) => void;
  onResetData: () => void;
  onRefreshState: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  config,
  onSaveConfig,
  onResetData,
  onRefreshState,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [model] = useState(config.model);
  const [useLocalEngine, setUseLocalEngine] = useState(config.useLocalEngine);
  const [autoProcess] = useState(config.autoProcessNewIngest);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      apiKey,
      model,
      useLocalEngine,
      autoProcessNewIngest: autoProcess,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const dataStr = StorageService.exportFullDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insightloop-memory-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = StorageService.importFullDataJSON(content);
      if (success) {
        setImportStatus('success');
        onRefreshState();
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-6 max-w-lg w-full space-y-4 relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">InsightLoop AI Engine & Data Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-[#121826] text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Engine Selector */}
          <div className="space-y-2 p-3 rounded-xl bg-[#0f1420] border border-[#1e293b]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">AI Inference Engine</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                {useLocalEngine ? 'Client Simulated AI' : 'Custom LLM API'}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  checked={useLocalEngine}
                  onChange={() => setUseLocalEngine(true)}
                  className="accent-cyan-500"
                />
                <span>Built-in Fast AI Engine (No API Key Required)</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  checked={!useLocalEngine}
                  onChange={() => setUseLocalEngine(false)}
                  className="accent-cyan-500"
                />
                <span>Custom OpenAI / Gemini / Ollama API Key</span>
              </label>
            </div>

            {!useLocalEngine && (
              <div className="pt-2 space-y-2">
                <input
                  type="password"
                  placeholder="Enter OpenAI / LLM API Key (sk-...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#172033] border border-[#23304b] rounded-lg p-2 text-white font-mono"
                />
              </div>
            )}
          </div>

          {/* Backup & Data Management */}
          <div className="p-3 rounded-xl bg-[#0f1420] border border-[#1e293b] space-y-3">
            <span className="font-bold text-white text-xs block">Persistent Memory Backup & Export</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 px-3 py-2 rounded-lg bg-[#172033] hover:bg-[#23304b] text-gray-200 border border-[#23304b] flex items-center justify-center gap-1.5 font-medium transition-all"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Memory JSON</span>
              </button>

              <label className="flex-1 px-3 py-2 rounded-lg bg-[#172033] hover:bg-[#23304b] text-gray-200 border border-[#23304b] flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Import JSON Backup</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>

            {importStatus === 'success' && (
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Memory backup imported successfully!
              </p>
            )}
            {importStatus === 'error' && (
              <p className="text-[11px] text-rose-400 font-semibold">
                Failed to import JSON backup. Invalid format.
              </p>
            )}
          </div>

          {/* Danger Reset Zone */}
          <div className="pt-2 flex items-center justify-between border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => {
                onResetData();
                onClose();
              }}
              className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Seed State</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#121826] text-gray-300"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
