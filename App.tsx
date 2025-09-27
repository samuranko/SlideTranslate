import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { ResultsView } from './components/ResultsView';
import { AlertCircleIcon } from './components/icons';
import { AppState, SlideData, DocxData, XlsxData, GlossaryTerm, FileType } from './types';
import { extractSlideData, reassemblePptx } from './services/pptxService';
import { extractDocxData, createTranslatedDocxBlobUrl } from './services/docxService';
import { extractXlsxData, reassembleXlsx } from './services/xlsxService';
import { translatePresentation, translateDocx, translateXlsx } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>(null);
  const [targetLanguage, setTargetLanguage] = useState('es'); // Default to Spanish
  const [extractedData, setExtractedData] = useState<SlideData[] | DocxData | XlsxData | null>(null);
  const [translatedData, setTranslatedData] = useState<SlideData[] | DocxData | XlsxData | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const resetState = () => {
    setAppState('initial');
    setFile(null);
    setFileType(null);
    setExtractedData(null);
    setTranslatedData(null);
    setProcessingProgress(0);
    setProcessingMessage('');
    setError(null);
    setDownloadUrl(null);
    setIsDownloading(false);
  };

  const handleLanguageChange = (languageCode: string) => {
    setTargetLanguage(languageCode);
  };

  const handleFileUpload = async (uploadedFile: File, type: FileType) => {
    setFile(uploadedFile);
    setFileType(type);
    setAppState('processing');
    setError(null);
    setProcessingMessage('Extracting content from your file...');
    setProcessingProgress(10);

    try {
      let data;
      if (type === 'pptx') {
        data = await extractSlideData(uploadedFile);
      } else if (type === 'docx') {
        data = await extractDocxData(uploadedFile);
      } else if (type === 'xlsx') {
        data = await extractXlsxData(uploadedFile);
      }
      setExtractedData(data);
      setProcessingMessage('Content extracted. Preparing for translation...');
      setProcessingProgress(30);
      await handleTranslate(data, type, [], targetLanguage); // Use selected language
    } catch (e: any) {
      setError(`Error processing file: ${e.message}`);
      setAppState('error');
    }
  };

  const handleTranslate = async (dataToTranslate: any, type: FileType, glossary: GlossaryTerm[], language: string) => {
      if (!dataToTranslate) {
        setError('No content was extracted to translate.');
        setAppState('error');
        return;
      }

      setAppState('processing');
      setProcessingMessage('Translating with Gemini AI...');
      setProcessingProgress(40);
      try {
        let translated;
        const onProgress = (progress: number) => setProcessingProgress(40 + (progress * 0.6)); // Scale 0-100 to 40-100

        if (type === 'pptx') {
          translated = await translatePresentation(dataToTranslate, language, glossary, onProgress);
        } else if (type === 'docx') {
          translated = await translateDocx(dataToTranslate, language, glossary, onProgress);
        } else if (type === 'xlsx') {
          translated = await translateXlsx(dataToTranslate, language, glossary, onProgress);
        }

        setTranslatedData(translated);
        setAppState('results');
      } catch (e: any) {
        setError(`Translation failed: ${e.message}`);
        setAppState('error');
      }
  };

  const handleDownload = async () => {
    if (!file || !translatedData || !fileType) return;
    
    setIsDownloading(true);
    
    try {
        let url;
        if (fileType === 'pptx') {
          url = await reassemblePptx(file, translatedData as SlideData[]);
        } else if (fileType === 'docx') {
          // Note: docx reassembly is simplified to a text file
          url = createTranslatedDocxBlobUrl(translatedData as DocxData);
        } else if (fileType === 'xlsx') {
          url = reassembleXlsx(translatedData as XlsxData);
        }
        
        if (url) {
            setDownloadUrl(url);
            // Trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = `translated_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    } catch (e: any) {
        setError(`Failed to create downloadable file: ${e.message}`);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleTranslateAgain = useCallback((glossary: GlossaryTerm[]) => {
    if (extractedData && fileType) {
        handleTranslate(extractedData, fileType, glossary, targetLanguage);
    }
  }, [extractedData, fileType, targetLanguage]);

  const renderContent = () => {
    switch (appState) {
      case 'processing':
        return <ProcessingView progress={processingProgress} message={processingMessage} />;
      case 'results':
        return (
          <ResultsView
            fileType={fileType}
            originalFile={file}
            translatedData={translatedData}
            onDownload={handleDownload}
            onRestart={resetState}
            onTranslateAgain={handleTranslateAgain}
            downloadUrl={downloadUrl}
            isDownloading={isDownloading}
            targetLanguage={targetLanguage}
          />
        );
      case 'error':
        return (
          <div className="text-center p-8">
            <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">An Error Occurred</h2>
            <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>
            <button onClick={resetState} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Try Again
            </button>
          </div>
        );
      case 'initial':
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Translate Your Documents Instantly</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Upload a PowerPoint, Word, or Excel file, and our AI will translate its content while preserving the layout.</p>
            <FileUpload 
              onFileUpload={handleFileUpload} 
              disabled={appState !== 'initial'} 
              targetLanguage={targetLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default App;