import { useEffect, useState } from 'react';
import { getAdminDoctors, createAdminDoctor, deleteAdminDoctor } from '../../api';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', specialization: '', qualifications: '', experience_years: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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
    createAdminDoctor(form)
      .then(function() {
        setShowForm(false);
        setForm({ email: '', full_name: '', phone: '', specialization: '', qualifications: '', experience_years: '' });
        loadDoctors();
      })
      .catch(function(e) {
        setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to create doctor');
      });
  };

  var handleDelete = function(id) {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    deleteAdminDoctor(id).then(loadDoctors).catch(console.error);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <button onClick={function() { setShowForm(!showForm); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add New Doctor</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="email" placeholder="Email *" required value={form.email} onChange={function(e) { setForm(Object.assign({}, form, { email: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Full Name *" required value={form.full_name} onChange={function(e) { setForm(Object.assign({}, form, { full_name: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Phone *" required value={form.phone} onChange={function(e) { setForm(Object.assign({}, form, { phone: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Specialization" value={form.specialization} onChange={function(e) { setForm(Object.assign({}, form, { specialization: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Qualifications" value={form.qualifications} onChange={function(e) { setForm(Object.assign({}, form, { qualifications: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="number" placeholder="Experience Years" value={form.experience_years} onChange={function(e) { setForm(Object.assign({}, form, { experience_years: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <div className="md:col-span-2">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">Create Doctor</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input type="text" placeholder="Search doctors..." value={search} onChange={function(e) { setSearch(e.target.value); }} className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Specialization</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Experience</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No doctors found</td></tr>
              )}
              {doctors.map(function(doc) {
                return (
                  <tr key={doc.doctor_id || doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{doc.full_name || doc.user_full_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.specialization || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.experience_years || '-'} yrs</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={function() { handleDelete(doc.doctor_id || doc.id); }} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
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
