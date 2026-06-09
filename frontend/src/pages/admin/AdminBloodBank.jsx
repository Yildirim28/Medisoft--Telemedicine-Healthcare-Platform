import { useEffect, useState } from 'react';
import {
  getAdminBloodDonors,
  createAdminBloodDonor,
  deleteAdminBloodDonor,
  getAdminBloodRequests,
  updateAdminBloodRequest,
} from '../../api';

var BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminBloodBank() {
  var [tab, setTab] = useState('donors');
  var [donors, setDonors] = useState([]);
  var [requests, setRequests] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [form, setForm] = useState({ full_name: '', phone: '', blood_group: '', city: '', last_donated_at: '' });
  var [error, setError] = useState('');
  var [search, setSearch] = useState('');

  var loadDonors = function () {
    setLoading(true);
    getAdminBloodDonors({ search: search })
      .then(function (data) { setDonors(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  var loadRequests = function () {
    setLoading(true);
    getAdminBloodRequests({ search: search })
      .then(function (data) { setRequests(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () {
    if (tab === 'donors') loadDonors();
    else loadRequests();
  }, [tab, search]);

  var handleDonorSubmit = function (e) {
    e.preventDefault();
    setError('');
    createAdminBloodDonor(form)
      .then(function () {
        setShowForm(false);
        setForm({ full_name: '', phone: '', blood_group: '', city: '', last_donated_at: '' });
        loadDonors();
      })
      .catch(function (e) {
        setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to add donor');
      });
  };

  var handleDeleteDonor = function (id) {
    if (!window.confirm('Are you sure you want to delete this donor?')) return;
    deleteAdminBloodDonor(id).then(loadDonors).catch(console.error);
  };

  var handleRequestStatus = function (id, status) {
    updateAdminBloodRequest(id, { status: status }).then(loadRequests).catch(console.error);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blood Bank</h1>
        {tab === 'donors' && (
          <button
            onClick={function () { setShowForm(!showForm); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Donor'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={function () { setTab('donors'); setSearch(''); setShowForm(false); }}
          className={'pb-3 px-1 text-sm font-medium border-b-2 transition ' + (tab === 'donors' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700')}
        >
          Donors ({donors.length})
        </button>
        <button
          onClick={function () { setTab('requests'); setSearch(''); setShowForm(false); }}
          className={'pb-3 px-1 text-sm font-medium border-b-2 transition ' + (tab === 'requests' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700')}
        >
          Blood Requests ({requests.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Add Donor Form */}
      {showForm && (
        <form onSubmit={handleDonorSubmit} className="bg-white rounded-xl shadow p-6 mb-6 border">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={form.full_name}
              onChange={function (e) { setForm(Object.assign({}, form, { full_name: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Phone *"
              value={form.phone}
              onChange={function (e) { setForm(Object.assign({}, form, { phone: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <select
              value={form.blood_group}
              onChange={function (e) { setForm(Object.assign({}, form, { blood_group: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Blood Group *</option>
              {BLOOD_GROUPS.map(function (bg) {
                return <option key={bg} value={bg}>{bg}</option>;
              })}
            </select>
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={function (e) { setForm(Object.assign({}, form, { city: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              placeholder="Last Donation Date"
              value={form.last_donated_at}
              onChange={function (e) { setForm(Object.assign({}, form, { last_donated_at: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
            Add Donor
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tab === 'donors' ? (
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Blood Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Donation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No donors found</td></tr>
              )}
              {donors.map(function (d) {
                return (
                  <tr key={d.donor_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.full_name}</td>
                    <td className="px-4 py-3">{d.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{d.blood_group}</span>
                    </td>
                    <td className="px-4 py-3">{d.city || '-'}</td>
                    <td className="px-4 py-3">{d.last_donated_at || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={function () { handleDeleteDonor(d.donor_id); }} className="text-red-600 hover:text-red-800 text-xs font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Blood Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Units</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hospital</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Urgency</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No blood requests found</td></tr>
              )}
              {requests.map(function (r) {
                return (
                  <tr key={r.request_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.patient_name || r.user_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{r.blood_group}</span>
                    </td>
                    <td className="px-4 py-3">{r.units_needed}</td>
                    <td className="px-4 py-3">{r.hospital_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (r.urgency === 'critical' ? 'bg-red-100 text-red-700' : r.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700')}>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (r.status === 'fulfilled' ? 'bg-green-100 text-green-700' : r.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700')}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={function () { handleRequestStatus(r.request_id, 'fulfilled'); }} className="text-green-600 hover:text-green-800 text-xs font-medium">Fulfill</button>
                          <button onClick={function () { handleRequestStatus(r.request_id, 'cancelled'); }} className="text-red-600 hover:text-red-800 text-xs font-medium">Cancel</button>
                        </div>
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
  );
}
