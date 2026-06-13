import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAmbulanceBookings, createAmbulanceBooking, updateAmbulanceStatus, getAmbulances } from '../api';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const STATUS_STYLES = {
  Requested: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  Assigned: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'En-Route': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  assigned: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  en_route: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
};

const DEFAULT_STATUS = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };

const BOOKING_TYPES = [
  {
    value: 'Emergency',
    label: 'Emergency',
    icon: '⚡',
    desc: 'Immediate medical transport needed',
    color: 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700',
    activeColor: 'border-red-500 bg-red-100 dark:bg-red-900/40 dark:border-red-500',
    ring: 'ring-red-500',
  },
  {
    value: 'Scheduled',
    label: 'Scheduled',
    icon: '📅',
    desc: 'Book in advance for a specific time',
    color: 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700',
    activeColor: 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 dark:border-blue-500',
    ring: 'ring-blue-500',
  },
  {
    value: 'Transfer',
    label: 'Transfer',
    icon: '🔄',
    desc: 'Hospital-to-hospital patient transfer',
    color: 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700',
    activeColor: 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 dark:border-indigo-500',
    ring: 'ring-indigo-500',
  },
];

export default function Ambulance() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [availableAmbulances, setAvailableAmbulances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    booking_type: 'Emergency',
    patient_name: '',
    patient_phone: '',
    pickup_address: '',
    dropoff_address: '',
    pickup_city: '',
    pickup_time: '',
    notes: '',
    ambulance_id: '',
  });

  useEffect(() => {
    getAmbulanceBookings()
      .then((res) => setBookings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load available ambulances when form opens
  useEffect(() => {
    if (showForm) {
      getAmbulances()
        .then((res) => setAvailableAmbulances(res.data || []))
        .catch(() => setAvailableAmbulances([]));
    }
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = { ...form };
      // For emergency, don't require pickup_time (set to empty)
      if (form.booking_type === 'Emergency') {
        payload.pickup_time = '';
      }
      // Remove empty ambulance_id
      if (!payload.ambulance_id) {
        delete payload.ambulance_id;
      }
      await createAmbulanceBooking(payload);
      setMsg('Ambulance booked successfully!');
      setShowForm(false);
      setForm({
        booking_type: 'Emergency',
        patient_name: '', patient_phone: '', pickup_address: '', dropoff_address: '',
        pickup_city: '', pickup_time: '', notes: '', ambulance_id: '',
      });
      getAmbulanceBookings().then((res) => setBookings(res.data || []));
    } catch (err) {
      setMsg(err?.response?.data?.error || err.message || 'Booking failed');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateAmbulanceStatus(id, { status });
      setBookings((prev) => prev.map((b) => (b.booking_id === id ? { ...b, status } : b)));
    } catch (err) {
      alert(err.message);
    }
  };

  const statusStyle = (s) => STATUS_STYLES[s] || STATUS_STYLES[s?.toLowerCase()] || DEFAULT_STATUS;

  const bookingTypeStyle = (t) => ({
    Emergency: 'bg-red-100 text-red-700 border-red-200',
    Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    Transfer: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  }[t] || 'bg-gray-100 text-gray-600 border-gray-200');

  const formatDateTime = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleString();
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn delay={0}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ambulance Services</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Emergency medical transport at your fingertips</p>
              </div>
            </div>
            {user?.role === 'patient' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  showForm
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showForm ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
                {showForm ? 'Cancel' : 'Book Ambulance'}
              </button>
            )}
          </div>
        </FadeIn>

        {/* Message */}
        {msg && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium animate-bounce-in ${
            msg.includes('success')
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {msg}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* BOOKING FORM                                              */}
        {/* ══════════════════════════════════════════════════════════ */}
        {showForm && (
          <FadeIn delay={0}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                New Ambulance Booking
              </h3>

              {/* ── Booking Type Selector ── */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Booking Type *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BOOKING_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      type="button"
                      onClick={() => setForm({ ...form, booking_type: bt.value })}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        form.booking_type === bt.value
                          ? `${bt.activeColor} ring-2 ${bt.ring} shadow-sm`
                          : `${bt.color} hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{bt.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{bt.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{bt.desc}</p>
                        </div>
                      </div>
                      {form.booking_type === bt.value && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-current opacity-60" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Form Fields ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Patient Name *</label>
                  <input
                    placeholder="e.g. John Doe"
                    className="input-modern"
                    value={form.patient_name}
                    onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Patient Phone *</label>
                  <input
                    placeholder="e.g. 01XXXXXXXXX"
                    className="input-modern"
                    value={form.patient_phone}
                    onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pickup Address *</label>
                  <input
                    placeholder="e.g. 123 Main Street, Dhaka"
                    className="input-modern"
                    value={form.pickup_address}
                    onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dropoff Address *</label>
                  <input
                    placeholder="e.g. City Hospital, Banani"
                    className="input-modern"
                    value={form.dropoff_address}
                    onChange={(e) => setForm({ ...form, dropoff_address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                  <input
                    placeholder="e.g. Dhaka"
                    className="input-modern"
                    value={form.pickup_city}
                    onChange={(e) => setForm({ ...form, pickup_city: e.target.value })}
                    required
                  />
                </div>

                {/* Pickup Time — required for Scheduled and Transfer, optional for Emergency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Pickup Time {form.booking_type === 'Emergency' ? '(ASAP)' : '*'}
                  </label>
                  {form.booking_type === 'Emergency' ? (
                    <div className="input-modern flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-red-600 dark:text-red-400 text-sm font-medium">As soon as possible</span>
                    </div>
                  ) : (
                    <input
                      type="datetime-local"
                      className="input-modern"
                      value={form.pickup_time}
                      onChange={(e) => setForm({ ...form, pickup_time: e.target.value })}
                      required
                    />
                  )}
                </div>

                {/* Ambulance Selection */}
                {availableAmbulances.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Select Ambulance (optional — leave empty for auto-assign)
                    </label>
                    <select
                      className="input-modern"
                      value={form.ambulance_id}
                      onChange={(e) => setForm({ ...form, ambulance_id: e.target.value })}
                    >
                      <option value="">Auto-assign nearest available</option>
                      {availableAmbulances.map((a) => (
                        <option key={a.ambulance_id} value={a.ambulance_id}>
                          {a.vehicle_number} — {a.ambulance_type} — {a.driver_name} — ৳{Number(a.base_fare).toFixed(0)} base fare
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
                  <textarea
                    placeholder="Any special instructions... e.g. Patient needs wheelchair access, bring oxygen tank"
                    className="input-modern"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Emergency Warning */}
              {form.booking_type === 'Emergency' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Emergency Booking</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                      An ambulance will be dispatched immediately. Our team will contact you shortly.
                      For life-threatening emergencies, also call <strong>999</strong>.
                    </p>
                  </div>
                </div>
              )}

              <button type="submit" className="mt-5 gradient-btn bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 inline-flex items-center gap-2 active:scale-[0.97]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {form.booking_type === 'Emergency' ? 'Request Emergency Ambulance' : 'Book Ambulance'}
              </button>
            </form>
          </FadeIn>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No ambulance bookings yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Book Ambulance" to get started</p>
          </div>
        )}

        {/* Bookings List */}
        <StaggerChildren staggerDelay={80}>
          {bookings.map((b) => {
            const st = statusStyle(b.status);
            return (
              <div key={b.booking_id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-all duration-300 active:scale-[0.99] mb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{b.patient_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${st.bg} ${st.text} border ${st.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                          {b.status}
                        </span>
                        {/* Booking Type Badge */}
                        {(b.booking_type || b.type) && (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${bookingTypeStyle(b.booking_type || b.type)}`}>
                            {b.booking_type === 'Emergency' && '⚡ '}
                            {b.booking_type === 'Scheduled' && '📅 '}
                            {b.booking_type === 'Transfer' && '🔄 '}
                            {b.booking_type || b.type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        From: {b.pickup_address || b.pickup_location}, {b.pickup_city}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        To: {b.dropoff_address || b.destination}
                      </div>
                      {(b.pickup_time || b.scheduled_time) && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <svg className="w-3 h-3 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pickup: {formatDateTime(b.pickup_time || b.scheduled_time)}
                        </p>
                      )}
                      {b.vehicle_number && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          <span className="mr-1">🚑</span>
                          Ambulance: {b.vehicle_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {user?.role !== 'patient' && (b.status === 'pending' || b.status === 'Requested') && (
                      <>
                        <button
                          onClick={() => handleStatus(b.booking_id, 'Assigned')}
                          className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm active:scale-[0.97]"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Assign
                        </button>
                        <button
                          onClick={() => handleStatus(b.booking_id, 'Cancelled')}
                          className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 active:scale-[0.97]"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {user?.role !== 'patient' && (b.status === 'Assigned' || b.status === 'assigned') && (
                      <button
                        onClick={() => handleStatus(b.booking_id, 'En-Route')}
                        className="inline-flex items-center gap-1.5 bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-600 transition-all duration-200 shadow-sm active:scale-[0.97]"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        En Route
                      </button>
                    )}
                    {user?.role !== 'patient' && (b.status === 'En-Route' || b.status === 'en_route' || b.status === 'Assigned' || b.status === 'assigned') && (
                      <button
                        onClick={() => handleStatus(b.booking_id, 'Completed')}
                        className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all duration-200 shadow-sm active:scale-[0.97]"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </StaggerChildren>
      </div>
    </Layout>
  );
}
