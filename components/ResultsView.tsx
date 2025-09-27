import React, { useState } from 'react';
import { SlideData, DocxData, XlsxData, GlossaryTerm, FileType } from '../types';
import { DownloadIcon, RefreshCwIcon, BookOpenIcon } from './icons';
import { PptxPreview } from './PptxPreview';
import { DocxPreview } from './DocxPreview';
import { XlsxPreview } from './XlsxPreview';
import { GlossaryModal } from './GlossaryModal';
import { SUPPORTED_LANGUAGES } from '../constants';

interface ResultsViewProps {
  fileType: FileType;
  originalFile: File | null;
  translatedData: SlideData[] | DocxData | XlsxData | null;
  onDownload: () => void;
  onRestart: () => void;
  onTranslateAgain: (glossary: GlossaryTerm[]) => void;
  downloadUrl: string | null;
  isDownloading: boolean;
  targetLanguage: string;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  fileType,
  translatedData,
  onDownload,
  onRestart,
  onTranslateAgain,
  downloadUrl,
  isDownloading,
  targetLanguage,
}) => {
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const targetLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || 'Selected Language';

  const handleAddTerm = (term: GlossaryTerm) => {
    setGlossary(prev => [...prev, term]);
  };

  const handleDeleteTerm = (index: number) => {
    setGlossary(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleTranslateAgain = () => {
    onTranslateAgain(glossary);
  }

  const renderPreview = () => {
    if (!translatedData) return null;
    switch (fileType) {
      case 'pptx':
        return <PptxPreview slides={translatedData as SlideData[]} targetLanguageName={targetLanguageName} />;
      case 'docx':
        return <DocxPreview data={translatedData as DocxData} targetLanguageName={targetLanguageName} />;
      case 'xlsx':
        return <XlsxPreview data={translatedData as XlsxData} targetLanguageName={targetLanguageName} />;
      default:
        return <p>Preview not available for this file type.</p>;
    }
  };

  return (
    <div className="w-full p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Translation Results</h2>
        <div className="flex items-center gap-2">
           <button
            onClick={() => setIsGlossaryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <BookOpenIcon className="w-5 h-5" />
            Glossary
          </button>
          <button
            onClick={handleTranslateAgain}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <RefreshCwIcon className="w-5 h-5" />
            Translate Again
          </button>
          <button
            onClick={onDownload}
            disabled={!translatedData || isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            <DownloadIcon className="w-5 h-5" />
            {isDownloading ? 'Preparing...' : 'Download'}
          </button>
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-slate-600 text-white font-medium rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200">
        {renderPreview()}
      </div>

      <GlossaryModal 
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        glossary={glossary}
        onAddTerm={handleAddTerm}
        onDeleteTerm={handleDeleteTerm}
      />
    </div>
  );
};