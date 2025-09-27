
export interface TextElement {
  original: string;
  translated: string;
}

export interface SlideData {
  slideNumber: number;
  texts: TextElement[];
  notes: TextElement[];
}

export type ProcessingState = 'idle' | 'parsing' | 'translating' | 'reassembling' | 'done' | 'error';

export interface Language {
  code: string;
  name: string;
}
