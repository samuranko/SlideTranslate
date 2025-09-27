import { DocxData } from '../types';

declare const mammoth: any;

export const extractDocxData = async (file: File): Promise<DocxData> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const paragraphs = result.value.split('\n').filter((p: string) => p.trim() !== '');
    
    return {
      paragraphs: paragraphs.map((p: string) => ({ original: p, translated: '' })),
    };
  } catch (e) {
    console.error("Failed to load or parse .docx file:", e);
    throw new Error("Could not read the file. It may be corrupted or not a valid .docx file.");
  }
};

export const createTranslatedDocxBlobUrl = (translatedData: DocxData): string => {
  const content = translatedData.paragraphs.map(p => p.translated).join('\n\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  return URL.createObjectURL(blob);
};
