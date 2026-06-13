import { useEffect, useState } from 'react';
import {
  getAdminAmbulances,
  createAdminAmbulance,
  updateAdminAmbulance,
  deleteAdminAmbulance,
  getAdminAmbulanceBookings,
  updateAdminAmbulanceBooking,
} from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

const AMBULANCE_TYPES = ['Basic', 'ALS', 'BLS', 'ICU'];
const AMBULANCE_STATUSES = ['Available', 'On-Trip', 'Maintenance', 'Offline'];
const BOOKING_STATUSES = ['Requested', 'Assigned', 'En-Route', 'Completed', 'Cancelled'];

export default function AdminAmbulance() {
  const [tab, setTab] = useState('fleet');

  // ── Fleet State ──
  const [fleet, setFleet] = useState([]);
  const [fleetLoading, setFleetLoading] = useState(true);
  const [fleetSearch, setFleetSearch] = useState('');
  const [fleetStatusFilter, setFleetStatusFilter] = useState('');
  const [showFleetForm, setShowFleetForm] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState(null);
  const [fleetForm, setFleetForm] = useState({
    vehicle_number: '', ambulance_type: 'Basic', driver_name: '',
    driver_phone: '', capacity: 1, base_fare: '', status: 'Available',
  });
  const [fleetMsg, setFleetMsg] = useState('');

  // ── Bookings State ──
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');

  // ════════════════════════════════════════════════════════════════
  // FLEET MANAGEMENT
  // ════════════════════════════════════════════════════════════════

  const loadFleet = () => {
    setFleetLoading(true);
    const params = {};
    if (fleetSearch) params.search = fleetSearch;
    if (fleetStatusFilter) params.status = fleetStatusFilter;
    getAdminAmbulances(params)
      .then((data) => setFleet(data.results || data))
      .catch((e) => console.error(e))
      .finally(() => setFleetLoading(false));
  };

  useEffect(() => {
    if (tab === 'fleet') loadFleet();
  }, [tab, fleetSearch, fleetStatusFilter]);

  const resetFleetForm = () => {
    setFleetForm({
      vehicle_number: '', ambulance_type: 'Basic', driver_name: '',
      driver_phone: '', capacity: 1, base_fare: '', status: 'Available',
    });
    setEditingAmbulance(null);
    setShowFleetForm(false);
    setFleetMsg('');
  };

  const startEditAmbulance = (a) => {
    setEditingAmbulance(a);
    setFleetForm({
      vehicle_number: a.vehicle_number,
      ambulance_type: a.ambulance_type,
      driver_name: a.driver_name,
      driver_phone: a.driver_phone,
      capacity: a.capacity,
      base_fare: a.base_fare,
      status: a.status,
    });
    setShowFleetForm(true);
    setFleetMsg('');
  };

  const handleFleetSubmit = async (e) => {
    e.preventDefault();
    setFleetMsg('');
    try {
      const payload = {
        ...fleetForm,
        capacity: parseInt(fleetForm.capacity, 10),
        base_fare: parseFloat(fleetForm.base_fare),
      };
      if (editingAmbulance) {
        await updateAdminAmbulance(editingAmbulance.ambulance_id, payload);
        setFleetMsg('Ambulance updated successfully!');
      } else {
        await createAdminAmbulance(payload);
        setFleetMsg('Ambulance added successfully!');
      }
      resetFleetForm();
      loadFleet();
    } catch (err) {
      setFleetMsg(err?.response?.data?.error || err.message || 'Failed to save ambulance');
    }
  };

  const handleDeleteAmbulance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ambulance?')) return;
    try {
      await deleteAdminAmbulance(id);
      setFleetMsg('Ambulance deleted.');
      loadFleet();
    } catch (err) {
      setFleetMsg(err?.response?.data?.error || err.message || 'Failed to delete');
    }
  };

  const toggleActive = async (a) => {
    try {
      await updateAdminAmbulance(a.ambulance_id, { is_active: !a.is_active });
      loadFleet();
    } catch (err) {
      console.error(err);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // BOOKING MANAGEMENT
  // ════════════════════════════════════════════════════════════════

  const loadBookings = () => {
    setBookingLoading(true);
    const params = {};
    if (bookingSearch) params.search = bookingSearch;
    if (bookingStatusFilter) params.status = bookingStatusFilter;
    getAdminAmbulanceBookings(params)
      .then((data) => setBookings(data.results || data))
      .catch((e) => console.error(e))
      .finally(() => setBookingLoading(false));
  };

  useEffect(() => {
    if (tab === 'bookings') loadBookings();
  }, [tab, bookingSearch, bookingStatusFilter]);

  const handleBookingStatus = (id, status) => {
    setBookingMsg('');
    updateAdminAmbulanceBooking(id, { status })
      .then(() => {
        setBookingMsg('Status updated!');
        loadBookings();
      })
      .catch((err) => setBookingMsg(err?.response?.data?.error || 'Failed'));
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  };

  // ════════════════════════════════════════════════════════════════
  // STATUS BADGE COLORS
  // ════════════════════════════════════════════════════════════════

  const fleetStatusColor = (s) => ({
    Available: 'bg-green-100 text-green-700',
    'On-Trip': 'bg-blue-100 text-blue-700',
    Maintenance: 'bg-yellow-100 text-yellow-700',
    Offline: 'bg-gray-100 text-gray-600',
  }[s] || 'bg-gray-100');

  const bookingStatusColor = (s) => ({
    Requested: 'bg-yellow-100 text-yellow-700',
    Assigned: 'bg-blue-100 text-blue-700',
    'En-Route': 'bg-purple-100 text-purple-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-gray-100 text-gray-600',
  }[s] || 'bg-gray-100');

  const bookingTypeColor = (t) => ({
    Emergency: 'bg-red-100 text-red-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    Transfer: 'bg-indigo-100 text-indigo-700',
  }[t] || 'bg-gray-100');

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════

  return (
    <div>
      {/* Header */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ambulance Management</h1>
          {tab === 'fleet' && (
            <button
              onClick={() => { resetFleetForm(); setShowFleetForm(!showFleetForm); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                showFleetForm
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showFleetForm
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
              </svg>
              {showFleetForm ? 'Cancel' : 'Add Ambulance'}
            </button>
          )}
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={50}>
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
          {[
            { key: 'fleet', label: 'Ambulance Fleet', icon: '🚑' },
            { key: 'bookings', label: 'Bookings', icon: '📋' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Messages */}
      {fleetMsg && tab === 'fleet' && (
        <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${
          fleetMsg.includes('success') || fleetMsg.includes('updated') || fleetMsg.includes('deleted') || fleetMsg.includes('added')
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {fleetMsg}
        </div>
      )}
      {bookingMsg && tab === 'bookings' && (
        <div className="p-3 rounded-xl mb-4 text-sm font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
          {bookingMsg}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* FLEET TAB                                                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === 'fleet' && (
        <>
          {/* Fleet Form */}
          {showFleetForm && (
            <FadeIn delay={0}>
              <form onSubmit={handleFleetSubmit} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {editingAmbulance ? 'Edit Ambulance' : 'Add New Ambulance'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Number *</label>
                    <input
                      type="text" required
                      placeholder="e.g. ঢাকা মেট্রো গ-১২-৩৪৫৬"
                      value={fleetForm.vehicle_number}
                      onChange={(e) => setFleetForm({ ...fleetForm, vehicle_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                    <select
                      value={fleetForm.ambulance_type}
                      onChange={(e) => setFleetForm({ ...fleetForm, ambulance_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      {AMBULANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                    <select
                      value={fleetForm.status}
                      onChange={(e) => setFleetForm({ ...fleetForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      {AMBULANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver Name *</label>
                    <input
                      type="text" required
                      placeholder="e.g. Karim Uddin"
                      value={fleetForm.driver_name}
                      onChange={(e) => setFleetForm({ ...fleetForm, driver_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver Phone *</label>
                    <input
                      type="text" required
                      placeholder="e.g. 01XXXXXXXXX"
                      value={fleetForm.driver_phone}
                      onChange={(e) => setFleetForm({ ...fleetForm, driver_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity *</label>
                    <input
                      type="number" min="1" required
                      value={fleetForm.capacity}
                      onChange={(e) => setFleetForm({ ...fleetForm, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Fare (৳) *</label>
                    <input
                      type="number" step="0.01" min="0" required
                      placeholder="e.g. 500"
                      value={fleetForm.base_fare}
                      onChange={(e) => setFleetForm({ ...fleetForm, base_fare: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 active:scale-[0.97]">
                    {editingAmbulance ? 'Update Ambulance' : 'Add Ambulance'}
                  </button>
                  <button type="button" onClick={resetFleetForm} className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
                    Cancel
                  </button>
                </div>
              </form>
            </FadeIn>
          )}

          {/* Fleet Filters */}
          <FadeIn delay={100}>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by vehicle number or driver..."
                value={fleetSearch}
                onChange={(e) => setFleetSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
              <select
                value={fleetStatusFilter}
                onChange={(e) => setFleetStatusFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">All Status</option>
                {AMBULANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </FadeIn>

          {/* Fleet Table */}
          {fleetLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Vehicle No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Driver</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Capacity</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Base Fare</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Active</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fleet.length === 0 && (
                    <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No ambulances found</td></tr>
                  )}
                  {fleet.map((a, idx) => (
                    <tr key={a.ambulance_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" style={{ animationDelay: (idx * 40) + 'ms' }}>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">#{a.ambulance_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{a.vehicle_number}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">{a.ambulance_type}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.driver_name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.driver_phone}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.capacity}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">৳{Number(a.base_fare).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          onChange={(e) => {
                            updateAdminAmbulance(a.ambulance_id, { status: e.target.value }).then(loadFleet).catch(console.error);
                          }}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          {AMBULANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(a)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${a.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${a.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditAmbulance(a)}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-medium px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAmbulance(a.ambulance_id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Fleet Stats */}
          {!fleetLoading && fleet.length > 0 && (
            <FadeIn delay={200}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {AMBULANCE_STATUSES.map((s) => {
                  const count = fleet.filter((a) => a.status === s).length;
                  return (
                    <div key={s} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* BOOKINGS TAB                                                */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === 'bookings' && (
        <>
          {/* Booking Filters */}
          <FadeIn delay={100}>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">All Status</option>
                {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </FadeIn>

          {/* Bookings Table */}
          {bookingLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Patient</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Pickup</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Destination</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ambulance</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Time</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 && (
                    <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No bookings found</td></tr>
                  )}
                  {bookings.map((b, idx) => (
                    <tr key={b.booking_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" style={{ animationDelay: (idx * 40) + 'ms' }}>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">#{b.booking_id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bookingTypeColor(b.booking_type)}`}>
                          {b.booking_type || 'Emergency'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{b.patient_name || b.user_name || '-'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.patient_phone || b.phone || '-'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.pickup_location || b.pickup_address || '-'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.destination || b.dropoff_address || '-'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.vehicle_number || b.ambulance_vehicle || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatDate(b.pickup_time || b.scheduled_time)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bookingStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          onChange={(e) => handleBookingStatus(b.booking_id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Booking Stats */}
          {!bookingLoading && bookings.length > 0 && (
            <FadeIn delay={200}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {BOOKING_STATUSES.map((s) => {
                  const count = bookings.filter((b) => b.status === s).length;
                  return (
                    <div key={s} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          )}
        </>
      )}
    </div>
  );
}
