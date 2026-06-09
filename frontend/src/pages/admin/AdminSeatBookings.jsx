import { useEffect, useState } from 'react';
import {
  getAdminSeatBookings,
  updateAdminSeatBooking,
} from '../../api';

export default function AdminSeatBookings() {
  var [bookings, setBookings] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [statusFilter, setStatusFilter] = useState('');

  var loadBookings = function () {
    setLoading(true);
    var params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    getAdminSeatBookings(params)
      .then(function (data) { setBookings(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () { loadBookings(); }, [search, statusFilter]);

  var handleStatus = function (id, status) {
    updateAdminSeatBooking(id, { status: status }).then(loadBookings).catch(console.error);
  };

  var formatDate = function (d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seat Bookings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by patient or seat..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={function (e) { setStatusFilter(e.target.value); }}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="Booked">Booked</option>
          <option value="Checked-In">Checked-In</option>
          <option value="Checked-Out">Checked-Out</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Seat Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hospital</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check-in</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check-out</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No seat bookings found</td></tr>
              )}
              {bookings.map(function (b) {
                var statusColors = {
                  Booked: 'bg-yellow-100 text-yellow-700',
                  'Checked-In': 'bg-blue-100 text-blue-700',
                  'Checked-Out': 'bg-green-100 text-green-700',
                  Cancelled: 'bg-gray-100 text-gray-600',
                };
                return (
                  <tr key={b.booking_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{b.booking_id}</td>
                    <td className="px-4 py-3 font-medium">{b.user_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{b.seat_type || '-'}</span>
                    </td>
                    <td className="px-4 py-3">{b.hospital_name || '-'}</td>
                    <td className="px-4 py-3">{formatDate(b.check_in_date)}</td>
                    <td className="px-4 py-3">{formatDate(b.check_out_date)}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (statusColors[b.status] || 'bg-gray-100')}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={function (e) { handleStatus(b.booking_id, e.target.value); }}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Booked">Booked</option>
                        <option value="Checked-In">Checked-In</option>
                        <option value="Checked-Out">Checked-Out</option>
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
