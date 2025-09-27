
import React from 'react';
import { APP_NAME } from '../constants';
import { LayersIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LayersIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-800">{APP_NAME}</h1>
          </div>
        </div>
      </div>
    </header>
  );
};
