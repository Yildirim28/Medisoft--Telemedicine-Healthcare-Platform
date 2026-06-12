import { useEffect, useState } from 'react';
import {
  getAdminLabBookings,
  updateAdminLabBooking,
} from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

export default function AdminLabBookings() {
  var [bookings, setBookings] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [statusFilter, setStatusFilter] = useState('');

  var loadBookings = function () {
    setLoading(true);
    var params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    getAdminLabBookings(params)
      .then(function (data) { setBookings(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () { loadBookings(); }, [search, statusFilter]);

  var handleStatus = function (id, status) {
    updateAdminLabBooking(id, { status: status }).then(loadBookings).catch(console.error);
  };

  var formatDate = function (d) {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  };

  return (
    <div>
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lab Bookings</h1>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by patient or test name..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <select
          value={statusFilter}
          onChange={function (e) { setStatusFilter(e.target.value); }}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Status</option>
          <option value="Booked">Booked</option>
          <option value="Sample-Collected">Sample Collected</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      </FadeIn>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Test Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Hospital</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No lab bookings found</td></tr>
              )}
              {bookings.map(function (b, idx) {
                var statusColors = {
                  Booked: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                  'Sample-Collected': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                  Processing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                  Completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                  Cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
                };
                return (
                  <tr key={b.booking_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">#{b.booking_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{b.user_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{b.test_name}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{b.hospital_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatDate(b.booking_date || b.scheduled_date)}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (statusColors[b.status] || 'bg-gray-100')}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={function (e) { handleStatus(b.booking_id, e.target.value); }}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Booked">Booked</option>
                        <option value="Sample-Collected">Sample Collected</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
