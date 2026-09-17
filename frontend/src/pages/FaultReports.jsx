import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import FaultReportModal from '../components/FaultReportModal';

const FaultReports = () => {
  const { user } = useAuth();
  const [faultReports, setFaultReports] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Primary Create/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // RBAC checks
  const isAdmin = user?.role_name === 'Admin';
  const isTechnician = user?.role_name === 'Technician';
  const canManage = isAdmin || isTechnician; // Create & General Edit
  const canDelete = isAdmin; // Delete is Admin only

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [reportsRes, assetsRes] = await Promise.all([
        api.get('/fault-reports'),
        api.get('/assets'),
      ]);
      setFaultReports(reportsRes.data);
      setAssets(assetsRes.data);
    } catch (err) {
      console.error('Failed to load fault reports data', err);
      setError(
        err.response?.data?.detail ||
        'Failed to load fault reports. Please check your network connection or verify your session.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Asset lookup map: asset_id -> asset object
  const assetMap = useMemo(() => {
    return assets.reduce((acc, asset) => {
      acc[asset.id] = asset;
      return acc;
    }, {});
  }, [assets]);

  const handleOpenCreateModal = () => {
    setActionError('');
    setSelectedReport(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (report) => {
    setActionError('');
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDelete = async (report) => {
    setActionError('');
    const confirmed = window.confirm(
      `Are you sure you want to delete fault report #${report.id}?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/fault-reports/${report.id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete fault report', err);
      setActionError(
        err.response?.data?.detail ||
        'Failed to delete fault report. An unexpected error occurred.'
      );
    }
  };

  const renderSeverityBadge = (severity) => {
    switch (severity) {
      case 'Low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>
            Low
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            Medium
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-orange-500"></span>
            High
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {severity || 'Unknown'}
          </span>
        );
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>
            Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const truncateDescription = (desc, maxLength = 50) => {
    if (!desc) return '—';
    if (desc.length <= maxLength) return desc;
    return `${desc.substring(0, maxLength)}...`;
  };

  const formatReportDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
            Fault Reports
          </h1>
          <p className="mt-2 text-gray-500 max-w-3xl">
            Track equipment defects, register breakdown alerts, evaluate failure severities, and monitor resolution progress.
          </p>
        </div>

        {canManage && (
          <div className="flex-shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-hover shadow-sm transition-all duration-150 cursor-pointer"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Report Fault
            </button>
          </div>
        )}
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-800">{actionError}</p>
          </div>
          <button
            onClick={() => setActionError('')}
            className="text-red-500 hover:text-red-700 ml-4 cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-gray-500">
            <svg className="animate-spin h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-medium">Loading fault reports...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-red-400 mb-3">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Failed to load data</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : faultReports.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl m-8 p-12 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block text-sm font-semibold text-gray-700">No fault reports logged</span>
            <p className="mt-1 text-xs text-gray-400">
              {canManage
                ? 'All machinery is currently operating normally. Click "Report Fault" to log an issue.'
                : 'No incidents recorded in the system.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reported At
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {faultReports.map((report) => {
                  const asset = assetMap[report.asset_id];
                  return (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 w-max">
                            {asset?.asset_tag || `ID: ${report.asset_id}`}
                          </span>
                          {asset?.name && (
                            <span className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                              {asset.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-xs" title={report.description}>
                        <div className="font-medium text-gray-900">
                          {truncateDescription(report.description, 50)}
                        </div>
                        {report.photo_path && (
                          <div className="text-xs text-primary mt-0.5 flex items-center">
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Attachment attached
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderSeverityBadge(report.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatReportDate(report.reported_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canManage || canDelete ? (
                          <div className="inline-flex items-center space-x-2.5">
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(report)}
                                className="text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer inline-flex items-center text-xs"
                              >
                                <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                            )}

                            {canManage && canDelete && (
                              <span className="text-gray-300">|</span>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(report)}
                                className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer inline-flex items-center text-xs"
                              >
                                <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Read-only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Primary Modal for Create / Edit Fault Report */}
      <FaultReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        report={selectedReport}
        assets={assets}
      />
    </div>
  );
};

export default FaultReports;
