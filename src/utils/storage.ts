import type { Annotation, StorageData } from '../types';

const STORAGE_KEY = 'pinpoint_data';

/**
 * Get all storage data
 */
export async function getStorageData(): Promise<StorageData> {
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
 * Get annotations for a specific URL
 */
export async function getAnnotations(url: string): Promise<Annotation[]> {
  const data = await getStorageData();
  return data.annotations[url] || [];
}

/**
 * Save an annotation for a URL
 */
export async function saveAnnotation(url: string, annotation: Annotation): Promise<void> {
  const data = await getStorageData();

  if (!data.annotations[url]) {
    data.annotations[url] = [];
  }

  data.annotations[url].push(annotation);
  await saveStorageData(data);
}

/**
 * Delete an annotation by ID
 */
export async function deleteAnnotation(url: string, annotationId: string): Promise<void> {
  const data = await getStorageData();

  if (data.annotations[url]) {
    data.annotations[url] = data.annotations[url].filter(a => a.id !== annotationId);
    await saveStorageData(data);
  }
}

/**
 * Clear all annotations for a URL
 */
export async function clearAnnotations(url: string): Promise<void> {
  const data = await getStorageData();
  delete data.annotations[url];
  await saveStorageData(data);
}

/**
 * Get annotation count for a URL
 */
export async function getAnnotationCount(url: string): Promise<number> {
  const annotations = await getAnnotations(url);
  return annotations.length;
}

/**
 * Get or set picker active state
 */
export async function getPickerState(): Promise<boolean> {
  const data = await getStorageData();
  return data.pickerActive;
}

export async function setPickerState(active: boolean): Promise<void> {
  const data = await getStorageData();
  data.pickerActive = active;
  await saveStorageData(data);
}
