import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getMedicines, createMedicine, getMedicineOrders, createMedicineOrder, cancelMedicineOrder } from '../api';
import { useAuth } from '../context/AuthContext';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const CATEGORY_ICONS = {
  'Pain Relief': '💊',
  'Antibiotics': '🦠',
  'Vitamins': '🌿',
  'Allergy': '🤧',
  'digestive': '🫁',
  'Heart': '❤️',
  'Default': '💊',
};

function getMedicineIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
}

const ORDER_STATUS_STYLES = {
  delivered: { bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500' },
  pending: { bg: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
};

const CATEGORIES = ['Pain Relief', 'Neurology', 'Gastroenterology', 'Allergy', 'Antibiotic', 'Diabetes', 'Cardiology', 'Respiratory', 'Vitamins', 'Pediatrics', 'Dermatology', 'Oncology', 'General'];

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
  const [customCategory, setCustomCategory] = useState('');
  const [cartPopup, setCartPopup] = useState(null);

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
      setCustomCategory('');
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
    setCartPopup({ name: med.brand_name || med.name || 'Medicine', price: med.price });
    setTimeout(() => setCartPopup(null), 2500);
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelMedicineOrder(orderId);
      setMsg('Order cancelled successfully!');
      getMedicineOrders().then((res) => setOrders(res.data || []));
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to cancel order';
      setMsg(errorMsg);
    }
  };

  const canCancelOrder = (order) => {
    if (order.status !== 'Placed') return false;
    const placedAt = new Date(order.placed_at || order.created_at);
    const now = new Date();
    const diffMs = now - placedAt;
    const diffMins = diffMs / (1000 * 60);
    return diffMins <= 30;
  };

  const getRemainingMinutes = (order) => {
    const placedAt = new Date(order.placed_at || order.created_at);
    const now = new Date();
    const diffMs = now - placedAt;
    const diffMins = 30 - (diffMs / (1000 * 60));
    return Math.max(0, Math.round(diffMins));
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn delay={0}>
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
        </FadeIn>

        {/* Tabs & Cart */}
        <FadeIn delay={100}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {[
              { key: 'shop', label: 'Shop', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
              { key: 'orders', label: 'My Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  tab === key
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-gray-200 dark:border-gray-700'
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

        {/* Shop Tab */}
        {tab === 'shop' && (
          <div className="space-y-6">
            {/* Admin Add Button */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowAdd(!showAdd)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  showAdd
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
              <form onSubmit={handleAddMedicine} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
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
                    <select className="input-modern bg-white dark:bg-gray-700" value={mForm.category} onChange={(e) => { const val = e.target.value; setMForm({ ...mForm, category: val }); if (val !== 'Other') setCustomCategory(''); }}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="Other">Other</option>
                    </select>
                    {mForm.category === 'Other' && (
                      <input placeholder="Enter custom category" className="input-modern mt-2" value={customCategory} onChange={(e) => { const val = e.target.value; setCustomCategory(val); setMForm({ ...mForm, category: val }); }} />
                    )}
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
                      <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${mForm.requires_prescription ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setMForm({ ...mForm, requires_prescription: !mForm.requires_prescription })}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${mForm.requires_prescription ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Requires Prescription</span>
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

            {/* Main Content: Medicine Grid + Cart Side by Side */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Medicine Grid - Left Side */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Loading medicines...</p>
                  </div>
                ) : (
                  <StaggerChildren staggerDelay={80}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {medicines.map((m) => (
                      <div key={m.medicine_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group active:scale-[0.98]">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {getMedicineIcon(m.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{m.brand_name || m.name || 'Medicine'}</h3>
                            {m.generic_name && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.generic_name}</p>}
                            {m.category && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{m.category}</p>}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-2xl font-bold text-emerald-600">৳{m.price}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
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
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.97]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add to Cart
                        </button>
                      </div>
                    ))}
                    {medicines.length === 0 && (
                      <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No medicines available</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Check back later for new stock</p>
                      </div>
                    )}
                  </div>
                  </StaggerChildren>
                )}
              </div>

              {/* Shopping Cart - Right Side (Sticky) */}
              <div className="w-full lg:w-[380px] flex-shrink-0">
                <div className="lg:sticky lg:top-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Shopping Cart
                    {cart.length > 0 && (
                      <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{cart.length}</span>
                    )}
                  </h2>

                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">Your cart is empty</p>
                      <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Add medicines from the shop</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                        {cart.map((c) => (
                          <div key={c.medicine_id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                                {getMedicineIcon(c.category)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{c.brand_name || c.name || 'Medicine'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {c.quantity} × ৳{c.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">৳{(parseFloat(c.price || 0) * c.quantity).toFixed(2)}</span>
                              <button
                                onClick={() => removeFromCart(c.medicine_id)}
                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Address</label>
                          <input
                            className="input-modern text-sm"
                            placeholder="Enter your delivery address"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">Total: ৳{totalPrice}</span>
                          <button
                            onClick={placeOrder}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 active:scale-[0.97]"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Place Order
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <StaggerChildren staggerDelay={80}>
          <div className="space-y-4">
            {orders.map((o) => {
              const statusStyle = ORDER_STATUS_STYLES[o.status] || ORDER_STATUS_STYLES.pending;
              return (
                <div key={o.order_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 active:scale-[0.99]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">Order #{o.order_id}</span>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(o.placed_at || o.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${statusStyle.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {o.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full">
                      {getMedicineIcon('')} {o.medicine_name || `Medicine #${o.medicine_id}`}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">× {o.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Total: <span className="font-semibold text-gray-800 dark:text-gray-100">৳{o.total_price || o.total_amount}</span>
                    </div>
                    {o.delivery_address && (
                      <span className="text-gray-400 dark:text-gray-500 text-xs truncate max-w-[200px]" title={o.delivery_address}>📍 {o.delivery_address}</span>
                    )}
                  </div>
                  {canCancelOrder(o) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium border border-amber-200">
                        ⏱ {getRemainingMinutes(o)} min left to cancel
                      </span>
                      <button
                        onClick={() => handleCancelOrder(o.order_id)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 flex items-center gap-1.5 active:scale-[0.97]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Order
                      </button>
                    </div>
                  )}
                  {o.status === 'Placed' && !canCancelOrder(o) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">Cancellation window expired</span>
                    </div>
                  )}
                </div>
              );
            })}
            {orders.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No orders yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Your medicine orders will appear here</p>
              </div>
            )}
          </div>
          </StaggerChildren>
        )}

        {/* Cart Added Popup */}
        {cartPopup && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-300 flex items-center gap-3 max-w-sm">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">{cartPopup.name}</p>
                <p className="text-emerald-100 text-xs">Added to cart • ৳{cartPopup.price}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
