import { useCallback } from 'react';
import type { ElementContext } from '../../types';
import { captureElementContext } from '../../utils/context-capture';

/**
 * Hook for capturing element context
 */
export function useElementCapture() {
  const capture = useCallback((element: HTMLElement): ElementContext => {
    return captureElementContext(element);
  }, []);

  return { capture };
}
