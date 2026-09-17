import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Assets', value: '142', change: '+12%', changeType: 'increase', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Departments', value: '8', change: '0%', changeType: 'neutral', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Active Fault Reports', value: '4', change: '-25%', changeType: 'decrease', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { name: 'System Health / Uptime', value: '99.8%', change: '+0.2%', changeType: 'increase', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p className={`ml-2 flex items-baseline text-xs font-semibold ${
                item.changeType === 'increase' ? 'text-green-600' : item.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Overview/Details section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 font-sans">
            Recent System Activity
          </h3>
          <ul className="divide-y divide-gray-100">
            <li className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">New Asset Added: CNC Lathe #4</span>
              <span className="text-gray-400">10 mins ago</span>
            </li>
            <li className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Fault Report Resolved: Boiler Overheating</span>
              <span className="text-gray-400">2 hours ago</span>
            </li>
            <li className="py-3 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Maintenance Scheduled: Conveyor Belt B</span>
              <span className="text-gray-400">Yesterday</span>
            </li>
          </ul>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 font-sans">
            Quick Actions & Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center hover:bg-gray-100 transition-colors duration-150">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">User Center</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">View Profile Info</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center hover:bg-gray-100 transition-colors duration-150">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Database API</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">Check Sync Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
