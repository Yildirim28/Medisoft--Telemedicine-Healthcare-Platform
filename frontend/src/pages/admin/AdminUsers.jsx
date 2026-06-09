import { useEffect, useState } from 'react';
import {
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../../api';

var ROLES = ['patient', 'doctor', 'admin'];

export default function AdminUsers() {
  var [users, setUsers] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState('');
  var [roleFilter, setRoleFilter] = useState('');
  var [editingUser, setEditingUser] = useState(null);
  var [editForm, setEditForm] = useState({});
  var [error, setError] = useState('');

  var loadUsers = function () {
    setLoading(true);
    var params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    getAdminUsers(params)
      .then(function (data) { setUsers(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () { loadUsers(); }, [search, roleFilter]);

  var handleEdit = function (user) {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'patient',
    });
    setError('');
  };

  var handleUpdate = function () {
    setError('');
    updateAdminUser(editingUser.id, editForm)
      .then(function () {
        setEditingUser(null);
        loadUsers();
      })
      .catch(function (e) {
        setError(e.response?.data?.error || e.response?.data?.detail || 'Failed to update user');
      });
  };

  var handleDelete = function (id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    deleteAdminUser(id).then(loadUsers).catch(console.error);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <select
          value={roleFilter}
          onChange={function (e) { setRoleFilter(e.target.value); }}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">Edit User</h2>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-500 text-sm">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={function (e) { setEditForm(Object.assign({}, editForm, { full_name: e.target.value })); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={function (e) { setEditForm(Object.assign({}, editForm, { phone: e.target.value })); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={function (e) { setEditForm(Object.assign({}, editForm, { role: e.target.value })); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {ROLES.map(function (r) {
                    return <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleUpdate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                Save Changes
              </button>
              <button onClick={function () { setEditingUser(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              )}
              {users.map(function (u) {
                var roleColors = {
                  patient: 'bg-blue-100 text-blue-700',
                  doctor: 'bg-green-100 text-green-700',
                  admin: 'bg-purple-100 text-purple-700',
                };
                return (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3 font-medium">{u.full_name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (roleColors[u.role] || 'bg-gray-100')}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={function () { handleEdit(u); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Edit</button>
                        {u.role !== 'admin' && (
                          <button onClick={function () { handleDelete(u.id); }} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                        )}
                      </div>
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
