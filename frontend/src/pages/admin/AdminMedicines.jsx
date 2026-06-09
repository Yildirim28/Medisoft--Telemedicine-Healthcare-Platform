import { useEffect, useState } from 'react';
import { getAdminMedicines, createAdminMedicine, deleteAdminMedicine } from '../../api';

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ brand_name: '', generic_name: '', price: '', category: 'General', unit: '', stock: '', requires_rx: false });
  const [error, setError] = useState('');
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
        <button onClick={function() { setShowForm(!showForm); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          {showForm ? 'Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add New Medicine</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Brand Name *" required value={form.brand_name} onChange={function(e) { setForm(Object.assign({}, form, { brand_name: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Generic Name *" required value={form.generic_name} onChange={function(e) { setForm(Object.assign({}, form, { generic_name: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="number" step="0.01" placeholder="Price *" required value={form.price} onChange={function(e) { setForm(Object.assign({}, form, { price: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Category" value={form.category} onChange={function(e) { setForm(Object.assign({}, form, { category: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="text" placeholder="Unit (e.g. tablet, capsule)" value={form.unit} onChange={function(e) { setForm(Object.assign({}, form, { unit: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={function(e) { setForm(Object.assign({}, form, { stock: e.target.value })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="requires_rx" checked={form.requires_rx} onChange={function(e) { setForm(Object.assign({}, form, { requires_rx: e.target.checked })); }} className="rounded" />
              <label htmlFor="requires_rx" className="text-sm text-gray-700">Requires Prescription</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">Create Medicine</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input type="text" placeholder="Search medicines..." value={search} onChange={function(e) { setSearch(e.target.value); }} className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Brand Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Generic Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medicines.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No medicines found</td></tr>
              )}
              {medicines.map(function(med) {
                return (
                  <tr key={med.medicine_id || med.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{med.brand_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{med.generic_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">${med.price || '0'}</td>
                    <td className="px-4 py-3 text-gray-600">{med.category || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{med.stock || '0'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={function() { handleDelete(med.medicine_id || med.id); }} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
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
