import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const ROLE_COLORS = {
  patient: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', gradient: 'from-blue-400 to-indigo-500' },
  doctor: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-400 to-green-500' },
  admin: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', gradient: 'from-purple-400 to-pink-500' },
};

export default function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await updateProfile(form);
      setMsg('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.patient;

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <FadeIn delay={0}>
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
            <div className="relative flex items-center gap-6">
              {/* Avatar */}
              <div className={`w-20 h-20 bg-gradient-to-br ${roleStyle.gradient} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-white/30`}>
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.full_name}</h1>
                <p className="text-indigo-100 mt-1">{user.email}</p>
                <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Message */}
        {msg && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-bounce-in ${
            msg.includes('success')
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {msg.includes('success') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {msg}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {!editing ? (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  className="gradient-btn-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>

              <FadeIn delay={200}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="gradient-btn-sm flex items-center gap-2 active:scale-[0.97] transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </FadeIn>

              <StaggerChildren staggerDelay={80} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', value: user.full_name, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { label: 'Email', value: user.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { label: 'Phone', value: user.phone || 'N/A', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                  { label: 'User ID', value: user.user_id, icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2' },
                  { label: 'Role', value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { label: 'Joined', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                ].map((field, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{field.label}</p>
                      <p className="text-gray-800 dark:text-gray-100 font-medium mt-0.5">{field.value}</p>
                    </div>
                  </div>
                ))}
              </StaggerChildren>

              {/* Doctor Details */}
              {user.role === 'doctor' && user.doctor_profile && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    Doctor Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Specialization', value: user.doctor_profile.specialization },
                      { label: 'License', value: user.doctor_profile.license_number },
                      { label: 'Consultation Fee', value: `৳${user.doctor_profile.consultation_fee}` },
                      { label: 'Experience', value: `${user.doctor_profile.experience_years || 0} years` },
                      { label: 'Available Days', value: user.doctor_profile.available_days || 'N/A' },
                      { label: 'Available Time', value: `${user.doctor_profile.available_from || 'N/A'} - ${user.doctor_profile.available_to || 'N/A'}` },
                    ].map((field, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-medium">{field.label}</p>
                          <p className="text-gray-800 dark:text-gray-100 font-medium mt-0.5">{field.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Details */}
              {user.role === 'patient' && user.patient_profile && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Patient Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Date of Birth', value: user.patient_profile.date_of_birth ? new Date(user.patient_profile.date_of_birth).toLocaleDateString() : 'N/A' },
                      { label: 'Gender', value: user.patient_profile.gender || 'N/A' },
                      { label: 'Blood Group', value: user.patient_profile.blood_group || 'N/A' },
                      { label: 'Address', value: user.patient_profile.address || 'N/A' },
                      { label: 'City', value: user.patient_profile.city || 'N/A' },
                    ].map((field, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-medium">{field.label}</p>
                          <p className="text-gray-800 dark:text-gray-100 font-medium mt-0.5">{field.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label-modern">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input type="text" name="full_name" className="input-modern pl-10" value={form.full_name} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label className="label-modern">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input type="email" name="email" className="input-modern pl-10" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label className="label-modern">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input type="text" name="phone" className="input-modern pl-10" value={form.phone} onChange={handleChange} required />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="gradient-btn flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
