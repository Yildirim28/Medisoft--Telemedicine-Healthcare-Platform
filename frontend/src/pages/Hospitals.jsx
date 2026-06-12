import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getHospitals, createHospital, getSeatBookings, createSeatBooking, updateSeatBookingStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const SEAT_TYPES = [
  { value: 'General', icon: '🛏️', color: 'from-blue-100 to-blue-50' },
  { value: 'Private', icon: '🏠', color: 'from-purple-100 to-purple-50' },
  { value: 'ICU', icon: '❤️', color: 'from-red-100 to-red-50' },
  { value: 'vip', icon: '⭐', color: 'from-amber-100 to-amber-50' },
];

export default function Hospitals() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [seatBookings, setSeatBookings] = useState([]);
  const [tab, setTab] = useState('list');
  const [showAdd, setShowAdd] = useState(false);
  const [showBook, setShowBook] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [hForm, setHForm] = useState({ name: '', address: '', city: '', phone: '', email: '' });
  const [sForm, setSForm] = useState({ seat_type: '', hospital_id: '', check_in_date: '', check_out_date: '', price_per_day: '' });

  useEffect(() => {
    setLoading(true);
    getHospitals().then((res) => setHospitals(res.data || [])).catch(() => {}).finally(() => setLoading(false));
    if (tab === 'bookings') {
      getSeatBookings().then((res) => setSeatBookings(res.data || [])).catch(() => {});
    }
  }, [tab]);

  const handleAddHospital = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createHospital(hForm);
      setMsg('Hospital added successfully!');
      setShowAdd(false);
      setHForm({ name: '', address: '', city: '', phone: '', email: '' });
      getHospitals().then((res) => setHospitals(res.data || []));
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleBookSeat = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createSeatBooking({ seat_type: sForm.seat_type, hospital_id: showBook, check_in_date: sForm.check_in_date, check_out_date: sForm.check_out_date || undefined, price_per_day: sForm.price_per_day });
      setMsg('Seat booked successfully!');
      setShowBook(null);
      setSForm({ seat_type: '', hospital_id: '', check_in_date: '', check_out_date: '', price_per_day: '' });
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleSeatStatus = async (id, status) => {
    try {
      await updateSeatBookingStatus(id, status);
      setSeatBookings((prev) => prev.map((s) => (s.booking_id === id ? { ...s, status } : s)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn delay={0}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hospitals & Seats</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{hospitals.length} hospitals available</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('list')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 active:scale-[0.97] ${
              tab === 'list'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-200 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400'
              }`}
          >
            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Hospitals
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 active:scale-[0.97] ${
              tab === 'bookings'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-200 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400'
              }`}
          >
            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Bookings
          </button>
        </div>

        {/* Success/Error Message */}
        {msg && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium animate-bounce-in ${
            msg.includes('success')
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {msg.includes('success') ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {msg}
            </div>
          </div>
        )}

        {/* Hospitals Tab */}
        {tab === 'list' && (
          <>
            {user?.role !== 'patient' && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAdd(!showAdd)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    showAdd
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showAdd ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  {showAdd ? 'Cancel' : 'Add Hospital'}
                </button>
              </div>
            )}

            {/* Add Hospital Form */}
            {showAdd && (
              <form onSubmit={handleAddHospital} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Hospital</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hospital Name</label>
                    <input
                      placeholder="e.g. City General Hospital"
                      className="input-modern"
                      value={hForm.name}
                      onChange={(e) => setHForm({ ...hForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
                    <input
                      placeholder="e.g. 123 Health Street"
                      className="input-modern"
                      value={hForm.address}
                      onChange={(e) => setHForm({ ...hForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                    <input
                      placeholder="e.g. Dhaka"
                      className="input-modern"
                      value={hForm.city}
                      onChange={(e) => setHForm({ ...hForm, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                    <input
                      placeholder="e.g. 01XXXXXXXXX"
                      className="input-modern"
                      value={hForm.phone}
                      onChange={(e) => setHForm({ ...hForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email (optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. hospital@example.com"
                      className="input-modern"
                      value={hForm.email}
                      onChange={(e) => setHForm({ ...hForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="mt-4 gradient-btn inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Hospital
                </button>
              </form>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Hospital Cards */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospitals.map((h) => (
                  <div key={h.hospital_id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 hover:shadow-md hover:border-emerald-100 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{h.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {h.address}, {h.city}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {h.phone}
                          </span>
                          {h.email && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {h.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Book Seat Button & Form */}
                    {user?.role === 'patient' && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => setShowBook(showBook === h.hospital_id ? null : h.hospital_id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            showBook === h.hospital_id
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showBook === h.hospital_id ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            )}
                          </svg>
                          {showBook === h.hospital_id ? 'Cancel' : 'Book Seat'}
                        </button>

                        {showBook === h.hospital_id && (
                          <form onSubmit={handleBookSeat} className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Seat Type</label>
                            <div className="grid grid-cols-2 gap-2">
                              {SEAT_TYPES.map((st) => (
                                <button
                                  key={st.value}
                                  type="button"
                                  onClick={() => setSForm({ ...sForm, seat_type: st.value })}
                                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-left ${
                                    sForm.seat_type === st.value
                                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                                  }`}
                                >
                                  <span className="text-lg mr-2">{st.icon}</span>
                                  {st.value}
                                </button>
                              ))}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in Date *</label>
                              <input
                                type="date"
                                className="input-modern"
                                value={sForm.check_in_date}
                                onChange={(e) => setSForm({ ...sForm, check_in_date: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-out Date (optional)</label>
                              <input
                                type="date"
                                className="input-modern"
                                value={sForm.check_out_date}
                                onChange={(e) => setSForm({ ...sForm, check_out_date: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Per Day (BDT) *</label>
                              <input
                                type="number"
                                min="0"
                                className="input-modern"
                                placeholder="e.g. 1500"
                                value={sForm.price_per_day}
                                onChange={(e) => setSForm({ ...sForm, price_per_day: e.target.value })}
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={!sForm.seat_type || !sForm.check_in_date || !sForm.price_per_day}
                              className="gradient-btn w-full disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirm Booking
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && hospitals.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No hospitals found</p>
              </div>
            )}
          </>
        )}

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            {seatBookings.map((sb) => {
              const status = sb.status?.toLowerCase() || 'pending';
              return (
                <div key={sb.booking_id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{sb.hospital_name || `Hospital #${sb.hospital_id}`}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Seat: <span className="font-medium text-gray-700 dark:text-gray-300">{sb.seat_type}</span>
                          <span className="mx-1.5 text-gray-300 dark:text-gray-600">|</span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              status === 'confirmed' ? 'bg-emerald-500' : status === 'cancelled' ? 'bg-red-400' : 'bg-amber-400'
                            }`}></span>
                            {sb.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user?.role !== 'patient' && sb.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleSeatStatus(sb.booking_id, 'confirmed')}
                            className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all duration-200 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept
                          </button>
                          <button
                            onClick={() => handleSeatStatus(sb.booking_id, 'cancelled')}
                            className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {seatBookings.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No seat bookings yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
