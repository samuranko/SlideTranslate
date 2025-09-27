
import React from 'react';
import { SlideData } from '../types';

interface SlidePreviewProps {
  slide: SlideData;
  targetLanguageName: string;
}

const TextComparison: React.FC<{ original: string; translated: string }> = ({ original, translated }) => (
    <div className="grid grid-cols-2 gap-4 border-t border-gray-200 py-3">
        <p className="text-sm text-gray-700 break-words">{original}</p>
        <p className="text-sm text-indigo-800 break-words">{translated}</p>
    </div>
);


export const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, targetLanguageName }) => {
  const allTexts = [...slide.texts, ...slide.notes];
    
  if (allTexts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h4 className="text-lg font-semibold text-slate-800 mb-3 pb-2 border-b">Slide {slide.slideNumber}</h4>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <h5 className="font-semibold text-sm text-gray-600">Original (English)</h5>
        <h5 className="font-semibold text-sm text-indigo-600">Translated ({targetLanguageName})</h5>
      </div>
      <div className="divide-y divide-gray-200">
        {slide.texts.map((text, index) => (
            <TextComparison key={`text-${index}`} original={text.original} translated={text.translated} />
        ))}
        {slide.notes.length > 0 && (
            <div className="pt-4 mt-4 border-t-2 border-dashed">
                <h6 className="font-semibold text-xs text-gray-500 uppercase col-span-2 mb-2">Presenter Notes</h6>
                {slide.notes.map((note, index) => (
                     <TextComparison key={`note-${index}`} original={note.original} translated={note.translated} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
