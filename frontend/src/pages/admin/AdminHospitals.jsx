import { useEffect, useState } from 'react';
import { getAdminHospitals, createAdminHospital, deleteAdminHospital } from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hospital_name: '', address: '', city: '', phone: '', email: '', website: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  var loadHospitals = function() {
    setLoading(true);
    getAdminHospitals({ search: search })
      .then(function(data) { setHospitals(data.results || data); })
      .catch(function(e) { console.error(e); })
      .finally(function() { setLoading(false); });
  };

  useEffect(function() { loadHospitals(); }, [search]);

  var handleSubmit = function(e) {
    e.preventDefault();
    setError('');
    createAdminHospital(form)
      .then(function() {
        setShowForm(false);
        setForm({ hospital_name: '', address: '', city: '', phone: '', email: '', website: '' });
        loadHospitals();
      })
      .catch(function(e) {
        setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to create hospital');
      });
  };

  var handleDelete = function(id) {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;
    deleteAdminHospital(id).then(loadHospitals).catch(console.error);
  };

  return (
    <div>
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hospitals</h1>
          <button onClick={function() { setShowForm(!showForm); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium active:scale-[0.97]">
            {showForm ? 'Cancel' : '+ Add Hospital'}
          </button>
        </div>
      </FadeIn>

      {showForm && (
        <FadeIn delay={100}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm animate-bounce-in">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Add New Hospital</h2>
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Hospital Name *" required value={form.hospital_name} onChange={function(e) { setForm(Object.assign({}, form, { hospital_name: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="City *" required value={form.city} onChange={function(e) { setForm(Object.assign({}, form, { city: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Address *" required value={form.address} onChange={function(e) { setForm(Object.assign({}, form, { address: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Phone" value={form.phone} onChange={function(e) { setForm(Object.assign({}, form, { phone: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="email" placeholder="Email" value={form.email} onChange={function(e) { setForm(Object.assign({}, form, { email: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="url" placeholder="Website" value={form.website} onChange={function(e) { setForm(Object.assign({}, form, { website: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <div className="md:col-span-2">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium active:scale-[0.97]">Create Hospital</button>
            </div>
          </form>
        </div>
        </FadeIn>
      )}

      <FadeIn delay={150}>
        <div className="mb-4">
          <input type="text" placeholder="Search hospitals..." value={search} onChange={function(e) { setSearch(e.target.value); }} className="w-full md:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Hospital Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">City</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Address</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {hospitals.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No hospitals found</td></tr>
              )}
              {hospitals.map(function(h, idx) {
                return (
                  <tr key={h.hospital_id || h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{h.hospital_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{h.city || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{h.address || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{h.phone || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={function() { handleDelete(h.hospital_id || h.id); }} className="text-red-500 hover:text-red-700 text-xs font-medium active:scale-[0.97]">Delete</button>
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
