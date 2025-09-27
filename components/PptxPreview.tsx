import React, { useState } from 'react';
import { SlideData } from '../types';

interface PptxPreviewProps {
  slides: SlideData[];
  targetLanguageName: string;
}

export const PptxPreview: React.FC<PptxPreviewProps> = ({ slides, targetLanguageName }) => {
  const [selectedSlide, setSelectedSlide] = useState(0);

  if (!slides || slides.length === 0) {
    return <p>No content to display.</p>;
  }

  const currentSlide = slides[selectedSlide];

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-h-[70vh]">
      {/* Slide Navigation */}
      <div className="lg:w-1/5 flex-shrink-0 overflow-y-auto pr-2 border-r">
        <h3 className="text-lg font-semibold mb-2 text-slate-700 sticky top-0 bg-white pb-2">Slides</h3>
        <ul className="space-y-2">
          {slides.map((slide, index) => (
            <li key={slide.slideNumber}>
              <button
                onClick={() => setSelectedSlide(index)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  selectedSlide === index
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Slide {slide.slideNumber}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Slide Content */}
      <div className="lg:w-4/5 flex-grow overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          Slide {currentSlide.slideNumber} - Content
        </h3>
        <div className="space-y-4">
          {currentSlide.texts.map((text, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-500 mb-1">Original</p>
              <p className="text-gray-800">{text.original}</p>
              <hr className="my-3" />
              <p className="text-sm font-medium text-indigo-500 mb-1">Translated ({targetLanguageName})</p>
              <p className="text-indigo-800 font-medium">{text.translated}</p>
            </div>
          ))}
          {currentSlide.texts.length === 0 && <p className="text-gray-500">No text content on this slide.</p>}
        </div>

        {currentSlide.notes.length > 0 && (
          <>
            <h3 className="text-xl font-bold mt-8 mb-4 text-slate-800">
              Slide {currentSlide.slideNumber} - Notes
            </h3>
            <div className="space-y-4">
              {currentSlide.notes.map((note, index) => (
                <div key={index} className="p-4 border rounded-lg bg-yellow-50">
                  <p className="text-sm font-medium text-gray-500 mb-1">Original</p>
                  <p className="text-gray-800">{note.original}</p>
                  <hr className="my-3" />
                  <p className="text-sm font-medium text-yellow-600 mb-1">Translated ({targetLanguageName})</p>
                  <p className="text-yellow-800 font-medium">{note.translated}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};