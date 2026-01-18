import React, { useState, useEffect, useCallback } from 'react';
import { History } from './History';
import { copyToClipboard } from '../utils/prompt-generator';

type View = 'main' | 'history';

export function Popup() {
  const [view, setView] = useState<View>('main');
  const [pickerActive, setPickerActive] = useState(false);
  const [annotationCount, setAnnotationCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current tab URL and annotation count
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab?.url) {
        setCurrentUrl(tab.url);

        // Get annotation count
        const response = await chrome.runtime.sendMessage({
          type: 'GET_ANNOTATION_COUNT',
          payload: { url: tab.url },
        });
        if (response?.count !== undefined) {
          setAnnotationCount(response.count);
        }
      }
    });
  }, []);

  const handleTogglePicker = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      // Send to background with tab ID so it can notify the content script
      const response = await chrome.runtime.sendMessage({
        type: 'TOGGLE_PICKER',
        tabId: tab.id
      });
      if (response?.active !== undefined) {
        setPickerActive(response.active);
      }
    }
  }, []);

  const handleExport = useCallback(async () => {
    setError(null);
    setCopied(false);

    const response = await chrome.runtime.sendMessage({
      type: 'EXPORT_ANNOTATIONS',
      payload: { url: currentUrl },
    });

    if (response?.error) {
      setError(response.error);
      return;
    }

    if (response?.prompt) {
      const success = await copyToClipboard(response.prompt);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError('Failed to copy to clipboard');
      }
    }
  }, [currentUrl]);

  const handleClear = useCallback(async () => {
    await chrome.runtime.sendMessage({
      type: 'CLEAR_ANNOTATIONS',
      payload: { url: currentUrl },
    });
    setAnnotationCount(0);
  }, [currentUrl]);

  if (view === 'history') {
    return <History onBack={() => setView('main')} />;
  }

  // Check if we're on localhost
  const isLocalhost = currentUrl.startsWith('http://localhost') || currentUrl.startsWith('http://127.0.0.1');

  return (
    <div className="popup">
      <div className="popup-header">
        <h1 className="popup-title">Pinpoint</h1>
      </div>

      {!isLocalhost ? (
        <div className="popup-notice">
          Pinpoint only works on localhost
        </div>
      ) : (
        <>
          <div className="popup-section">
            <button
              className={`popup-btn popup-btn-toggle ${pickerActive ? 'active' : ''}`}
              onClick={handleTogglePicker}
            >
              {pickerActive ? 'Stop Picking' : 'Start Picking'}
            </button>
          </div>

          <div className="popup-section">
            <div className="popup-count">
              {annotationCount} annotation{annotationCount !== 1 ? 's' : ''} on this page
            </div>
          </div>

          {error && (
            <div className="popup-error">{error}</div>
          )}

          <div className="popup-actions">
            <button
              className="popup-btn popup-btn-primary"
              onClick={handleExport}
              disabled={annotationCount === 0}
            >
              {copied ? 'Copied!' : 'Export to Clipboard'}
            </button>

            <button
              className="popup-btn popup-btn-secondary"
              onClick={handleClear}
              disabled={annotationCount === 0}
            >
              Clear
            </button>
          </div>
        </>
      )}

      <div className="popup-footer">
        <button
          className="popup-link"
          onClick={() => setView('history')}
        >
          View History
        </button>
      </div>
    </div>
  );
}
