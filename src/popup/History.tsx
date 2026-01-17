import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedPrompt } from '../types';
import { getHistory, clearHistory, deleteHistoryEntry } from '../utils/history';
import { copyToClipboard } from '../utils/prompt-generator';

interface HistoryProps {
  onBack: () => void;
}

export function History({ onBack }: HistoryProps) {
  const [history, setHistory] = useState<GeneratedPrompt[]>([]);
  const [filter, setFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleCopy = useCallback(async (prompt: GeneratedPrompt) => {
    const success = await copyToClipboard(prompt.prompt);
    if (success) {
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteHistoryEntry(id);
    await loadHistory();
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  // Filter history by URL
  const filteredHistory = filter
    ? history.filter(p => p.url.toLowerCase().includes(filter.toLowerCase()))
    : history;

  // Get unique URLs for filter suggestions
  const uniqueUrls = [...new Set(history.map(p => p.url))];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateUrl = (url: string, maxLength = 35) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 3) + '...';
  };

  return (
    <div className="popup history">
      <div className="popup-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1 className="popup-title">History</h1>
      </div>

      {history.length > 0 && (
        <>
          <div className="history-filter">
            <input
              type="text"
              className="filter-input"
              placeholder="Filter by URL..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              list="url-suggestions"
            />
            <datalist id="url-suggestions">
              {uniqueUrls.map(url => (
                <option key={url} value={url} />
              ))}
            </datalist>
          </div>

          <div className="history-list">
            {filteredHistory.length === 0 ? (
              <div className="history-empty">No matching entries</div>
            ) : (
              filteredHistory.map(prompt => (
                <div key={prompt.id} className="history-item">
                  <div className="history-item-header">
                    <span className="history-date">{formatDate(prompt.createdAt)}</span>
                    <span className="history-count">{prompt.annotationCount} annotations</span>
                  </div>
                  <div className="history-url" title={prompt.url}>
                    {truncateUrl(prompt.url)}
                  </div>
                  <div className="history-actions">
                    <button
                      className="history-btn"
                      onClick={() => handleCopy(prompt)}
                    >
                      {copiedId === prompt.id ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      className="history-btn history-btn-delete"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="history-footer">
            <button
              className="popup-btn popup-btn-secondary"
              onClick={handleClearAll}
            >
              Clear All History
            </button>
          </div>
        </>
      )}

      {history.length === 0 && (
        <div className="history-empty">
          No prompts generated yet
        </div>
      )}
    </div>
  );
}
