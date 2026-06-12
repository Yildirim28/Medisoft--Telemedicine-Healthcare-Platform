import { useEffect, useState } from 'react';
import {
  getAdminMedicineOrders,
  updateAdminMedicineOrder,
} from '../../api';
import { FadeIn } from '../../components/AnimatedPage';

export default function AdminMedicineOrders() {
  var [orders, setOrders] = useState([]);
  var [loading, setLoading] = useState(true);
  var [statusFilter, setStatusFilter] = useState('');

  var loadOrders = function () {
    setLoading(true);
    var params = {};
    if (statusFilter) params.status = statusFilter;
    getAdminMedicineOrders(params)
      .then(function (data) { setOrders(data.results || data); })
      .catch(function (e) { console.error(e); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () { loadOrders(); }, [statusFilter]);

  var handleStatus = function (id, status) {
    updateAdminMedicineOrder(id, { status: status }).then(loadOrders).catch(console.error);
  };

  var formatDate = function (d) {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  };

  var statusColors = {
    Placed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    Processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    Shipped: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    Delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  };

  return (
    <div>
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medicine Orders</h1>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={function (e) { setStatusFilter(e.target.value); }}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Status</option>
          <option value="Placed">Placed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Medicine</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Qty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Delivery Address</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Placed At</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No medicine orders found</td></tr>
              )}
              {orders.map(function (o, idx) {
                return (
                  <tr key={o.order_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 animate-fadeInUp" style={{ animationDelay: (idx * 60) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">#{o.order_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{o.patient_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{o.medicine_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{o.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">৳{o.total_price || o.total_amount || '0'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{o.delivery_address || '-'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatDate(o.placed_at || o.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-full text-xs font-semibold ' + (statusColors[o.status] || 'bg-gray-100')}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={function (e) { handleStatus(o.order_id, e.target.value); }}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
