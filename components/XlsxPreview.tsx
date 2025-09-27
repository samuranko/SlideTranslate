import React, { useState } from 'react';
import { XlsxData } from '../types';

interface XlsxPreviewProps {
  data: XlsxData;
  targetLanguageName: string;
}

export const XlsxPreview: React.FC<XlsxPreviewProps> = ({ data }) => {
  const [selectedSheet, setSelectedSheet] = useState(0);

  if (!data || data.sheets.length === 0) {
    return <p>No content to display.</p>;
  }

  const currentSheet = data.sheets[selectedSheet];

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="flex-shrink-0 border-b mb-2">
        <div className="flex space-x-2">
          {data.sheets.map((sheet, index) => (
            <button
              key={sheet.sheetName}
              onClick={() => setSelectedSheet(index)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedSheet === index
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {sheet.sheetName}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSheet.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 border-r text-sm">
                    <div className="text-gray-500">{cell.original}</div>
                    <div className="font-medium text-indigo-700 mt-1">{cell.translated}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};