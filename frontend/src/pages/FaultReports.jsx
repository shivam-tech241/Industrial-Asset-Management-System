import React from 'react';

const FaultReports = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
        Fault Reports
      </h1>
      <p className="mt-2 text-gray-500 max-w-3xl">
        Submit new fault notifications, view active repair tickets, and track technician assignments.
      </p>
      <div className="mt-8 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="mt-2 block text-sm font-semibold text-gray-600">No active fault reports</span>
        <p className="mt-1 text-xs text-gray-400">This page is a placeholder for asset failure logs.</p>
      </div>
    </div>
  );
};

export default FaultReports;
