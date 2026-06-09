import { useEffect, useState } from 'react';
import {
  getAdminAppointments,
  updateAdminAppointment,
} from '../../api';

export default function AdminAppointments() {
  var [appointments, setAppointments] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [statusFilter, setStatusFilter] = useState('');

  var loadAppointments = function () {
    setLoading(true);
    var params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    getAdminAppointments(params)
      .then(function (data) { setAppointments(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () { loadAppointments(); }, [search, statusFilter]);

  var handleStatus = function (id, status) {
    updateAdminAppointment(id, { status: status }).then(loadAppointments).catch(console.error);
  };

  var formatDate = function (d) {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by patient or doctor..."
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
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Doctor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No appointments found</td></tr>
              )}
              {appointments.map(function (a) {
                var statusColors = {
                  pending: 'bg-yellow-100 text-yellow-700',
                  confirmed: 'bg-blue-100 text-blue-700',
                  completed: 'bg-green-100 text-green-700',
                  cancelled: 'bg-gray-100 text-gray-600',
                };
                return (
                  <tr key={a.appointment_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{a.appointment_id}</td>
                    <td className="px-4 py-3 font-medium">{a.patient_name || a.user_name || '-'}</td>
                    <td className="px-4 py-3">{a.doctor_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{a.appointment_type || a.type || '-'}</span>
                    </td>
                    <td className="px-4 py-3">{formatDate(a.appointment_date || a.scheduled_date)}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (statusColors[a.status] || 'bg-gray-100')}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        onChange={function (e) { handleStatus(a.appointment_id, e.target.value); }}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
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
