import React, { useEffect, useCallback, useRef, useState } from 'react';
import type { ElementContext } from '../../types';
import { useElementCapture } from '../hooks/useElementCapture';
import { pauseAllAnimations, resumeAllAnimations } from '../../utils/animation-control';
import { PauseIndicator } from './PauseIndicator';

interface ElementPickerProps {
  onSelect: (element: HTMLElement, context: ElementContext) => void;
}

export function ElementPicker({ onSelect }: ElementPickerProps) {
  const { capture } = useElementCapture();
  const hoveredElementRef = useRef<HTMLElement | null>(null);
  const [animationsPaused, setAnimationsPaused] = useState(false);

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
    console.log('[Pinpoint] Click detected on:', target);

    // Ignore our own UI elements
    if (target.closest('#pinpoint-root')) return;

    e.preventDefault();
    e.stopPropagation();

    // Remove highlight
    target.classList.remove('pinpoint-highlight');
    hoveredElementRef.current = null;

    // Capture context and notify parent
    console.log('[Pinpoint] Capturing context...');
    const context = capture(target);
    console.log('[Pinpoint] Context captured:', context);
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

    // Space to toggle animation pause
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      setAnimationsPaused(prev => {
        if (prev) {
          resumeAllAnimations();
          return false;
        } else {
          pauseAllAnimations();
          return true;
        }
      });
    }
  }, []);

  useEffect(() => {
    console.log('[Pinpoint] ElementPicker mounted - adding event listeners');

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

      // Resume animations if paused
      resumeAllAnimations();
    };
  }, [handleMouseOver, handleMouseOut, handleClick, handleKeyDown]);

  // Render pause indicator when animations are paused
  return animationsPaused ? <PauseIndicator /> : null;
}
