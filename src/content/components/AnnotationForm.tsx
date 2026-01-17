import React, { useState, useEffect, useRef } from 'react';
import type { ElementContext } from '../../types';

interface AnnotationFormProps {
  element: HTMLElement;
  context: ElementContext;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export function AnnotationForm({ element, context, onSave, onCancel }: AnnotationFormProps) {
  const [note, setNote] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate position: to the right of the element, below it
  const rect = element.getBoundingClientRect();
  const formStyle: React.CSSProperties = {
    top: Math.min(rect.bottom + 8, window.innerHeight - 200),
    left: Math.min(rect.right + 8, window.innerWidth - 340),
  };

  // Add selected highlight to element
  useEffect(() => {
    element.classList.add('pinpoint-selected');
    return () => element.classList.remove('pinpoint-selected');
  }, [element]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && note.trim()) {
        onSave(note.trim());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [note, onSave, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onSave(note.trim());
    }
  };

  // Truncate selector for display
  const displaySelector = context.selector.length > 50
    ? context.selector.slice(0, 47) + '...'
    : context.selector;

  return (
    <div className="pinpoint-form" style={formStyle}>
      <div className="pinpoint-form-header">Add annotation</div>
      <div className="pinpoint-form-selector" title={context.selector}>
        {displaySelector}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="pinpoint-input"
          placeholder="e.g., Make this snappier"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="pinpoint-buttons">
          <button
            type="button"
            className="pinpoint-btn pinpoint-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="pinpoint-btn pinpoint-btn-primary"
            disabled={!note.trim()}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
