import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';
import { FadeIn, StaggerChildren } from '../components/AnimatedPage';

const features = [
  {
    title: 'Find Doctors',
    desc: 'Browse specialists and book appointments',
    link: '/doctors',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    color: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-50',
  },
  {
    title: 'Hospitals',
    desc: 'View hospitals and book seats',
    link: '/hospitals',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    color: 'from-emerald-500 to-teal-400',
    bgLight: 'bg-emerald-50',
  },
  {
    title: 'Blood Bank',
    desc: 'Search donors or request blood',
    link: '/blood-bank',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    color: 'from-red-500 to-rose-400',
    bgLight: 'bg-red-50',
  },
  {
    title: 'Ambulance',
    desc: 'Request emergency ambulance service',
    link: '/ambulance',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'from-orange-500 to-amber-400',
    bgLight: 'bg-orange-50',
  },
  {
    title: 'Medicine Shop',
    desc: 'Order medicines delivered to your door',
    link: '/medicines',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    color: 'from-violet-500 to-purple-400',
    bgLight: 'bg-violet-50',
  },
  {
    title: 'Lab Tests',
    desc: 'Book diagnostic tests & checkups',
    link: '/lab-bookings',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    color: 'from-pink-500 to-fuchsia-400',
    bgLight: 'bg-pink-50',
  },
  {
    title: 'Health Tips',
    desc: 'Read articles & wellness advice',
    link: '/articles',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    color: 'from-teal-500 to-emerald-400',
    bgLight: 'bg-teal-50',
  },
  {
    title: 'Payments',
    desc: 'View bills & transaction history',
    link: '/payments',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    color: 'from-amber-500 to-yellow-400',
    bgLight: 'bg-amber-50',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ doctors: 0, hospitals: 0, patients: 0 });

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        const d = res.data || res;
        setStats({
          doctors: d.doctors || 0,
          hospitals: d.hospitals || 0,
          patients: d.patients || 0,
        });
      })
      .catch(() => {});
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Have a great day';
    if (hour < 17) return 'Enjoy your day';
    return 'Good evening';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome banner */}
        <FadeIn delay={0}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-float" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 animate-float" style={{ animationDelay: '1s' }} />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-lg hover:scale-110 hover:rotate-3 transition-transform duration-300">
                {initials}
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">{greeting()}</p>
                <h1 className="text-2xl md:text-3xl font-bold">{user?.full_name || 'User'}</h1>
                <p className="text-white/70 text-sm mt-1 capitalize">
                  {user?.role === 'patient' ? 'Patient Account' : user?.role === 'doctor' ? 'Doctor Account' : 'Administrator'}
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/25 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/25 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
                {user?.email}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Quick stats */}
        <StaggerChildren staggerDelay={100} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Doctors', value: String(stats.doctors), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-blue-600 bg-blue-50' },
            { label: 'Hospitals', value: String(stats.hospitals), icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Services', value: '24/7', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-orange-600 bg-orange-50' },
            { label: 'Patients', value: String(stats.patients), icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-pink-600 bg-pink-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={stat.icon} />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </StaggerChildren>

        {/* Services grid */}
        <div>
          <FadeIn delay={300}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Our Services</h2>
          </FadeIn>
          <StaggerChildren staggerDelay={80} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((card) => (
              <Link
                key={card.link}
                to={card.link}
                className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} mb-4 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={card.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">{card.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                  Explore
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </Layout>
  );
}
