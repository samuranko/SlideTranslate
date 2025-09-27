
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { ResultsView } from './components/ResultsView';
import { extractSlideData, reassemblePptx } from './services/pptxService';
import { translateAllText } from './services/geminiService';
import { SlideData, ProcessingState, Language } from './types';
import { DEFAULT_LANGUAGE, LANGUAGES } from './constants';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [translatedFileUrl, setTranslatedFileUrl] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
    setSlides([]);
    setTranslatedFileUrl(null);
    await processPresentation(selectedFile, targetLanguage);
  };
  
  const processPresentation = useCallback(async (selectedFile: File, language: Language) => {
    try {
      setProcessingState('parsing');
      setProgress(10);
      setProgressMessage(`Parsing slides from ${selectedFile.name}...`);
      
      const extractedSlides = await extractSlideData(selectedFile);
      if (extractedSlides.length === 0) {
        throw new Error("No text found in the presentation, or the file is not a valid .pptx file.");
      }
      
      setProgress(40);
      setProgressMessage(`Translating ${extractedSlides.reduce((acc, s) => acc + s.texts.length, 0)} text elements to ${language.name}...`);
      setProcessingState('translating');

      const translatedSlides = await translateAllText(extractedSlides, language.name);

      setProgress(80);
      setProgressMessage('Reassembling translated presentation...');
      setProcessingState('reassembling');
      
      const url = await reassemblePptx(selectedFile, translatedSlides);

      setSlides(translatedSlides);
      setTranslatedFileUrl(url);
      setProgress(100);
      setProcessingState('done');

    } catch (err) {
      console.error('Processing failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Processing failed: ${errorMessage}. Please check your API key and file, then try again.`);
      setProcessingState('error');
    }
  }, []);

  const handleReset = () => {
    setFile(null);
    setSlides([]);
    setProcessingState('idle');
    setProgress(0);
    setError(null);
    if (translatedFileUrl) {
      URL.revokeObjectURL(translatedFileUrl);
    }
    setTranslatedFileUrl(null);
  };
  
  const handleLanguageChange = (langCode: string) => {
    const newLang = LANGUAGES.find(l => l.code === langCode) || DEFAULT_LANGUAGE;
    setTargetLanguage(newLang);
    if(file && (processingState === 'done' || processingState === 'error')) {
      handleReset();
    }
  };


  const renderContent = () => {
    switch (processingState) {
      case 'idle':
      case 'error':
        return <FileUpload onFileSelect={handleFileSelect} targetLanguage={targetLanguage} onLanguageChange={handleLanguageChange} error={error} />;
      case 'parsing':
      case 'translating':
      case 'reassembling':
        return <ProcessingView progress={progress} message={progressMessage} />;
      case 'done':
        return (
          <ResultsView
            slides={slides}
            originalFileName={file!.name}
            translatedFileUrl={translatedFileUrl!}
            targetLanguageName={targetLanguage.name}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg transition-all duration-300">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} SlideTranslate. All rights reserved.</p>
      </footer>
    </div>
  );
}
