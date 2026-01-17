import type { GeneratedPrompt, StorageData } from '../types';

const MAX_HISTORY = 50;
const STORAGE_KEY = 'pinpoint_data';

/**
 * Get storage data
 */
async function getStorageData(): Promise<StorageData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || {
    annotations: {},
    history: [],
    pickerActive: false,
  };
}

/**
 * Save storage data
 */
async function saveStorageData(data: StorageData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

/**
 * Save a generated prompt to history
 * Maintains max 50 entries, removes oldest when limit reached
 */
export async function saveToHistory(prompt: GeneratedPrompt): Promise<void> {
  const data = await getStorageData();

  // Add new prompt at the beginning
  data.history.unshift(prompt);

  // Trim to max size
  if (data.history.length > MAX_HISTORY) {
    data.history = data.history.slice(0, MAX_HISTORY);
  }

  await saveStorageData(data);
}

/**
 * Get all history entries
 */
export async function getHistory(): Promise<GeneratedPrompt[]> {
  const data = await getStorageData();
  return data.history;
}

/**
 * Get history filtered by URL
 */
export async function getHistoryByUrl(url: string): Promise<GeneratedPrompt[]> {
  const data = await getStorageData();
  return data.history.filter(p => p.url === url);
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
  const data = await getStorageData();
  data.history = [];
  await saveStorageData(data);
}

/**
 * Delete a specific history entry
 */
export async function deleteHistoryEntry(id: string): Promise<void> {
  const data = await getStorageData();
  data.history = data.history.filter(p => p.id !== id);
  await saveStorageData(data);
}
