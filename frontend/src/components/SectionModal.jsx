import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const SectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  section = null,
  fixedDepartmentId = null,
  departments: passedDepartments = null,
}) => {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState(passedDepartments || []);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(section && section.id);

  // Fetch departments if not passed in as props
  useEffect(() => {
    if (!isOpen) return;

    if (passedDepartments && passedDepartments.length > 0) {
      setDepartments(passedDepartments);
    } else {
      const fetchDepts = async () => {
        try {
          setLoadingDepts(true);
          const res = await api.get('/departments');
          setDepartments(res.data);
        } catch (err) {
          console.error('Failed to load departments in modal', err);
        } finally {
          setLoadingDepts(false);
        }
      };
      fetchDepts();
    }
  }, [isOpen, passedDepartments]);

  useEffect(() => {
    if (isOpen) {
      setName(section?.name || '');
      if (fixedDepartmentId) {
        setDepartmentId(String(fixedDepartmentId));
      } else if (section?.department_id) {
        setDepartmentId(String(section.department_id));
      } else {
        setDepartmentId('');
      }
      setError('');
    }
  }, [isOpen, section, fixedDepartmentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Section name is required.');
      return;
    }

    const selectedDeptId = fixedDepartmentId ? Number(fixedDepartmentId) : Number(departmentId);
    if (!selectedDeptId) {
      setError('Please select a department.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await api.put(`/sections/${section.id}`, {
          name: trimmedName,
          department_id: selectedDeptId,
        });
      } else {
        await api.post('/sections', {
          name: trimmedName,
          department_id: selectedDeptId,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Section operation failed', err);
      setError(err.response?.data?.detail || 'An unexpected error occurred while saving the section.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fixedDeptName = fixedDepartmentId
    ? departments.find((d) => d.id === Number(fixedDepartmentId))?.name
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 sm:p-8 transform transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 font-sans">
            {isEdit ? 'Edit Section' : 'Add Section'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Department Selection: dropdown if not fixed, or informative tag if fixed */}
          {fixedDepartmentId ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium flex items-center">
                <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                {fixedDeptName || `Department ID: ${fixedDepartmentId}`}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="section-dept" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              {loadingDepts ? (
                <div className="text-sm text-gray-500 py-2 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading departments...
                </div>
              ) : (
                <select
                  id="section-dept"
                  required
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    if (error) setError('');
                  }}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-150 bg-white"
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label htmlFor="section-name" className="block text-sm font-medium text-gray-700 mb-1">
              Section Name
            </label>
            <input
              id="section-name"
              type="text"
              required
              autoFocus
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-150"
              placeholder="e.g. Robotics Assembly"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Section' : 'Create Section'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionModal;
