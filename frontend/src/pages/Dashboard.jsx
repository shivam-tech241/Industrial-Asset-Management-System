import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const parseDateSafe = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  let str = String(dateInput).trim();
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str += 'Z';
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const formatRelativeTime = (dateInput) => {
  const date = parseDateSafe(dateInput);
  if (!date) return '—';

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  if (diffInMs < 0) {
    if (Math.abs(diffInMs) < 60 * 1000) return 'Just now';
    if (Math.abs(diffInMs) < 24 * 60 * 60 * 1000) return 'Today';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return 'Just now';
  if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? 'min' : 'mins'} ago`;
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffInDays <= 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    assets: null,
    departments: null,
    openFaultReports: null,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [assetsRes, deptsRes, faultReportsRes, logsRes] = await Promise.all([
          api.get('/assets'),
          api.get('/departments'),
          api.get('/fault-reports'),
          api.get('/maintenance-logs'),
        ]);

        if (!isMounted) return;

        const assets = Array.isArray(assetsRes.data) ? assetsRes.data : [];
        const departments = Array.isArray(deptsRes.data) ? deptsRes.data : [];
        const faultReports = Array.isArray(faultReportsRes.data) ? faultReportsRes.data : [];
        const maintenanceLogs = Array.isArray(logsRes.data) ? logsRes.data : [];

        // Stat counts
        const openReportsCount = faultReports.filter((r) => r.status === 'Open').length;
        setCounts({
          assets: assets.length,
          departments: departments.length,
          openFaultReports: openReportsCount,
        });

        // Asset map for maintenance logs lookup
        const assetMap = assets.reduce((acc, a) => {
          acc[a.id] = a.name;
          return acc;
        }, {});

        // Build combined activities
        const activities = [];

        // 1. Assets (created_at)
        assets.forEach((asset) => {
          if (asset.created_at) {
            const parsed = parseDateSafe(asset.created_at);
            if (parsed) {
              activities.push({
                id: `asset-${asset.id}`,
                label: `New Asset Added: ${asset.name}`,
                timestamp: asset.created_at,
                date: parsed,
              });
            }
          }
        });

        // 2. Fault reports (reported_at)
        faultReports.forEach((report) => {
          if (report.reported_at) {
            const parsed = parseDateSafe(report.reported_at);
            if (parsed) {
              const desc = report.description || '';
              const truncatedDesc = desc.length > 40 ? `${desc.slice(0, 40)}...` : desc;
              activities.push({
                id: `fault-${report.id}`,
                label: `Fault Reported: ${truncatedDesc}`,
                timestamp: report.reported_at,
                date: parsed,
              });
            }
          }
        });

        // 3. Maintenance logs (date)
        maintenanceLogs.forEach((log) => {
          if (log.date) {
            const parsed = parseDateSafe(log.date);
            if (parsed) {
              const assetName = assetMap[log.asset_id] || `Asset #${log.asset_id}`;
              activities.push({
                id: `log-${log.id}`,
                label: `Maintenance Logged: ${assetName} — ${log.status || 'Pending'}`,
                timestamp: log.date,
                date: parsed,
              });
            }
          }
        });

        // Sort descending by timestamp (most recent first)
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Take top 5 entries
        setRecentActivities(activities.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      name: 'Total Assets',
      value: loading || counts.assets === null ? '...' : counts.assets,
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      name: 'Departments',
      value: loading || counts.departments === null ? '...' : counts.departments,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      name: 'Open Fault Reports',
      value: loading || counts.openFaultReports === null ? '...' : counts.openFaultReports,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="mt-2 text-gray-500 max-w-3xl">
          Here is an overview of the facility's assets, departments, and active fault reports. Use the sidebar navigation to manage categories or view detailed status reports.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary capitalize">
            Role: {user?.role_name || user?.role || 'Viewer'}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Department: {user?.department_name ? `${user.department_name} (ID: ${user?.department_id})` : (user?.department_id ? `ID: ${user?.department_id}` : 'N/A')}
          </span>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-150">
            <dt>
              <div className="absolute bg-primary-50 rounded-xl p-3 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline mt-1">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Overview/Details section */}
      <div>
        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 font-sans">
            Recent System Activity
          </h3>
          {loading ? (
            <p className="text-sm text-gray-400 py-3">Loading recent activity...</p>
          ) : recentActivities.length === 0 ? (
            <p className="text-sm text-gray-500 py-3">No recent activity yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="py-3 flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">{activity.label}</span>
                  <span className="text-gray-400 ml-4 flex-shrink-0">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
