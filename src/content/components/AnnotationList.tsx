import React from 'react';
import type { Annotation } from '../../types';

interface AnnotationListProps {
  annotations: Annotation[];
  onDelete: (id: string) => void;
  onHighlight: (annotation: Annotation) => void;
}

export function AnnotationList({ annotations, onDelete, onHighlight }: AnnotationListProps) {
  if (annotations.length === 0) return null;

  return (
    <div className="pinpoint-annotations">
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
        {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
      </div>

      {annotations.map((annotation) => {
        // Truncate selector for display
        const displaySelector = annotation.context.selector.length > 30
          ? annotation.context.selector.slice(0, 27) + '...'
          : annotation.context.selector;

        return (
          <div
            key={annotation.id}
            className="pinpoint-annotation-item"
            onClick={() => onHighlight(annotation)}
          >
            <span
              className="pinpoint-annotation-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(annotation.id);
              }}
              title="Delete"
            >
              ×
            </span>
            <div className="pinpoint-annotation-note">"{annotation.note}"</div>
            <div className="pinpoint-annotation-selector" title={annotation.context.selector}>
              {displaySelector}
            </div>
          </div>
        );
      })}
    </div>
  );
}
