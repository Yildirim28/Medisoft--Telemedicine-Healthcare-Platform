import { useEffect, useState } from 'react';
import {
  getAdminBloodDonors,
  createAdminBloodDonor,
  deleteAdminBloodDonor,
  getAdminBloodRequests,
  updateAdminBloodRequest,
} from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

var BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
var REQUEST_STATUSES = ['Pending', 'Fulfilled', 'Cancelled'];
var STATUS_COLORS = {
  Pending: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Fulfilled: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

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
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Blood Bank</h1>
          {tab === 'donors' && (
            <button
              onClick={function () { setShowForm(!showForm); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium active:scale-[0.97]"
            >
              {showForm ? 'Cancel' : '+ Add Donor'}
            </button>
          )}
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={100}>
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={function () { setTab('donors'); setSearch(''); setShowForm(false); }}
            className={'pb-3 px-1 text-sm font-medium border-b-2 transition active:scale-[0.97] ' + (tab === 'donors' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')}
          >
            Donors ({donors.length})
          </button>
          <button
            onClick={function () { setTab('requests'); setSearch(''); setShowForm(false); }}
            className={'pb-3 px-1 text-sm font-medium border-b-2 transition active:scale-[0.97] ' + (tab === 'requests' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')}
          >
            Blood Requests ({requests.length})
          </button>
        </div>
      </FadeIn>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Add Donor Form */}
      {showForm && (
        <FadeIn delay={100}>
        <form onSubmit={handleDonorSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 border dark:border-gray-700 animate-bounce-in">
          {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={form.full_name}
              onChange={function (e) { setForm(Object.assign({}, form, { full_name: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="text"
              placeholder="Phone *"
              value={form.phone}
              onChange={function (e) { setForm(Object.assign({}, form, { phone: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <select
              value={form.blood_group}
              onChange={function (e) { setForm(Object.assign({}, form, { blood_group: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="date"
              placeholder="Last Donation Date"
              value={form.last_donated_at}
              onChange={function (e) { setForm(Object.assign({}, form, { last_donated_at: e.target.value })); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button type="submit" className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium active:scale-[0.97]">
            Add Donor
          </button>
        </form>
        </FadeIn>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : tab === 'donors' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Blood Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">City</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Last Donation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No donors found</td></tr>
              )}
              {donors.map(function (d, idx) {
                return (
                  <tr key={d.donor_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{d.full_name}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{d.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">{d.blood_group}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{d.city || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{d.last_donated_at || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={function () { handleDeleteDonor(d.donor_id); }} className="text-red-600 hover:text-red-800 text-xs font-medium active:scale-[0.97]">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Blood Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Units</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Hospital</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Urgency</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No blood requests found</td></tr>
              )}
              {requests.map(function (r, idx) {
                var statusColor = STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600';
                return (
                  <tr key={r.request_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{r.patient_name || r.user_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">{r.blood_group}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.units_needed}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.hospital_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (r.urgency === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : r.urgency === 'Urgent' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400')}>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + statusColor}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={function (e) { handleRequestStatus(r.request_id, e.target.value); }}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                      >
                        {REQUEST_STATUSES.map(function (s) {
                          return <option key={s} value={s}>{s}</option>;
                        })}
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
