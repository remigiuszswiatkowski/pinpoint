import React, { useEffect, useCallback, useRef } from 'react';
import type { ElementContext } from '../../types';
import { useElementCapture } from '../hooks/useElementCapture';

interface ElementPickerProps {
  onSelect: (element: HTMLElement, context: ElementContext) => void;
}

export function ElementPicker({ onSelect }: ElementPickerProps) {
  const { capture } = useElementCapture();
  const hoveredElementRef = useRef<HTMLElement | null>(null);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Ignore our own UI elements
    if (target.closest('#pinpoint-root')) return;

    // Remove highlight from previous element
    if (hoveredElementRef.current && hoveredElementRef.current !== target) {
      hoveredElementRef.current.classList.remove('pinpoint-highlight');
    }

    // Add highlight to current element
    target.classList.add('pinpoint-highlight');
    hoveredElementRef.current = target;
  }, []);

  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove('pinpoint-highlight');
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Ignore our own UI elements
    if (target.closest('#pinpoint-root')) return;

    e.preventDefault();
    e.stopPropagation();

    // Remove highlight
    target.classList.remove('pinpoint-highlight');
    hoveredElementRef.current = null;

    // Capture context and notify parent
    const context = capture(target);
    onSelect(target, context);
  }, [capture, onSelect]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Escape to cancel
    if (e.key === 'Escape') {
      if (hoveredElementRef.current) {
        hoveredElementRef.current.classList.remove('pinpoint-highlight');
        hoveredElementRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    // Add event listeners
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    // Change cursor to indicate picker mode
    document.body.style.cursor = 'crosshair';

    return () => {
      // Clean up
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);

      // Restore cursor
      document.body.style.cursor = '';

      // Remove any lingering highlights
      if (hoveredElementRef.current) {
        hoveredElementRef.current.classList.remove('pinpoint-highlight');
      }
    };
  }, [handleMouseOver, handleMouseOut, handleClick, handleKeyDown]);

  // This component doesn't render anything visible
  return null;
}
