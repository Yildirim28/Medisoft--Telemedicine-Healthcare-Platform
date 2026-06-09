import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ROLES = ['patient', 'admin'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '', role: 'patient',
    date_of_birth: '', gender: '', blood_group: '', address: '', city: '',
    admin_code: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Medisoft</h1>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Create Account</h2>
          <p className="text-sm text-gray-500 mb-6">Join our healthcare community</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-200'} transition-all duration-300`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-200'} transition-all duration-300`} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" name="full_name" required placeholder="John Doe" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.full_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" required placeholder="you@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="text" name="phone" required placeholder="+880 1XXX-XXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" name="password" required placeholder="Min 6 characters" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.password} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        form.role === r
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {r === 'patient' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      )}
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2"
              >
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {form.role === 'patient' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    <input type="date" name="date_of_birth" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.date_of_birth} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                      <select name="gender" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.gender} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                      <input type="text" name="blood_group" placeholder="A+" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.blood_group} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    <input type="text" name="address" placeholder="Street address" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.address} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input type="text" name="city" placeholder="Dhaka" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.city} onChange={handleChange} />
                  </div>
                </>
              )}
              {form.role === 'admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Secret Code</label>
                    <input type="password" name="admin_code" required placeholder="Enter admin invite code" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200 text-sm" value={form.admin_code} onChange={handleChange} />
                    <p className="text-xs text-gray-400 mt-1">Contact the system administrator to get the invite code.</p>
                  </div>
                </>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
