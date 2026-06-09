import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getMedicines, createMedicine, getMedicineOrders, createMedicineOrder } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
  'Pain Relief': '💊',
  'Antibiotics': '🦠',
  'Vitamins': '🌿',
  'Allergy': '🤧',
  'Digestive': '🫁',
  'Heart': '❤️',
  'default': '💊',
};

function getMedicineIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
}

const ORDER_STATUS_STYLES = {
  delivered: { bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500' },
  pending: { bg: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
};

export default function Medicines() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('shop');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mForm, setMForm] = useState({ name: '', category: '', price: '', stock: '', manufacturer: '', requires_prescription: false });

  useEffect(() => {
    setLoading(true);
    getMedicines().then((res) => setMedicines(res.data || [])).catch(() => {}).finally(() => setLoading(false));
    if (tab === 'orders') {
      getMedicineOrders().then((res) => setOrders(res.data || [])).catch(() => {});
    }
  }, [tab]);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createMedicine(mForm);
      setMsg('Medicine added successfully!');
      setShowAdd(false);
      setMForm({ name: '', category: '', price: '', stock: '', manufacturer: '', requires_prescription: false });
      getMedicines().then((res) => setMedicines(res.data || []));
    } catch (err) {
      setMsg(err.message);
    }
  };

  const addToCart = (med) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.medicine_id === med.medicine_id);
      if (existing) return prev.map((c) => c.medicine_id === med.medicine_id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.medicine_id !== id));

  const placeOrder = async () => {
    setMsg('');
    if (!deliveryAddress.trim()) {
      setMsg('Please enter a delivery address.');
      return;
    }
    try {
      for (const item of cart) {
        await createMedicineOrder({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          delivery_address: deliveryAddress.trim(),
        });
      }
      setMsg('Order placed successfully!');
      setCart([]);
      setDeliveryAddress('');
      getMedicineOrders().then((res) => setOrders(res.data || []));
    } catch (err) {
      setMsg(err.message);
    }
  };

  const totalPrice = cart.reduce((sum, c) => sum + parseFloat(c.price || 0) * c.quantity, 0).toFixed(2);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Medicine Shop</h1>
              <p className="text-emerald-100 mt-1">Browse medicines, add to cart, and place orders</p>
            </div>
          </div>
        </div>

        {/* Tabs & Cart */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {[
              { key: 'shop', label: 'Shop', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
              { key: 'orders', label: 'My Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === key
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {label}
              </button>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="font-semibold text-sm">{cart.length} item(s) - ৳{totalPrice}</span>
            </div>
          )}
        </div>

        {/* Message */}
        {msg && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            msg.includes('success')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
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

        {/* Shop Tab */}
        {tab === 'shop' && (
          <div className="space-y-6">
            {/* Admin Add Button */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowAdd(!showAdd)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  showAdd
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAdd ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
                </svg>
                {showAdd ? 'Cancel' : 'Add Medicine'}
              </button>
            )}

            {/* Add Medicine Form */}
            {showAdd && (
              <form onSubmit={handleAddMedicine} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Medicine
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-modern">Name</label>
                    <input placeholder="Medicine name" className="input-modern" value={mForm.name} onChange={(e) => setMForm({ ...mForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label-modern">Category</label>
                    <input placeholder="e.g. Pain Relief" className="input-modern" value={mForm.category} onChange={(e) => setMForm({ ...mForm, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-modern">Price (৳)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="input-modern" value={mForm.price} onChange={(e) => setMForm({ ...mForm, price: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label-modern">Stock</label>
                    <input type="number" placeholder="Available quantity" className="input-modern" value={mForm.stock} onChange={(e) => setMForm({ ...mForm, stock: e.target.value })} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-modern">Manufacturer</label>
                    <input placeholder="Manufacturer name" className="input-modern" value={mForm.manufacturer} onChange={(e) => setMForm({ ...mForm, manufacturer: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${mForm.requires_prescription ? 'bg-indigo-500' : 'bg-gray-300'}`} onClick={() => setMForm({ ...mForm, requires_prescription: !mForm.requires_prescription })}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${mForm.requires_prescription ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-sm text-gray-700">Requires Prescription</span>
                    </label>
                  </div>
                </div>
                <button type="submit" className="mt-4 gradient-btn flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Medicine
                </button>
              </form>
            )}

            {/* Medicine Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-gray-500 mt-3 text-sm">Loading medicines...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {medicines.map((m) => (
                  <div key={m.medicine_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {getMedicineIcon(m.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{m.name}</h3>
                        {m.category && <p className="text-xs text-gray-500 mt-0.5">{m.category}</p>}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-bold text-emerald-600">৳{m.price}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Stock: {m.stock}
                      </span>
                      {m.manufacturer && <span className="truncate">{m.manufacturer}</span>}
                    </div>
                    {m.requires_prescription && (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-200 mb-3">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Prescription Required
                      </span>
                    )}
                    <button
                      onClick={() => addToCart(m)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                ))}
                {medicines.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No medicines available</p>
                    <p className="text-gray-400 text-sm mt-1">Check back later for new stock</p>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Shopping Cart
                </h2>
                <div className="space-y-3">
                  {cart.map((c) => (
                    <div key={c.medicine_id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center text-lg">
                          {getMedicineIcon(c.category)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{c.name}</p>
                          <p className="text-sm text-gray-500">Qty: {c.quantity} x ৳{c.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">৳{(parseFloat(c.price || 0) * c.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeFromCart(c.medicine_id)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address</label>
                    <input
                      className="input-modern"
                      placeholder="Enter your delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-800">Total: ৳{totalPrice}</span>
                    <button
                      onClick={placeOrder}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Place Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.map((o) => {
              const statusStyle = ORDER_STATUS_STYLES[o.status] || ORDER_STATUS_STYLES.pending;
              return (
                <div key={o.order_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">Order #{o.order_id}</span>
                        <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${statusStyle.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {o.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total: <span className="font-semibold">৳{o.total_amount}</span>
                  </div>
                  {o.items && o.items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {o.items.map((i, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                          {getMedicineIcon('')} {i.medicine_name || `#${i.medicine_id}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {orders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">Your medicine orders will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
