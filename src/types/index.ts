export interface ElementContext {
  selector: string;
  tagName: string;
  componentName?: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  styles: Record<string, string>;
  animations: AnimationInfo[];
  attributes: Record<string, string>;
  timestamp: number;
}

export interface AnimationInfo {
  name: string;
  currentTime: number | null;
  duration: number;
  playState: string;
}

export interface Annotation {
  id: string;
  note: string;
  context: ElementContext;
  createdAt: number;
}

export interface GeneratedPrompt {
  id: string;
  url: string;
  prompt: string;
  annotationCount: number;
  createdAt: number;
}

export type MessageType =
  | { type: 'TOGGLE_PICKER' }
  | { type: 'PICKER_STATE'; payload: { active: boolean } }
  | { type: 'SAVE_ANNOTATION'; payload: Annotation }
  | { type: 'GET_ANNOTATIONS'; payload: { url: string } }
  | { type: 'ANNOTATIONS_RESPONSE'; payload: Annotation[] }
  | { type: 'DELETE_ANNOTATION'; payload: { id: string } }
  | { type: 'CLEAR_ANNOTATIONS'; payload: { url: string } }
  | { type: 'EXPORT_ANNOTATIONS'; payload: { url: string } }
  | { type: 'EXPORT_RESPONSE'; payload: { prompt: string } }
  | { type: 'GET_ANNOTATION_COUNT'; payload: { url: string } }
  | { type: 'ANNOTATION_COUNT_RESPONSE'; payload: { count: number } };

export interface StorageData {
  annotations: Record<string, Annotation[]>;
  history: GeneratedPrompt[];
  pickerActive: boolean;
}
