import { useEffect, useState } from 'react';
import { getAdminDoctors, createAdminDoctor, updateAdminDoctor, deleteAdminDoctor } from '../../api';
import { FadeIn, StaggerChildren } from '../../components/AnimatedPage';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: 'doctor123', specialization: '', custom_specialization: '', qualifications: '', experience_years: '', license_number: '', consultation_fee: '500', available_days: 'Mon-Fri', available_from: '09:00', available_to: '17:00', is_verified: false });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [updating, setUpdating] = useState(false);

  var loadDoctors = function() {
    setLoading(true);
    getAdminDoctors({ search: search })
      .then(function(data) { setDoctors(data.results || data); })
      .catch(function(e) { console.error(e); })
      .finally(function() { setLoading(false); });
  };

  useEffect(function() { loadDoctors(); }, [search]);

  var handleSubmit = function(e) {
    e.preventDefault();
    setError('');
    var submitData = Object.assign({}, form);
    if (submitData.specialization === '__other__') {
      submitData.specialization = submitData.custom_specialization || '';
    }
    delete submitData.custom_specialization;
    if (editingDoctor) {
      setUpdating(true);
      updateAdminDoctor(editingDoctor.doctor_id || editingDoctor.id, submitData)
        .then(function() {
          setEditingDoctor(null);
          setShowForm(false);
          setForm({ email: '', full_name: '', phone: '', password: 'doctor123', specialization: '', custom_specialization: '', qualifications: '', experience_years: '', license_number: '', consultation_fee: '500', available_days: 'Mon-Fri', available_from: '09:00', available_to: '17:00', is_verified: false });
          loadDoctors();
        })
        .catch(function(e) {
          setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to update doctor');
        })
        .finally(function() { setUpdating(false); });
    } else {
      createAdminDoctor(submitData)
        .then(function() {
          setShowForm(false);
          setForm({ email: '', full_name: '', phone: '', password: 'doctor123', specialization: '', custom_specialization: '', qualifications: '', experience_years: '', license_number: '', consultation_fee: '500', available_days: 'Mon-Fri', available_from: '09:00', available_to: '17:00', is_verified: false });
          loadDoctors();
        })
        .catch(function(e) {
          setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to create doctor');
        });
    }
  };

  var handleEdit = function(doc) {
    var spec = doc.specialization || '';
    var isCustom = !['Cardiologist','Dermatologist','General Physician','Neurologist','Orthopedic Surgeon','Pediatrician','Psychiatrist','Gynecologist','ENT Specialist','Ophthalmologist'].includes(spec);
    setEditingDoctor(doc);
    setForm({
      email: doc.email || '',
      full_name: doc.full_name || '',
      phone: doc.phone || '',
      password: '',
      specialization: isCustom ? '__other__' : spec,
      custom_specialization: isCustom ? spec : '',
      qualifications: doc.qualifications || '',
      experience_years: doc.experience_years != null ? String(doc.experience_years) : '',
      license_number: doc.license_number || '',
      consultation_fee: doc.consultation_fee || '500',
      available_days: doc.available_days || 'Mon-Fri',
      available_from: (doc.available_from || '09:00').substring(0, 5),
      available_to: (doc.available_to || '17:00').substring(0, 5),
      is_verified: !!doc.is_verified,
    });
    setShowForm(true);
    setError('');
  };

  var handleCancelEdit = function() {
    setEditingDoctor(null);
    setShowForm(false);
    setError('');
    setForm({ email: '', full_name: '', phone: '', password: 'doctor123', specialization: '', custom_specialization: '', qualifications: '', experience_years: '', license_number: '', consultation_fee: '500', available_days: 'Mon-Fri', available_from: '09:00', available_to: '17:00', is_verified: false });
  };

  var handleDelete = function(id) {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    deleteAdminDoctor(id).then(loadDoctors).catch(console.error);
  };

  return (
    <div>
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Doctors</h1>
          <button onClick={function() { if (showForm) { handleCancelEdit(); } else { setShowForm(true); } }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-[0.97] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md">
            {showForm ? 'Cancel' : '+ Add Doctor'}
          </button>
        </div>
      </FadeIn>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm animate-fade-in-up" style={{ animationDuration: '400ms', animationFillMode: 'forwards' }}>
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="email" placeholder="Email *" required value={form.email} onChange={function(e) { setForm(Object.assign({}, form, { email: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Full Name *" required value={form.full_name} onChange={function(e) { setForm(Object.assign({}, form, { full_name: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Phone *" required value={form.phone} onChange={function(e) { setForm(Object.assign({}, form, { phone: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="password" placeholder="Password (default: doctor123)" value={form.password} onChange={function(e) { setForm(Object.assign({}, form, { password: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <div>
              {form.specialization !== '__other__' ? (
                <select value={form.specialization} onChange={function(e) { setForm(Object.assign({}, form, { specialization: e.target.value })); }} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="">Select Specialization *</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="__other__">Other (type below)</option>
                </select>
              ) : (
                <input type="text" placeholder="Enter custom specialization *" autoFocus value={form.custom_specialization || ''} onChange={function(e) { setForm(Object.assign({}, form, { specialization: '__other__', custom_specialization: e.target.value })); }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              )}
            </div>
            <input type="text" placeholder="Qualifications" value={form.qualifications} onChange={function(e) { setForm(Object.assign({}, form, { qualifications: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="License Number" value={form.license_number} onChange={function(e) { setForm(Object.assign({}, form, { license_number: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="number" placeholder="Experience (years)" value={form.experience_years} onChange={function(e) { setForm(Object.assign({}, form, { experience_years: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="number" step="0.01" placeholder="Consultation Fee (BDT)" value={form.consultation_fee} onChange={function(e) { setForm(Object.assign({}, form, { consultation_fee: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Available Days (e.g. Mon-Fri)" value={form.available_days} onChange={function(e) { setForm(Object.assign({}, form, { available_days: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Available From</label>
              <input type="time" value={form.available_from} onChange={function(e) { setForm(Object.assign({}, form, { available_from: e.target.value })); }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Available To</label>
              <input type="time" value={form.available_to} onChange={function(e) { setForm(Object.assign({}, form, { available_to: e.target.value })); }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_verified" checked={form.is_verified} onChange={function(e) { setForm(Object.assign({}, form, { is_verified: e.target.checked })); }} className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 bg-white dark:bg-gray-700" />
              <label htmlFor="is_verified" className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified Doctor</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={updating} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-[0.97] transition-all duration-200 text-sm font-medium disabled:opacity-50 shadow-sm hover:shadow-md">{updating ? 'Updating...' : editingDoctor ? 'Update Doctor' : 'Create Doctor Account'}</button>
            </div>
          </form>
        </div>
      )}

      <FadeIn delay={100}>
        <div className="mb-4">
          <input type="text" placeholder="Search doctors..." value={search} onChange={function(e) { setSearch(e.target.value); }} className="w-full md:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 hover:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Specialization</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Experience</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {doctors.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 animate-fade-in">No doctors found</td></tr>
              )}
              {doctors.map(function(doc, idx) {
                return (
                  <tr key={doc.doctor_id || doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 active:scale-[0.99]" style={{ animation: 'fadeIn 0.3s ease-out forwards', animationDelay: (idx * 50) + 'ms', opacity: 0 }}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{doc.full_name || doc.user_full_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{doc.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{doc.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{doc.specialization || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{doc.experience_years || '-'} yrs</td>
                    <td className="px-4 py-3">
                      {doc.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-medium">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={function() { handleEdit(doc); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mr-3 active:scale-95 transition-all duration-200 hover:underline">Edit</button>
                      <button onClick={function() { handleDelete(doc.doctor_id || doc.id); }} className="text-red-500 hover:text-red-700 text-xs font-medium active:scale-95 transition-all duration-200 hover:underline">Delete</button>
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
