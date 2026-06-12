import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { searchDonors, registerDonor, getBloodRequests, createBloodRequest } from '../api';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const URGENCY_STYLES = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  urgent: 'bg-orange-100 text-orange-700 border border-orange-200',
  normal: 'bg-blue-100 text-blue-700 border border-blue-200',
};

const URGENCY_DOTS = {
  critical: 'bg-red-500',
  urgent: 'bg-orange-500',
  normal: 'bg-blue-500',
};

export default function BloodBank() {
  const { user } = useAuth();
  const [tab, setTab] = useState('donors');
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchParams, setSearchParams] = useState({ blood_group: '', city: '' });
  const [showRegister, setShowRegister] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [dForm, setDForm] = useState({ blood_group: '', city: '', phone: '', is_available: true });
  const [rForm, setRForm] = useState({ blood_group: '', city: '', units_needed: 1, urgency: 'Normal', notes: '' });

  useEffect(() => {
    if (tab === 'donors') handleSearch();
    if (tab === 'requests') {
      getBloodRequests().then((res) => setRequests(res.data || [])).catch(() => {});
    }
  }, [tab]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.blood_group) params.blood_group = searchParams.blood_group;
      if (searchParams.city) params.city = searchParams.city;
      const res = await searchDonors(params);
      setDonors(res.data || []);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await registerDonor(dForm);
      setMsg('Registered as donor successfully!');
      setShowRegister(false);
      setDForm({ blood_group: '', city: '', phone: '', is_available: true });
      handleSearch();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await createBloodRequest(rForm);
      setMsg('Blood request submitted!');
      setShowRequest(false);
      setRForm({ blood_group: '', city: '', units_needed: 1, urgency: 'Normal', notes: '' });
      getBloodRequests().then((res) => setRequests(res.data || []));
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Blood Bank</h1>
              <p className="text-red-100 mt-1">Find donors, register to donate, or request blood</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'donors', label: 'Find Donors', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
            { key: 'requests', label: 'Blood Requests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === key
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200'
                  : 'bg-white text-gray-600 hover:bg-red-50 border border-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </div>

        {/* Message */}
        {msg && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            msg.includes('success') || msg.includes('successfully')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {msg.includes('success') || msg.includes('successfully') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {msg}
          </div>
        )}

        {/* Donors Tab */}
        {tab === 'donors' && (
          <div className="space-y-6">
            {/* Search & Register */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <select
                      className="input-modern pl-10"
                      value={searchParams.blood_group}
                      onChange={(e) => setSearchParams({ ...searchParams, blood_group: e.target.value })}
                    >
                      <option value="">All Groups</option>
                      {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <input
                      className="input-modern pl-10"
                      placeholder="City name"
                      value={searchParams.city}
                      onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                    />
                  </div>
                </div>
                <button onClick={handleSearch} className="gradient-btn flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
                <button
                  onClick={() => setShowRegister(!showRegister)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    showRegister
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showRegister ? 'M6 18L18 6M6 6l12 12' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'} />
                  </svg>
                  {showRegister ? 'Cancel' : 'Register as Donor'}
                </button>
              </div>
            </div>

            {/* Register Form */}
            {showRegister && (
              <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register as Blood Donor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-modern">Blood Group</label>
                    <select className="input-modern" value={dForm.blood_group} onChange={(e) => setDForm({ ...dForm, blood_group: e.target.value })} required>
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-modern">City</label>
                    <input className="input-modern" placeholder="Your city" value={dForm.city} onChange={(e) => setDForm({ ...dForm, city: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label-modern">Phone</label>
                    <input className="input-modern" placeholder="Your phone number" value={dForm.phone} onChange={(e) => setDForm({ ...dForm, phone: e.target.value })} required />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${dForm.is_available ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setDForm({ ...dForm, is_available: !dForm.is_available })}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${dForm.is_available ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-sm text-gray-700">Available to donate</span>
                    </label>
                  </div>
                </div>
                <button type="submit" className="mt-4 gradient-btn bg-gradient-to-r from-emerald-500 to-green-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Register
                </button>
              </form>
            )}

            {/* Donor Cards */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
                <p className="text-gray-500 mt-3 text-sm">Searching donors...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {donors.map((d) => (
                  <div key={d.donor_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-red-200">
                        {d.blood_group}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{d.full_name || d.user_name || 'Donor'}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {d.city}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {d.phone}
                        </p>
                      </div>
                    </div>
                    {d.is_available && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Available
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {donors.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No donors found</p>
                    <p className="text-gray-400 text-sm mt-1">Try a different search or register as a donor</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div className="space-y-5">
            {user?.role === 'patient' && (
              <button
                onClick={() => setShowRequest(!showRequest)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  showRequest
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showRequest ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
                </svg>
                {showRequest ? 'Cancel' : 'New Blood Request'}
              </button>
            )}

            {showRequest && (
              <form onSubmit={handleCreateRequest} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Request Blood
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-modern">Blood Group</label>
                    <select className="input-modern" value={rForm.blood_group} onChange={(e) => setRForm({ ...rForm, blood_group: e.target.value })} required>
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-modern">City</label>
                    <input className="input-modern" placeholder="Your city" value={rForm.city} onChange={(e) => setRForm({ ...rForm, city: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label-modern">Units Needed</label>
                    <input type="number" min="1" className="input-modern" placeholder="Number of units" value={rForm.units_needed} onChange={(e) => setRForm({ ...rForm, units_needed: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label-modern">Urgency</label>
                    <select className="input-modern" value={rForm.urgency} onChange={(e) => setRForm({ ...rForm, urgency: e.target.value })}>
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-modern">Notes</label>
                    <textarea className="input-modern" placeholder="Additional notes for the blood request" rows={2} value={rForm.notes} onChange={(e) => setRForm({ ...rForm, notes: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="mt-4 gradient-btn bg-gradient-to-r from-red-500 to-rose-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit Request
                </button>
              </form>
            )}

            <div className="space-y-4">
              {requests.map((r) => {
                const urgency = r.urgency?.toLowerCase() || 'normal';
                return (
                  <div key={r.request_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-red-200">
                          {r.blood_group}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{r.blood_group}</span>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${URGENCY_STYLES[urgency] || URGENCY_STYLES.normal}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${URGENCY_DOTS[urgency] || URGENCY_DOTS.normal}`} />
                              {r.urgency}
                            </span>
                            <span className="text-sm text-gray-500">{r.units_needed} unit(s)</span>
                          </div>
                          {r.hospital_name && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {r.hospital_name}
                            </p>
                          )}
                          {r.notes && <p className="text-sm text-gray-400 mt-1">{r.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                          r.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          r.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'fulfilled' ? 'bg-emerald-500' :
                            r.status === 'cancelled' ? 'bg-gray-400' : 'bg-amber-500'
                          }`} />
                          {r.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 font-medium">No blood request yet</p>
                  <p className="text-gray-400 text-sm mt-1">Blood requests will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
