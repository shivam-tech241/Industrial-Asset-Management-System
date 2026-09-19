import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import MaintenanceLogModal from '../components/MaintenanceLogModal';

const MaintenanceLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // RBAC checks: Admin + Technician can Create & Edit; Admin only can Delete; Viewer is read-only
  const isAdmin = user?.role_name === 'Admin';
  const isTechnician = user?.role_name === 'Technician';
  const canManage = isAdmin || isTechnician;
  const canDelete = isAdmin;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [logsRes, assetsRes, usersRes] = await Promise.all([
        api.get('/maintenance-logs'),
        api.get('/assets'),
        api.get('/users'),
      ]);
      setLogs(logsRes.data);
      setAssets(assetsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load maintenance logs data', err);
      setError(
        err.response?.data?.detail ||
        'Failed to load maintenance logs. Please check your network connection or verify your session.'
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

  // User lookup map: user_id -> user object
  const userMap = useMemo(() => {
    return users.reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});
  }, [users]);

  const handleOpenCreateModal = () => {
    setActionError('');
    setSelectedLog(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log) => {
    setActionError('');
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = async (log) => {
    setActionError('');
    const confirmed = window.confirm(
      `Are you sure you want to delete maintenance log #${log.id}?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/maintenance-logs/${log.id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete maintenance log', err);
      setActionError(
        err.response?.data?.detail ||
        'Failed to delete maintenance log. An unexpected error occurred.'
      );
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            In Progress
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-gray-500"></span>
            {status || 'Pending'}
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
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

  const formatCost = (cost) => {
    if (cost === null || cost === undefined || cost === '') return '$0.00';
    const num = Number(cost);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
            Maintenance Logs
          </h1>
          <p className="mt-2 text-gray-500 max-w-3xl">
            Track equipment maintenance schedules, service logs, repair histories, and costs.
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
              Add Maintenance Log
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

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-gray-500">
            <svg className="animate-spin h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-medium">Loading maintenance logs...</p>
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
        ) : logs.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl m-8 p-12 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="block text-sm font-semibold text-gray-700">No maintenance logs found</span>
            <p className="mt-1 text-xs text-gray-400">
              {canManage
                ? 'Click "Add Maintenance Log" above to record the first service activity.'
                : 'No maintenance records currently stored in the database.'}
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
                    Performed By
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Next Due Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => {
                  const asset = assetMap[log.asset_id];
                  const performer = userMap[log.performed_by];

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                      {/* Asset Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 inline-block">
                          {asset?.asset_tag || `Asset #${log.asset_id}`}
                        </div>
                        {asset?.name && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {asset.name}
                          </div>
                        )}
                      </td>

                      {/* Performed By Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {performer?.name || `User #${log.performed_by}`}
                        </div>
                        {performer?.personal_no && (
                          <div className="text-xs text-gray-400">
                            {performer.personal_no}
                          </div>
                        )}
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {formatDate(log.date)}
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderStatusBadge(log.status)}
                      </td>

                      {/* Cost Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 font-mono">
                        {formatCost(log.cost)}
                      </td>

                      {/* Next Due Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.next_due_date ? (
                          <span className="font-medium text-gray-700">
                            {formatDate(log.next_due_date)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canManage || canDelete ? (
                          <div className="inline-flex items-center space-x-3">
                            {canManage && (
                              <button
                                onClick={() => handleOpenEditModal(log)}
                                className="text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer inline-flex items-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                                onClick={() => handleDelete(log)}
                                className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer inline-flex items-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {/* Modal for Add / Edit Maintenance Log */}
      <MaintenanceLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        log={selectedLog}
        assets={assets}
        users={users}
      />
    </div>
  );
};

export default MaintenanceLogs;
