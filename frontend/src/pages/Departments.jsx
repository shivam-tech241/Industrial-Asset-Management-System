import React from 'react';

const Departments = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
        Departments
      </h1>
      <p className="mt-2 text-gray-500 max-w-3xl">
        Manage plant departments, sections, roles, and user associations.
      </p>
      <div className="mt-8 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="mt-2 block text-sm font-semibold text-gray-600">No departments configured</span>
        <p className="mt-1 text-xs text-gray-400">This page is a placeholder for department management views.</p>
      </div>
    </div>
  );
};

export default Departments;
