import { useEffect, useState } from 'react';
import { getAdminMedicines, createAdminMedicine, deleteAdminMedicine } from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ brand_name: '', generic_name: '', price: '', category: 'General', unit: '', stock: '', requires_rx: false });
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');
  const CATEGORIES = ['Pain Relief', 'Neurology', 'Gastroenterology', 'Allergy', 'Antibiotic', 'Diabetes', 'Cardiology', 'Respiratory', 'Vitamins', 'Pediatrics', 'Dermatology', 'Oncology', 'General'];
  const [search, setSearch] = useState('');

  var loadMedicines = function() {
    setLoading(true);
    getAdminMedicines({ search: search })
      .then(function(data) { setMedicines(data.results || data); })
      .catch(function(e) { console.error(e); })
      .finally(function() { setLoading(false); });
  };

  useEffect(function() { loadMedicines(); }, [search]);

  var handleSubmit = function(e) {
    e.preventDefault();
    setError('');
    createAdminMedicine(form)
      .then(function() {
        setShowForm(false);
        setForm({ brand_name: '', generic_name: '', price: '', category: 'General', unit: '', stock: '', requires_rx: false });
        setCustomCategory('');
        loadMedicines();
      })
      .catch(function(e) {
        setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to create medicine');
      });
  };

  var handleDelete = function(id) {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    deleteAdminMedicine(id).then(loadMedicines).catch(console.error);
  };

  return (
    <div>
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medicines</h1>
          <button onClick={function() { setShowForm(!showForm); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium active:scale-[0.97]">
            {showForm ? 'Cancel' : '+ Add Medicine'}
          </button>
        </div>
      </FadeIn>

      {showForm && (
        <FadeIn delay={100}>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm animate-bounce-in">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Add New Medicine</h2>
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Brand Name *" required value={form.brand_name} onChange={function(e) { setForm(Object.assign({}, form, { brand_name: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="text" placeholder="Generic Name *" required value={form.generic_name} onChange={function(e) { setForm(Object.assign({}, form, { generic_name: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="number" step="0.01" placeholder="Price *" required value={form.price} onChange={function(e) { setForm(Object.assign({}, form, { price: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <div className="flex flex-col gap-1.5">
              <select value={form.category} onChange={function(e) { var val = e.target.value; setForm(Object.assign({}, form, { category: val })); if (val !== 'Other') setCustomCategory(''); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                {CATEGORIES.map(function(cat) { return <option key={cat} value={cat}>{cat}</option>; })}
                <option value="Other">Other</option>
              </select>
              {form.category === 'Other' && (
                <input type="text" placeholder="Enter custom category" value={customCategory} onChange={function(e) { var val = e.target.value; setCustomCategory(val); setForm(Object.assign({}, form, { category: val })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              )}
            </div>
            <input type="text" placeholder="Unit (e.g. tablet, capsule)" value={form.unit} onChange={function(e) { setForm(Object.assign({}, form, { unit: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={function(e) { setForm(Object.assign({}, form, { stock: e.target.value })); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="requires_rx" checked={form.requires_rx} onChange={function(e) { setForm(Object.assign({}, form, { requires_rx: e.target.checked })); }} className="rounded" />
              <label htmlFor="requires_rx" className="text-sm text-gray-700 dark:text-gray-300">Requires Prescription</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium active:scale-[0.97]">Create Medicine</button>
            </div>
          </form>
        </div>
        </FadeIn>
      )}

      <FadeIn delay={150}>
        <div className="mb-4">
          <input type="text" placeholder="Search medicines..." value={search} onChange={function(e) { setSearch(e.target.value); }} className="w-full md:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Brand Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Generic Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {medicines.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No medicines found</td></tr>
              )}
              {medicines.map(function(med, idx) {
                return (
                  <tr key={med.medicine_id || med.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{med.brand_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{med.generic_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">${med.price || '0'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{med.category || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{med.stock || '0'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={function() { handleDelete(med.medicine_id || med.id); }} className="text-red-500 hover:text-red-700 text-xs font-medium active:scale-[0.97]">Delete</button>
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
