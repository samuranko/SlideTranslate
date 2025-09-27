
import React from 'react';
import { SlideData } from '../types';
import { SlidePreview } from './SlidePreview';
import { DownloadIcon, RefreshCwIcon } from './icons';

interface ResultsViewProps {
  slides: SlideData[];
  originalFileName: string;
  translatedFileUrl: string;
  targetLanguageName: string;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  slides,
  originalFileName,
  translatedFileUrl,
  targetLanguageName,
  onReset,
}) => {
  const translatedFileName = `[${targetLanguageName}]_${originalFileName}`;

  return (
    <div className="space-y-8">
      <div className="text-center p-6 bg-green-50 border-2 border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Translation Complete!</h2>
        <p className="text-green-700 mb-6">Your presentation has been successfully translated.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
            href={translatedFileUrl}
            download={translatedFileName}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download Translated .pptx
            </a>
            <button
                onClick={onReset}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                <RefreshCwIcon className="w-5 h-5 mr-2" />
                Translate Another File
            </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Translation Preview</h3>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 rounded-lg bg-slate-50 p-4 border">
          {slides.map((slide) => (
            <SlidePreview key={slide.slideNumber} slide={slide} targetLanguageName={targetLanguageName} />
          ))}
        </div>
      </div>
    </div>
  );
};
