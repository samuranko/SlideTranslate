import { DocxData } from '../types';

declare const JSZip: any;

export const extractDocxData = async (file: File): Promise<DocxData> => {
  try {
    const zip = await JSZip.loadAsync(file);
    const content = await zip.file('word/document.xml').async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    const textNodes = xmlDoc.getElementsByTagName('w:t');
    
    const paragraphs: string[] = [];
    for (let i = 0; i < textNodes.length; i++) {
      const node = textNodes[i];
      if (node.textContent) {
        paragraphs.push(node.textContent);
      }
    }

    return {
      paragraphs: paragraphs.map((p) => ({ original: p, translated: '' })),
    };
  } catch (e) {
    console.error("Failed to load or parse .docx file:", e);
    throw new Error("Could not read the file. It may be corrupted or not a valid .docx file.");
  }
};

export const reassembleDocx = async (originalFile: File, translatedData: DocxData): Promise<string> => {
    const zip = await JSZip.loadAsync(originalFile);
    const content = await zip.file('word/document.xml').async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    const textNodes = xmlDoc.getElementsByTagName('w:t');

    let translatedTextIndex = 0;
    const allTranslatedTexts = translatedData.paragraphs.map(p => p.translated);

    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        if (node.textContent && translatedTextIndex < allTranslatedTexts.length) {
            node.textContent = allTranslatedTexts[translatedTextIndex];
            translatedTextIndex++;
        }
    }

    const serializer = new XMLSerializer();
    const newContent = serializer.serializeToString(xmlDoc);

    zip.file('word/document.xml', newContent);

    const blob = await zip.generateAsync({ type: 'blob' });
    return URL.createObjectURL(blob);
};
