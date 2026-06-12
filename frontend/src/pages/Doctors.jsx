import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getDoctors, createAppointment } from '../api';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const AVATAR_COLORS = [
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-purple-500 to-violet-400',
  'from-pink-500 to-rose-400',
  'from-orange-500 to-amber-400',
  'from-indigo-500 to-blue-400',
];

const SPEC_ICONS = {
  'Cardiology': 'M22 12h-4l-3 9L9 3l-3 9H2',
  'Neurology': 'M9.5 2A5.5 5.5 0 004 7.5c0 2.3 1.3 4.3 3.2 5.3L12 22l4.8-9.2C18.7 11.8 20 9.8 20 7.5A5.5 5.5 0 0014.5 2h-5z',
  'default': 'M22 12h-4l-3 9L9 3l-3 9H2',
};

function DoctorAvatar({ name, index }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [spec, setSpec] = useState('');
  const [showBook, setShowBook] = useState(null);
  const [form, setForm] = useState({ appointment_date: '', appointment_time: '', reason: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDoctors(spec ? { specialization: spec } : {})
      .then((res) => setDoctors(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [spec]);

  const handleBook = async (doctorId) => {
    setMsg('');
    try {
      await createAppointment({ ...form, doctor_id: doctorId, type: 'In-Person' });
      setMsg('Appointment booked successfully!');
      setShowBook(null);
      setForm({ appointment_date: '', appointment_time: '', reason: '' });
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn delay={0}>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Find a Doctor</h1>
            <p className="text-gray-500 mt-1">Book appointments with our experienced specialists</p>
          </div>
        </FadeIn>

        {/* Filter */}
        <FadeIn delay={100}>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 hover:shadow-md transition-shadow duration-300">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by specialization..."
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-300 text-sm hover:border-gray-300"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
              />
            </div>
          </div>
        </FadeIn>

        {/* Success/Error message */}
        {msg && (
          <div className={`p-4 rounded-xl text-sm flex items-center gap-2 animate-bounce-in ${msg.includes('success') ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {msg.includes('success') ? (
                <>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </>
              )}
            </svg>
            {msg}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
        )}

        {/* Doctor cards */}
        {!loading && doctors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-400 text-lg font-medium">No doctors found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search filter</p>
          </div>
        )}

        <StaggerChildren staggerDelay={100} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {doctors.map((doc, index) => (
            <div key={doc.doctor_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 overflow-hidden">
              {/* Card header */}
              <div className="p-6 pb-0">
                <div className="flex items-start gap-4">
                  <DoctorAvatar name={doc.full_name} index={index} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-800 truncate">{doc.full_name}</h3>
                      {doc.is_verified && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-indigo-600 text-sm font-medium mt-0.5">{doc.specialization}</p>
                    <p className="text-gray-400 text-xs mt-1">{doc.experience_years} years experience</p>
                  </div>
                </div>
              </div>

              {/* Info pills */}
              <div className="px-6 pt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                  ৳{doc.consultation_fee}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {doc.available_days}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {doc.available_from} - {doc.available_to}
                </span>
              </div>

              {/* Card footer */}
              <div className="p-6 pt-4">
                {user?.role === 'patient' && (
                  <>
                    <button
                      onClick={() => setShowBook(showBook === doc.doctor_id ? null : doc.doctor_id)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        showBook === doc.doctor_id
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {showBook === doc.doctor_id ? (
                        <>
                          Cancel
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Book Appointment
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </>
                      )}
                    </button>

                    {showBook === doc.doctor_id && (
                      <div className="mt-4 space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                            <input
                              type="date"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                              value={form.appointment_date}
                              onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                            <input
                              type="time"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                              value={form.appointment_time}
                              onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Reason (optional)</label>
                          <textarea
                            placeholder="Describe your symptoms..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-400 outline-none text-sm resize-none"
                            rows={2}
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                          />
                        </div>
                        <button
                          onClick={() => handleBook(doc.doctor_id)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 active:scale-[0.97] transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Confirm Booking
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </Layout>
  );
}
