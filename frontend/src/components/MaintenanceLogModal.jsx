import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

const MaintenanceLogModal = ({
  isOpen,
  onClose,
  onSuccess,
  log = null,
  assets: passedAssets = null,
  users: passedUsers = null,
}) => {
  const [assetId, setAssetId] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('0.00');
  const [status, setStatus] = useState('Pending');
  const [nextDueDate, setNextDueDate] = useState('');

  // Reference data
  const [assets, setAssets] = useState(passedAssets || []);
  const [users, setUsers] = useState(passedUsers || []);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(log && log.id);

  // Fetch reference lists if not passed from parent
  useEffect(() => {
    if (!isOpen) return;

    const fetchRefs = async () => {
      try {
        setLoadingRefs(true);
        const promises = [];
        if (!passedAssets || passedAssets.length === 0) {
          promises.push(api.get('/assets'));
        } else {
          promises.push(Promise.resolve({ data: passedAssets }));
        }

        if (!passedUsers || passedUsers.length === 0) {
          promises.push(api.get('/users'));
        } else {
          promises.push(Promise.resolve({ data: passedUsers }));
        }

        const [assetsRes, usersRes] = await Promise.all(promises);
        setAssets(assetsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to load maintenance log reference data in modal', err);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchRefs();
  }, [isOpen, passedAssets, passedUsers]);

  // Form initialization
  useEffect(() => {
    if (isOpen) {
      if (log) {
        setAssetId(log.asset_id ? String(log.asset_id) : '');
        setPerformedBy(log.performed_by ? String(log.performed_by) : '');
        setDate(log.date ? log.date.substring(0, 10) : '');
        setDescription(log.description || '');
        setCost(log.cost !== null && log.cost !== undefined ? String(log.cost) : '0.00');
        setStatus(log.status || 'Pending');
        setNextDueDate(log.next_due_date ? log.next_due_date.substring(0, 10) : '');
      } else {
        setAssetId('');
        setPerformedBy('');
        // Defaults to today's date formatted as YYYY-MM-DD
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setCost('0.00');
        setStatus('Pending');
        setNextDueDate('');
      }
      setError('');
    }
  }, [isOpen, log]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assetId) {
      setError('Please select an equipment asset.');
      return;
    }

    if (!performedBy) {
      setError('Please select the person who performed the maintenance.');
      return;
    }

    let parsedCost = 0.00;
    if (cost !== '' && cost !== null && cost !== undefined) {
      parsedCost = parseFloat(cost);
      if (isNaN(parsedCost) || parsedCost < 0) {
        setError('Cost must be a valid positive number.');
        return;
      }
    }

    // Default to today if left blank
    const submitDate = date || new Date().toISOString().split('T')[0];

    const payload = {
      asset_id: Number(assetId),
      performed_by: Number(performedBy),
      date: submitDate,
      description: description.trim() || null,
      cost: parsedCost,
      status: status || 'Pending',
      next_due_date: nextDueDate || null,
    };

    setError('');
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await api.put(`/maintenance-logs/${log.id}`, payload);
      } else {
        await api.post('/maintenance-logs', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Maintenance log save failed', err);
      setError(
        err.response?.data?.detail ||
        'An unexpected error occurred while saving the maintenance log.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full p-6 sm:p-8 transform transition-all my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-sans">
              {isEdit ? 'Edit Maintenance Log' : 'Add Maintenance Log'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Updating maintenance log record #${log?.id}`
                : 'Record equipment servicing, technician work, expenditure, and schedule follow-ups.'}
            </p>
          </div>
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

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border-l-4 border-red-500 text-sm text-red-800 flex items-start">
            <svg className="h-5 w-5 text-red-500 mr-2.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Row 1: Asset Dropdown & Performed By Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="asset_id" className="block text-sm font-medium text-gray-700 mb-1">
                Asset <span className="text-red-500">*</span>
              </label>
              <select
                id="asset_id"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                disabled={isSubmitting || loadingRefs}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_tag} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="performed_by" className="block text-sm font-medium text-gray-700 mb-1">
                Performed By <span className="text-red-500">*</span>
              </label>
              <select
                id="performed_by"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                disabled={isSubmitting || loadingRefs}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select User / Technician</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.personal_no})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Status Dropdown & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-xs text-gray-400 font-normal">(defaults to today)</span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 3: Cost & Next Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost ($)
              </label>
              <input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="next_due_date" className="block text-sm font-medium text-gray-700 mb-1">
                Next Due Date <span className="text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="next_due_date"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter service details, parts replaced, or technician notes..."
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingRefs}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all duration-150 cursor-pointer inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isEdit ? 'Update Log' : 'Create Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceLogModal;
