
import React, { useState, useCallback } from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';
import { UploadCloudIcon, AlertCircleIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  targetLanguage: Language;
  onLanguageChange: (langCode: string) => void;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, targetLanguage, onLanguageChange, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleFile = (file: File | null) => {
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      onFileSelect(file);
    } else {
      alert('Please upload a valid .pptx file.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Translate Your Presentation</h2>
      <p className="text-slate-600 mb-6">Upload a .pptx file, select a target language, and get a translated version in minutes.</p>
      
      <div className="mb-6">
        <label htmlFor="language-select" className="block text-sm font-medium text-slate-700 mb-2">Target Language</label>
        <select
          id="language-select"
          value={targetLanguage.code}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="mt-1 block w-full max-w-xs mx-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative block w-full border-2 ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'} border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
      >
        <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".pptx"
            onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
                Drag & drop a file or click to upload
            </span>
            <span className="block text-xs text-gray-500">
                .pptx files only
            </span>
        </label>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-center bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
            <AlertCircleIcon className="w-5 h-5 mr-2" />
            <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
};
