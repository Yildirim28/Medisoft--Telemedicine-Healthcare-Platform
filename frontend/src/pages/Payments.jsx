import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FadeIn } from '../components/AnimatedPage';
import { createPayment, initBkashPayment } from '../api';
import { useAuth } from '../context/AuthContext';

const SERVICE_TYPES = [
  {
    value: 'Appointment', label: 'Appointment',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: 'from-blue-400 to-indigo-500', defaultPrice: 500,
    description: 'Pay for doctor consultation appointments',
  },
  {
    value: 'MedicineOrder', label: 'Medicine Order',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    color: 'from-emerald-400 to-green-500', defaultPrice: 0,
    description: 'Pay for online medicine orders',
  },
  {
    value: 'SeatBooking', label: 'Seat Booking',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    color: 'from-purple-400 to-pink-500', defaultPrice: 1500,
    description: 'Pay for hospital bed / seat booking',
  },
  {
    value: 'LabBooking', label: 'Lab Test',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    color: 'from-cyan-400 to-blue-500', defaultPrice: 800,
    description: 'Pay for laboratory test bookings',
  },
  {
    value: 'Ambulance', label: 'Ambulance',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'from-red-400 to-rose-500', defaultPrice: 1200,
    description: 'Pay for ambulance service',
  },
];

const STATUS_STYLES = {
  Success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Failed: 'bg-red-50 text-red-700 border border-red-200',
  Refunded: 'bg-gray-50 text-gray-700 border border-gray-200',
};

export default function Payments() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedService, setSelectedService] = useState('Appointment');
  const [amount, setAmount] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);

  // When user selects a service type, auto-populate the amount
  useEffect(() => {
    const svc = SERVICE_TYPES.find(s => s.value === selectedService);
    if (svc) {
      if (svc.defaultPrice > 0) {
        setAmount(svc.defaultPrice.toString());
      } else {
        setAmount(''); 
      }
    }
  }, [selectedService]);

  const handleBkashPayment = async (e) => {
    e.preventDefault();
    setMsg('');
    setPaying(true);

    try {
      const payload = {
        service_type: selectedService,
        service_id: serviceId || 0,
        amount: amount || 0,
        phone: phone,
      };

      const res = await initBkashPayment(payload);

      if (res.bkash_url) {
       
        window.location.href = res.bkash_url;
      } else if (res.redirect_url) {
      
        window.location.href = res.redirect_url;
      } else {
        setMsg('Payment initiation failed. No bKash URL received.');
      }
    } catch (err) {
      setMsg(err.message);
    } finally {
      setPaying(false);
    }
  };

  const selectedInfo = SERVICE_TYPES.find(s => s.value === selectedService);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <FadeIn delay={0}>
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="text-pink-100 mt-1">Secure payment processing powered by bKash</p>
            </div>
          </div>
        </div>
        </FadeIn>

        {/* bKash Trust Badge */}
        <FadeIn delay={100}>
        <div className="flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">bKash Secured</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">256-bit Encryption</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">bKash / Nagad / Card</span>
          </div>
        </div>
        </FadeIn>

        {/* Message */}
        {msg && (
          <FadeIn delay={50}>
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-bounce-in ${
            msg.includes('success') || msg.includes('Success')
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {msg.includes('success') || msg.includes('Success') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {msg}
          </div>
          </FadeIn>
        )}

        {/* Payment Form */}
        {showForm && (
          <FadeIn delay={150}>
          <form onSubmit={handleBkashPayment} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-6 animate-bounce-in">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Make a Payment via bKash
            </h3>

            {/* Service Type Selection */}
            <div>
              <label className="label-modern">Choose Service Category</label>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-3">Select the service you want to pay for — amount will auto-populate</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SERVICE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSelectedService(s.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 animate-fadeInUp active:scale-[0.97] ${
                      selectedService === s.value
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 shadow-md ring-2 ring-pink-200 dark:ring-pink-700'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                      </svg>
                    </div>
                    <span className={`text-xs font-medium ${selectedService === s.value ? 'text-pink-700 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'}`}>{s.label}</span>
                    {s.defaultPrice > 0 && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">৳{s.defaultPrice}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Service Info */}
            {selectedInfo && (
              <div className={`p-4 rounded-xl bg-gradient-to-r ${selectedInfo.color} bg-opacity-10 border border-gray-100`}
                   style={{ background: `linear-gradient(135deg, rgba(236,72,153,0.05), rgba(219,39,119,0.05))` }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${selectedInfo.color} rounded-lg flex items-center justify-center text-white`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedInfo.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selectedInfo.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedInfo.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-modern">Service ID (optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. appointment/booking ID"
                    className="input-modern pl-10"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label-modern">Amount (BDT)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium text-sm">৳</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    className={`input-modern pl-8 ${selectedInfo?.defaultPrice > 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    readOnly={selectedInfo?.defaultPrice > 0}
                    required
                  />
                </div>
                {selectedInfo?.defaultPrice > 0 && (
                  <p className="text-xs text-pink-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Auto-filled for {selectedInfo.label}. You can modify if needed.
                  </p>
                )}
                {selectedInfo?.defaultPrice === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Enter the amount to pay for this order</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="label-modern">bKash Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    className="input-modern pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Accepted Payment Methods:</p>
              <div className="flex flex-wrap gap-2">
                {['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard', 'DBBL', 'IBBL'].map((m) => (
                  <span key={m} className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={paying || !amount || parseFloat(amount) <= 0}
                className={`gradient-btn flex-1 flex items-center justify-center gap-2 active:scale-[0.97] ${(paying || !amount || parseFloat(amount) <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={!paying && amount && parseFloat(amount) > 0 ? { background: 'linear-gradient(135deg, #e91e63, #ad1457)' } : {}}
              >
                {paying ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Pay ৳{amount || '0'} via bKash
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setMsg(''); }}
                className="px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 active:scale-[0.97]"
              >
                Cancel
              </button>
            </div>
          </form>
          </FadeIn>
        )}

        {/* Info Card */}
        {!showForm && (
          <FadeIn delay={150}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Secure Payments via bKash</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                Pay securely for appointments, medicine orders, seat bookings, lab tests, and ambulance services through bKash — Bangladesh's most trusted mobile financial service.
              </p>

              {/* Service Type Cards with Prices */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {SERVICE_TYPES.map((s, idx) => (
                  <div key={s.value} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 animate-fadeInUp" style={{ animationDelay: (idx * 80) + 'ms', animationFillMode: 'forwards', opacity: 0 }}>
                    <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{s.label}</span>
                    {s.defaultPrice > 0 ? (
                      <span className="text-sm font-bold text-pink-600">৳{s.defaultPrice}</span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">Custom</span>
                    )}
                  </div>
                ))}
              </div>

              {user?.role === 'patient' ? (
                <button
                  onClick={() => { setShowForm(true); setMsg(''); }}
                  className="gradient-btn inline-flex items-center gap-2 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #e91e63, #ad1457)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Make a Payment
                </button>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payments are processed through the patient dashboard.
                  </p>
                </div>
              )}
            </div>
          </div>
          </FadeIn>
        )}
      </div>
    </Layout>
  );
}
