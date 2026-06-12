import { useEffect, useState } from 'react';
import {
  getAdminAmbulanceBookings,
  updateAdminAmbulanceBooking,
} from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

export default function AdminAmbulance() {
  var [bookings, setBookings] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [statusFilter, setStatusFilter] = useState('');

  var loadBookings = function () {
    setLoading(true);
    var params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    getAdminAmbulanceBookings(params)
      .then(function (data) { setBookings(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () { loadBookings(); }, [search, statusFilter]);

  var handleStatus = function (id, status) {
    updateAdminAmbulanceBooking(id, { status: status }).then(loadBookings).catch(console.error);
  };

  var formatDate = function (d) {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  };

  return (
    <div>
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ambulance Bookings</h1>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <select
          value={statusFilter}
          onChange={function (e) { setStatusFilter(e.target.value); }}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Status</option>
          <option value="Requested">Requested</option>
          <option value="Assigned">Assigned</option>
          <option value="En-Route">En-Route</option>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Pickup Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Destination</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Scheduled</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No bookings found</td></tr>
              )}
              {bookings.map(function (b, idx) {
                var statusColors = {
                  Requested: 'bg-yellow-100 text-yellow-700',
                  Assigned: 'bg-blue-100 text-blue-700',
                  'En-Route': 'bg-purple-100 text-purple-700',
                  Completed: 'bg-green-100 text-green-700',
                  Cancelled: 'bg-gray-100 text-gray-600',
                };
                return (
                  <tr key={b.booking_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3">#{b.booking_id}</td>
                    <td className="px-4 py-3 font-medium">{b.user_name || '-'}</td>
                    <td className="px-4 py-3">{b.phone || '-'}</td>
                    <td className="px-4 py-3">{b.pickup_location}</td>
                    <td className="px-4 py-3">{b.destination}</td>
                    <td className="px-4 py-3">{formatDate(b.scheduled_time)}</td>
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
                        <option value="Requested">Requested</option>
                        <option value="Assigned">Assigned</option>
                        <option value="En-Route">En-Route</option>
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
