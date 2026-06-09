import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (!stats) {
    return <div className="text-center text-gray-500 py-10">Failed to load dashboard data</div>;
  }

  var u = stats || {};
  var cards = [
    { label: 'Total Users', value: (u.users && u.users.total) || 0, color: 'from-blue-500 to-blue-600', icon: 'M12 4.354a4 4 0 110 7.292 4 4 0 010-7.292z M15 21H9a1 1 0 01-1-1v-1a2 2 0 012-2h2a2 2 0 012 2v1a1 1 0 01-1 1z' },
    { label: 'Doctors', value: (u.doctors && u.doctors.total) || 0, color: 'from-green-500 to-green-600', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Hospitals', value: (u.hospitals && u.hospitals.total) || 0, color: 'from-purple-500 to-purple-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
    { label: 'Appointments', value: (u.appointments && u.appointments.total) || 0, color: 'from-yellow-500 to-orange-500', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Blood Donors', value: (u.blood && u.blood.donors) || 0, color: 'from-red-500 to-red-600', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Blood Requests', value: (u.blood && u.blood.requests) || 0, color: 'from-pink-500 to-pink-600', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Ambulance Bookings', value: (u.ambulance && u.ambulance.total) || 0, color: 'from-indigo-500 to-indigo-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Medicines', value: (u.medicines && u.medicines.total) || 0, color: 'from-teal-500 to-teal-600', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547' },
    { label: 'Articles', value: (u.articles && u.articles.total) || 0, color: 'from-cyan-500 to-cyan-600', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={'w-10 h-10 rounded-lg bg-gradient-to-br ' + card.color + ' flex items-center justify-center'}>
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
          {stats.recent_appointments && stats.recent_appointments.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_appointments.map(function(apt, i) {
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{apt.patient_name || 'Patient'}</p>
                      <p className="text-xs text-gray-500">{apt.doctor_name || 'Doctor'} - {apt.date || 'N/A'}</p>
                    </div>
                    <span className={'text-xs px-2 py-1 rounded-full ' + (apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600')}>
                      {apt.status || 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent appointments</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Blood Requests</h2>
          {stats.recent_blood_requests && stats.recent_blood_requests.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_blood_requests.map(function(req, i) {
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{req.patient_name || 'Patient'}</p>
                      <p className="text-xs text-gray-500">Blood Group: {req.blood_group || 'N/A'}</p>
                    </div>
                    <span className={'text-xs px-2 py-1 rounded-full ' + (req.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {req.status || 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent blood requests</p>
          )}
        </div>
      </div>
    </div>
  );
}
