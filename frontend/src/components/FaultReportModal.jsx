import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
// ===== FAULT-STATUS-FOLDED-START =====
const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved'];
// ===== FAULT-STATUS-FOLDED-END =====

const FaultReportModal = ({
  isOpen,
  onClose,
  onSuccess,
  report = null,
  assets: passedAssets = null,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role_name === 'Admin';

  const [assetId, setAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [photoPath, setPhotoPath] = useState('');

  // ===== FAULT-STATUS-FOLDED-START =====
  const [status, setStatus] = useState('Open');
  // ===== FAULT-STATUS-FOLDED-END =====

  const [assets, setAssets] = useState(passedAssets || []);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(report && report.id);

  // Fetch assets if not provided or empty
  useEffect(() => {
    if (!isOpen) return;

    if (passedAssets && passedAssets.length > 0) {
      setAssets(passedAssets);
    } else {
      const fetchAssets = async () => {
        try {
          setLoadingAssets(true);
          const res = await api.get('/assets');
          setAssets(res.data);
        } catch (err) {
          console.error('Failed to load assets in modal', err);
        } finally {
          setLoadingAssets(false);
        }
      };
      fetchAssets();
    }
  }, [isOpen, passedAssets]);

  // Form initialization
  useEffect(() => {
    if (isOpen) {
      if (report) {
        setAssetId(report.asset_id ? String(report.asset_id) : '');
        setDescription(report.description || '');
        setSeverity(report.severity || 'Medium');
        setPhotoPath(report.photo_path || '');
        // ===== FAULT-STATUS-FOLDED-START =====
        setStatus(report.status || 'Open');
        // ===== FAULT-STATUS-FOLDED-END =====
      } else {
        setAssetId('');
        setDescription('');
        setSeverity('Medium');
        setPhotoPath('');
        // ===== FAULT-STATUS-FOLDED-START =====
        setStatus('Open');
        // ===== FAULT-STATUS-FOLDED-END =====
      }
      setError('');
    }
  }, [isOpen, report]);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => String(a.id) === String(assetId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedDesc = description.trim();
    const trimmedPhoto = photoPath.trim();

    if (!isEdit && !assetId) {
      setError('Please select an equipment asset.');
      return;
    }

    if (!trimmedDesc) {
      setError('Fault description is required.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (isEdit) {
        // Track whether general fields changed
        const generalFieldsChanged =
          trimmedDesc !== (report.description || '') ||
          severity !== (report.severity || 'Medium') ||
          trimmedPhoto !== (report.photo_path || '');

        // ===== FAULT-STATUS-FOLDED-START =====
        const statusChanged = isAdmin && status !== report.status;
        // ===== FAULT-STATUS-FOLDED-END =====

        const promises = [];

        if (generalFieldsChanged) {
          promises.push(
            api.put(`/fault-reports/${report.id}`, {
              description: trimmedDesc,
              severity,
              photo_path: trimmedPhoto || null,
            })
          );
        }

        // ===== FAULT-STATUS-FOLDED-START =====
        if (statusChanged) {
          promises.push(
            api.patch(`/fault-reports/${report.id}/status`, {
              status,
            })
          );
        }
        // ===== FAULT-STATUS-FOLDED-END =====

        if (promises.length === 0) {
          onClose();
          return;
        }

        await Promise.all(promises);
      } else {
        // Create mode: asset_id, description, severity, photo_path
        await api.post('/fault-reports', {
          asset_id: Number(assetId),
          description: trimmedDesc,
          severity,
          photo_path: trimmedPhoto || null,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Fault report save failed', err);
      setError(
        err.response?.data?.detail ||
        'An unexpected error occurred while saving the fault report.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-6 sm:p-8 transform transition-all my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-sans">
              {isEdit ? 'Edit Fault Report' : 'Submit Fault Report'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Modifying incident log #${report?.id}`
                : 'Log equipment anomalies, mechanical failures, or hazard notices.'}
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

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border-l-4 border-red-500 text-sm text-red-800 flex items-start">
            <svg className="h-5 w-5 text-red-500 mr-2.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Asset Selection (Dropdown on Create; Read-only badge on Edit) */}
          {isEdit ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affected Asset
              </label>
              <div className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded font-bold">
                    {currentAsset?.asset_tag || `Asset #${report.asset_id}`}
                  </span>
                  <span className="text-gray-600 truncate">{currentAsset?.name}</span>
                </div>
                <span className="text-xs text-gray-400 italic">Locked</span>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="asset_id" className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Asset <span className="text-red-500">*</span>
              </label>
              <select
                id="asset_id"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                disabled={isSubmitting || loadingAssets}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select an asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_tag} — {asset.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Severity Dropdown */}
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
              Fault Severity <span className="text-red-500">*</span>
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {SEVERITY_OPTIONS.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>

          {/* ===== FAULT-STATUS-FOLDED-START ===== */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Ticket Status
              </label>
              {!isAdmin && isEdit && (
                <span className="text-xs text-gray-400 font-normal italic">
                  (Admin permission required to update)
                </span>
              )}
            </div>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!isEdit || !isAdmin || isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors ${
                !isEdit || !isAdmin
                  ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium'
              }`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {!isEdit && (
              <p className="mt-1 text-xs text-gray-400">
                New tickets are automatically initialized with status "Open".
              </p>
            )}
          </div>
          {/* ===== FAULT-STATUS-FOLDED-END ===== */}

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Fault Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, operational impact, alarm codes, or preliminary findings..."
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Photo Path / URL */}
          <div>
            <label htmlFor="photo_path" className="block text-sm font-medium text-gray-700 mb-1">
              Photo / Attachment Reference (Optional)
            </label>
            <input
              id="photo_path"
              type="text"
              value={photoPath}
              onChange={(e) => setPhotoPath(e.target.value)}
              placeholder="e.g. /uploads/faults/pump_leak.jpg or image URL"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
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
              disabled={isSubmitting || loadingAssets}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all duration-150 cursor-pointer inline-flex items-center disabled:opacity-60"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isEdit ? 'Save Changes' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaultReportModal;
