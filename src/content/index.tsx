import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Create shadow DOM for style isolation
const hostElement = document.createElement('div');
hostElement.id = 'pinpoint-root';
document.body.appendChild(hostElement);

const shadowRoot = hostElement.attachShadow({ mode: 'open' });

// Create container inside shadow DOM
const container = document.createElement('div');
container.id = 'pinpoint-container';
shadowRoot.appendChild(container);

// Inject styles into shadow DOM
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  * {
    box-sizing: border-box;
  }

  #pinpoint-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #1a1a1a;
  }

  .pinpoint-highlight {
    outline: 2px dashed #666 !important;
    outline-offset: 2px;
  }

  .pinpoint-selected {
    outline: 2px solid #000 !important;
    outline-offset: 2px;
  }

  .pinpoint-form {
    position: fixed;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2147483647;
    min-width: 280px;
    max-width: 320px;
  }

  .pinpoint-form-header {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }

  .pinpoint-form-selector {
    font-family: monospace;
    font-size: 11px;
    color: #333;
    background: #f5f5f5;
    padding: 4px 8px;
    border-radius: 4px;
    margin-bottom: 12px;
    word-break: break-all;
  }

  .pinpoint-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 12px;
    outline: none;
    transition: border-color 0.15s;
  }

  .pinpoint-input:focus {
    border-color: #000;
  }

  .pinpoint-input::placeholder {
    color: #999;
  }

  .pinpoint-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .pinpoint-btn {
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .pinpoint-btn-primary {
    background: #000;
    color: #fff;
    border: 1px solid #000;
  }

  .pinpoint-btn-primary:hover {
    background: #333;
  }

  .pinpoint-btn-secondary {
    background: #fff;
    color: #333;
    border: 1px solid #ddd;
  }

  .pinpoint-btn-secondary:hover {
    background: #f5f5f5;
  }

  .pinpoint-annotations {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 2147483646;
    max-width: 300px;
    max-height: 300px;
    overflow-y: auto;
  }

  .pinpoint-annotation-item {
    padding: 8px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.15s;
  }

  .pinpoint-annotation-item:last-child {
    border-bottom: none;
  }

  .pinpoint-annotation-item:hover {
    background: #f9f9f9;
  }

  .pinpoint-annotation-note {
    font-size: 13px;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .pinpoint-annotation-selector {
    font-family: monospace;
    font-size: 10px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pinpoint-annotation-delete {
    float: right;
    color: #999;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
  }

  .pinpoint-annotation-delete:hover {
    color: #333;
  }

  .pinpoint-pause-indicator {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #000;
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    z-index: 2147483647;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;
shadowRoot.appendChild(styleSheet);

// Mount React app
const root = createRoot(container);
root.render(<App />);
