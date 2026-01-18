import type { MessageType, Annotation } from '../types';
import {
  getAnnotations,
  saveAnnotation,
  deleteAnnotation,
  clearAnnotations,
  getAnnotationCount,
  getPickerState,
  setPickerState,
} from '../utils/storage';
import { generatePrompt } from '../utils/prompt-generator';
import { saveToHistory } from '../utils/history';

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message: MessageType, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(
  message: MessageType,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  const tabUrl = sender.tab?.url || '';

  switch (message.type) {
    case 'TOGGLE_PICKER': {
      const currentState = await getPickerState();
      const newState = !currentState;
      await setPickerState(newState);

      // Get tab ID from message (sent by popup) or from sender (sent by content script)
      const tabId = (message as { tabId?: number }).tabId || sender.tab?.id;

      // Notify content script
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          type: 'PICKER_STATE',
          payload: { active: newState },
        });
      }

      // Update badge
      await updateBadge(tabId, newState);

      return { active: newState };
    }

    case 'SAVE_ANNOTATION': {
      const annotation = message.payload as Annotation;
      await saveAnnotation(tabUrl, annotation);
      await updateAnnotationCount(sender.tab?.id, tabUrl);
      return { success: true };
    }

    case 'GET_ANNOTATIONS': {
      const url = (message.payload as { url: string }).url;
      const annotations = await getAnnotations(url);
      return { annotations };
    }

    case 'DELETE_ANNOTATION': {
      const { id } = message.payload as { id: string };
      await deleteAnnotation(tabUrl, id);
      await updateAnnotationCount(sender.tab?.id, tabUrl);
      return { success: true };
    }

    case 'CLEAR_ANNOTATIONS': {
      const url = (message.payload as { url: string }).url;
      await clearAnnotations(url);
      await updateAnnotationCount(sender.tab?.id, tabUrl);
      return { success: true };
    }

    case 'EXPORT_ANNOTATIONS': {
      const url = (message.payload as { url: string }).url;
      const annotations = await getAnnotations(url);

      if (annotations.length === 0) {
        return { prompt: null, error: 'No annotations to export' };
      }

      const generatedPrompt = generatePrompt(annotations, url);
      await saveToHistory(generatedPrompt);

      return { prompt: generatedPrompt.prompt };
    }

    case 'GET_ANNOTATION_COUNT': {
      const url = (message.payload as { url: string }).url;
      const count = await getAnnotationCount(url);
      return { count };
    }

    default:
      return { error: 'Unknown message type' };
  }
}

async function updateBadge(tabId: number | undefined, active: boolean): Promise<void> {
  if (!tabId) return;

  if (active) {
    await chrome.action.setBadgeText({ tabId, text: 'ON' });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#000' });
  } else {
    await chrome.action.setBadgeText({ tabId, text: '' });
  }
}

async function updateAnnotationCount(tabId: number | undefined, url: string): Promise<void> {
  if (!tabId) return;

  const count = await getAnnotationCount(url);
  if (count > 0) {
    await chrome.action.setBadgeText({ tabId, text: count.toString() });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#333' });
  }
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Pinpoint extension installed');
});
