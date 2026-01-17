import React, { useState, useEffect, useCallback } from 'react';
import type { Annotation, ElementContext, MessageType } from '../types';
import { ElementPicker } from './components/ElementPicker';
import { AnnotationForm } from './components/AnnotationForm';
import { AnnotationList } from './components/AnnotationList';

export default function App() {
  const [pickerActive, setPickerActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedContext, setSelectedContext] = useState<ElementContext | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Listen for messages from background/popup
  useEffect(() => {
    const handleMessage = (message: MessageType) => {
      if (message.type === 'PICKER_STATE') {
        setPickerActive(message.payload.active);
        if (!message.payload.active) {
          setSelectedElement(null);
          setSelectedContext(null);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Load annotations on mount
  useEffect(() => {
    loadAnnotations();
  }, []);

  const loadAnnotations = useCallback(async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_ANNOTATIONS',
      payload: { url: window.location.href },
    });
    if (response?.annotations) {
      setAnnotations(response.annotations);
    }
  }, []);

  const handleElementSelect = useCallback((element: HTMLElement, context: ElementContext) => {
    setSelectedElement(element);
    setSelectedContext(context);
  }, []);

  const handleSaveAnnotation = useCallback(async (note: string) => {
    if (!selectedContext) return;

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      note,
      context: selectedContext,
      createdAt: Date.now(),
    };

    await chrome.runtime.sendMessage({
      type: 'SAVE_ANNOTATION',
      payload: annotation,
    });

    // Clear selection but stay in picker mode
    setSelectedElement(null);
    setSelectedContext(null);

    // Reload annotations
    await loadAnnotations();
  }, [selectedContext, loadAnnotations]);

  const handleCancelAnnotation = useCallback(() => {
    setSelectedElement(null);
    setSelectedContext(null);
  }, []);

  const handleDeleteAnnotation = useCallback(async (id: string) => {
    await chrome.runtime.sendMessage({
      type: 'DELETE_ANNOTATION',
      payload: { id },
    });
    await loadAnnotations();
  }, [loadAnnotations]);

  const handleHighlightAnnotation = useCallback((annotation: Annotation) => {
    try {
      const element = document.querySelector(annotation.context.selector) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('pinpoint-selected');
        setTimeout(() => element.classList.remove('pinpoint-selected'), 2000);
      }
    } catch {
      // Selector may no longer be valid
    }
  }, []);

  return (
    <>
      {pickerActive && !selectedElement && (
        <ElementPicker onSelect={handleElementSelect} />
      )}

      {selectedElement && selectedContext && (
        <AnnotationForm
          element={selectedElement}
          context={selectedContext}
          onSave={handleSaveAnnotation}
          onCancel={handleCancelAnnotation}
        />
      )}

      {annotations.length > 0 && !pickerActive && (
        <AnnotationList
          annotations={annotations}
          onDelete={handleDeleteAnnotation}
          onHighlight={handleHighlightAnnotation}
        />
      )}
    </>
  );
}
