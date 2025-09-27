
import { GoogleGenAI, Type } from "@google/genai";
import { SlideData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const translateAllText = async (slides: SlideData[], targetLanguage: string): Promise<SlideData[]> => {
  const allOriginalTexts: string[] = [];
  slides.forEach(slide => {
    allOriginalTexts.push(...slide.texts.map(t => t.original));
    allOriginalTexts.push(...slide.notes.map(n => n.original));
  });

  if (allOriginalTexts.length === 0) {
    return slides;
  }
  
  // To avoid issues with empty strings in the API call
  const nonEmptyOriginalTexts = allOriginalTexts.map(text => text.trim() === '' ? '[EMPTY]' : text);

  const prompt = `Translate the following array of text elements into ${targetLanguage}. Maintain the exact same array structure and order. If an element is '[EMPTY]', return an empty string "" in its place.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${prompt}\n\n${JSON.stringify(nonEmptyOriginalTexts)}`,
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
  const translatedTexts: string[] = JSON.parse(translatedTextsString);

  if (translatedTexts.length !== allOriginalTexts.length) {
    throw new Error('Translation failed: The number of translated items does not match the original.');
  }

  let currentIndex = 0;
  const translatedSlides: SlideData[] = slides.map(slide => {
    const newTexts = slide.texts.map(text => ({
      original: text.original,
      translated: translatedTexts[currentIndex++]
    }));
    const newNotes = slide.notes.map(note => ({
      original: note.original,
      translated: translatedTexts[currentIndex++]
    }));

    return {
      ...slide,
      texts: newTexts,
      notes: newNotes,
    };
  });

  return translatedSlides;
};
