import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getLabBookings, createLabBooking } from '../api';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const TEST_TYPES = [
  { value: 'Blood Test', icon: '🩸', color: 'from-red-100 to-red-50' },
  { value: 'X-Ray', icon: '📷', color: 'from-blue-100 to-blue-50' },
  { value: 'MRI', icon: '🧠', color: 'from-purple-100 to-purple-50' },
  { value: 'CT Scan', icon: '🔍', color: 'from-indigo-100 to-indigo-50' },
  { value: 'Urine Test', icon: '🧪', color: 'from-amber-100 to-amber-50' },
  { value: 'ECG', icon: '💓', color: 'from-pink-100 to-pink-50' },
  { value: 'Ultrasound', icon: '🔊', color: 'from-teal-100 to-teal-50' },
  { value: 'COVID Test', icon: '🦠', color: 'from-orange-100 to-orange-50' },
  { value: 'Other', icon: '🔬', color: 'from-gray-100 to-gray-50' },
];

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
};

const DEFAULT_STATUS = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };

export default function LabBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ test_type: '', hospital_name: '', preferred_date: '', notes: '' });

  useEffect(() => {
    getLabBookings()
      .then((res) => setBookings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createLabBooking(form);
      setMsg('Lab test booked successfully!');
      setShowForm(false);
      setForm({ test_type: '', hospital_name: '', preferred_date: '', notes: '' });
      getLabBookings().then((res) => setBookings(res.data || []));
    } catch (err) {
      setMsg(err.message);
    }
  };

  const statusStyle = (s) => STATUS_STYLES[s?.toLowerCase()] || DEFAULT_STATUS;

  const getTestIcon = (type) => {
    const found = TEST_TYPES.find((t) => t.value === type);
    return found ? found.icon : '🔬';
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lab Tests</h1>
              <p className="text-sm text-gray-500">Book and manage your lab tests</p>
            </div>
          </div>
          {user?.role === 'patient' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                showForm
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showForm ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
              {showForm ? 'Cancel' : 'Book Lab Test'}
            </button>
          )}
        </div>
        </FadeIn>

        {/* Message */}
        {msg && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium animate-bounce-in ${
            msg.includes('success')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200'
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
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book a Lab Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Type</label>
                <select
                  className="input-modern"
                  value={form.test_type}
                  onChange={(e) => setForm({ ...form, test_type: e.target.value })}
                  required
                >
                  <option value="">Select Test Type</option>
                  {TEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.icon} {t.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital / Lab Name</label>
                <input placeholder="e.g. City Diagnostic Center" className="input-modern" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Date</label>
                <input type="date" className="input-modern" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <input placeholder="Any special instructions..." className="input-modern" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="mt-4 gradient-btn inline-flex items-center gap-2 active:scale-[0.97]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Book Test
            </button>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No lab bookings yet</p>
          </div>
        )}

        {/* Bookings List */}
        <StaggerChildren staggerDelay={80}>
          {bookings.map((b) => {
            const st = statusStyle(b.status);
            return (
              <div key={b.booking_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-300 active:scale-[0.99]">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center flex-shrink-0 text-lg">
                    {getTestIcon(b.test_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{b.test_type}</h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${st.bg} ${st.text} border ${st.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {b.hospital_name}
                    </p>
                    {b.preferred_date && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(b.preferred_date).toLocaleDateString()}
                      </p>
                    )}
                    {b.notes && (
                      <p className="text-sm text-gray-400 mt-1">{b.notes}</p>
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
