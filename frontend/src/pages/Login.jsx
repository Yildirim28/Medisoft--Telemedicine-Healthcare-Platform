import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FadeIn } from '../components/AnimatedPage';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-float" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <FadeIn delay={0}>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-6 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </FadeIn>

        {/* Logo */}
        <FadeIn delay={100}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 mb-4 hover:scale-110 hover:rotate-3 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Medisoft
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Hospital Management System</p>
          </div>
        </FadeIn>

        {/* Card */}
        <FadeIn delay={250}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to your account to continue</p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl mb-5 text-sm flex items-center gap-2 animate-bounce-in">
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FadeIn delay={350}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-300 text-sm hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-100"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </FadeIn>

              <FadeIn delay={450}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-300 text-sm hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-100"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </FadeIn>

              <FadeIn delay={550}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </FadeIn>
            </form>

            <FadeIn delay={650} className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                  Create one
                </Link>
              </p>
            </FadeIn>
          </div>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={400}>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Trusted by healthcare professionals worldwide
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
