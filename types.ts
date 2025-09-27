export interface TextPair {
  original: string;
  translated: string;
}

export interface SlideData {
  slideNumber: number;
  texts: TextPair[];
  notes: TextPair[];
}

export interface DocxData {
  paragraphs: TextPair[];
}

export interface XlsxData {
  sheets: {
    sheetName: string;
    rows: {
        cells: TextPair[];
    }[];
  }[];
}

export interface GlossaryTerm {
  source: string;
  target: string;
}

export type AppState = 'initial' | 'processing' | 'results' | 'error';
export type FileType = 'pptx' | 'docx' | 'xlsx' | null;
