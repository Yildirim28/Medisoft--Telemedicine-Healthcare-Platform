import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAmbulanceBookings, createAmbulanceBooking, updateAmbulanceStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  assigned: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  en_route: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
};

const DEFAULT_STATUS = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };

export default function Ambulance() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patient_name: '', patient_phone: '', pickup_address: '', dropoff_address: '',
    pickup_city: '', pickup_time: '', notes: '',
  });

  useEffect(() => {
    getAmbulanceBookings()
      .then((res) => setBookings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createAmbulanceBooking(form);
      setMsg('Ambulance booked successfully!');
      setShowForm(false);
      setForm({ patient_name: '', patient_phone: '', pickup_address: '', dropoff_address: '', pickup_city: '', pickup_time: '', notes: '' });
      getAmbulanceBookings().then((res) => setBookings(res.data || []));
    } catch (err) {
      setMsg(err.message);
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

  const statusStyle = (s) => STATUS_STYLES[s?.toLowerCase()] || DEFAULT_STATUS;

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
              <p className="text-sm text-gray-500 dark:text-gray-400">Emergency medical transport</p>
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

        {/* Booking Form */}
      {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              New Ambulance Booking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Patient Name</label>
                <input placeholder="e.g. John Doe" className="input-modern" value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Patient Phone</label>
                <input placeholder="e.g. 01XXXXXXXXX" className="input-modern" value={form.patient_phone} onChange={(e) => setForm({ ...form, patient_phone: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pickup Address</label>
                <input placeholder="e.g. 123 Main Street" className="input-modern" value={form.pickup_address} onChange={(e) => setForm({ ...form, pickup_address: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dropoff Address</label>
                <input placeholder="e.g. City Hospital" className="input-modern" value={form.dropoff_address} onChange={(e) => setForm({ ...form, dropoff_address: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                <input placeholder="e.g. Dhaka" className="input-modern" value={form.pickup_city} onChange={(e) => setForm({ ...form, pickup_city: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pickup Time</label>
                <input type="datetime-local" className="input-modern" value={form.pickup_time} onChange={(e) => setForm({ ...form, pickup_time: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
                <textarea placeholder="Any special instructions..." className="input-modern" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="mt-4 gradient-btn bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 inline-flex items-center gap-2 active:scale-[0.97]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Book Ambulance
            </button>
          </form>
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
          </div>
        )}

        {/* Bookings List */}
        <StaggerChildren staggerDelay={80}>
          {bookings.map((b) => {
            const st = statusStyle(b.status);
            return (
              <div key={b.booking_id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-all duration-300 active:scale-[0.99]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{b.patient_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${st.bg} ${st.text} border ${st.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        From: {b.pickup_address}, {b.pickup_city}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        To: {b.dropoff_address}
                      </div>
                      {b.pickup_time && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <svg className="w-3 h-3 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pickup: {new Date(b.pickup_time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {user?.role !== 'patient' && b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatus(b.booking_id, 'assigned')}
                          className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm active:scale-[0.97]"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Assign
                        </button>
                        <button
                          onClick={() => handleStatus(b.booking_id, 'cancelled')}
                          className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 active:scale-[0.97]"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {user?.role !== 'patient' && b.status === 'assigned' && (
                      <button
                        onClick={() => handleStatus(b.booking_id, 'completed')}
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
