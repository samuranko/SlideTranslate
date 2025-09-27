import { GoogleGenAI, Type } from "@google/genai";
import { SlideData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const BATCH_SIZE = 50; // Number of text elements to translate per API call

type ProgressCallback = (progress: number, message: string) => void;

export const translateAllText = async (
  slides: SlideData[], 
  targetLanguage: string,
  onProgress?: ProgressCallback
): Promise<SlideData[]> => {
  const allOriginalTexts: string[] = [];
  slides.forEach(slide => {
    allOriginalTexts.push(...slide.texts.map(t => t.original));
    allOriginalTexts.push(...slide.notes.map(n => n.original));
  });

  if (allOriginalTexts.length === 0) {
    return slides;
  }
  
  const allTranslatedTexts: string[] = [];
  const totalBatches = Math.ceil(allOriginalTexts.length / BATCH_SIZE);

  for (let i = 0; i < allOriginalTexts.length; i += BATCH_SIZE) {
    const batch = allOriginalTexts.slice(i, i + BATCH_SIZE);
    const currentBatchNumber = (i / BATCH_SIZE) + 1;
    
    if (onProgress) {
      // Calculate progress within the 40% to 80% range allocated for translation
      const baseProgress = 40;
      const translationProgressRange = 40;
      const progressWithinRange = Math.round(((i / allOriginalTexts.length) * translationProgressRange));
      
      onProgress(
        baseProgress + progressWithinRange,
        `Translating batch ${currentBatchNumber} of ${totalBatches}...`
      );
    }
    
    const nonEmptyBatch = batch.map(text => text.trim() === '' ? '[EMPTY]' : text);
    const prompt = `Translate the following array of text elements into ${targetLanguage}. Maintain the exact same array structure and order. If an element is '[EMPTY]', return an empty string "" in its place.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${prompt}\n\n${JSON.stringify(nonEmptyBatch)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        }
      });

      const translatedTextsString = response.text.trim();
      const translatedBatch: string[] = JSON.parse(translatedTextsString);

      if (translatedBatch.length !== batch.length) {
        throw new Error(`Batch translation failed: mismatch in item count.`);
      }

      allTranslatedTexts.push(...translatedBatch);
    } catch (e) {
      console.error("Error translating batch:", e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Failed to translate batch ${currentBatchNumber}. (${errorMessage})`);
    }
  }

  if (allTranslatedTexts.length !== allOriginalTexts.length) {
    throw new Error('Translation failed: The total number of translated items does not match the original.');
  }

  let currentIndex = 0;
  const translatedSlides: SlideData[] = slides.map(slide => {
    const newTexts = slide.texts.map(text => ({
      original: text.original,
      translated: allTranslatedTexts[currentIndex++]
    }));
    const newNotes = slide.notes.map(note => ({
      original: note.original,
      translated: allTranslatedTexts[currentIndex++]
    }));

    return {
      ...slide,
      texts: newTexts,
      notes: newNotes,
    };
  });

  return translatedSlides;
};