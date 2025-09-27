import React from 'react';
import { DocxData } from '../types';

interface DocxPreviewProps {
  data: DocxData;
  targetLanguageName: string;
}

export const DocxPreview: React.FC<DocxPreviewProps> = ({ data, targetLanguageName }) => {
  if (!data || data.paragraphs.length === 0) {
    return <p>No content to display.</p>;
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-4">
      <h3 className="text-xl font-bold mb-4 text-slate-800">Document Content</h3>
      <div className="space-y-4">
        {data.paragraphs.map((p, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-500 mb-1">Original</p>
            <p className="text-gray-800">{p.original}</p>
            <hr className="my-3" />
            <p className="text-sm font-medium text-indigo-500 mb-1">Translated ({targetLanguageName})</p>
            <p className="text-indigo-800 font-medium">{p.translated}</p>
          </div>
        ))}
      </div>
    </div>
  );
};