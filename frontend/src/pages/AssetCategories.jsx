import React from 'react';

const AssetCategories = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
        Asset Categories
      </h1>
      <p className="mt-2 text-gray-500 max-w-3xl">
        Organize and classify industrial machinery, robotic tooling, and plant infrastructure.
      </p>
      <div className="mt-8 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="mt-2 block text-sm font-semibold text-gray-600">No asset categories configured</span>
        <p className="mt-1 text-xs text-gray-400">This page is a placeholder for asset category management views.</p>
      </div>
    </div>
  );
};

export default AssetCategories;
