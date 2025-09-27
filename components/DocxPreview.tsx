import React from 'react';
import { DocxData } from '../types';
import { EditableText } from './EditableText';

interface DocxPreviewProps {
  data: DocxData;
  onUpdate: (updatedData: DocxData) => void;
}

export const DocxPreview: React.FC<DocxPreviewProps> = ({ data, onUpdate }) => {
  const handleTextChange = (index: number, newText: string) => {
    const updatedParagraphs = [...data.paragraphs];
    updatedParagraphs[index] = { ...updatedParagraphs[index], translated: newText };
    onUpdate({ paragraphs: updatedParagraphs });
  };

  return (
    <div className="h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-x-6">
        <h3 className="text-lg font-semibold mb-2 border-b pb-1 sticky top-0 bg-white z-10 p-2 -ml-2">Original Text</h3>
        <h3 className="text-lg font-semibold mb-2 border-b pb-1 sticky top-0 bg-white z-10 p-2 -ml-2">Translated Text (Editable)</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {data.paragraphs.map((pair, index) => (
          <React.Fragment key={index}>
            <div className="p-2 bg-gray-100 rounded-md min-h-[2.5rem] whitespace-pre-wrap break-words">
              {pair.original}
            </div>
            <div>
              <EditableText
                initialValue={pair.translated}
                onSave={(newValue) => handleTextChange(index, newValue)}
                textarea={pair.original.includes('\n') || pair.original.length > 80}
              />
            </div>
          </React.Fragment>
        ))}
        {data.paragraphs.length === 0 && (
          <p className="col-span-2 text-center text-gray-500 mt-4">No content to display.</p>
        )}
      </div>
    </div>
  );
};
