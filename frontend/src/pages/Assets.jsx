import React from 'react';

const Assets = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
        Assets Management
      </h1>
      <p className="mt-2 text-gray-500 max-w-3xl">
        Manage the system assets list, categories, serial numbers, and maintenance statuses.
      </p>
      <div className="mt-8 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="mt-2 block text-sm font-semibold text-gray-600">No assets data displayed</span>
        <p className="mt-1 text-xs text-gray-400">This page is a placeholder for CRUD asset data.</p>
      </div>
    </div>
  );
};

export default Assets;
