import { Link } from 'react-router-dom';
import { ScrollReveal, FadeIn, StaggerChildren, CountUpNumber } from '../components/AnimatedPage';

const services = [
  {
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    title: 'Find Doctors',
    description: 'Browse verified doctors across multiple specializations. Book appointments online with top-rated healthcare professionals.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'Book Appointments',
    description: 'Schedule in-person or video consultations at your convenience. Get instant confirmations and reminders.',
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
  },
  {
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    title: 'Hospital Directory',
    description: 'Explore partner hospitals with detailed information, facilities, and real-time bed availability.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  {
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    title: 'Blood Bank',
    description: 'Find blood donors instantly. Register as a donor or request blood units for emergencies.',
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Ambulance Service',
    description: 'Book emergency ambulance services with real-time tracking. Available 24/7 for critical situations.',
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
  },
  {
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    title: 'Medicine Shop',
    description: 'Order prescription and OTC medicines online. Fast delivery with verified pharmacies.',
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    title: 'Lab Tests',
    description: 'Book diagnostic lab tests from certified laboratories. Get reports delivered to your dashboard.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  {
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
    title: 'Health Articles',
    description: 'Read expert health tips and medical articles. Stay informed about wellness and preventive care.',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
  },
];

const stats = [
  { value: '500+', label: 'Verified Doctors' },
  { value: '50+', label: 'Partner Hospitals' },
  { value: '10K+', label: 'Happy Patients' },
  { value: '24/7', label: 'Emergency Service' },
];

const testimonials = [
  {
    name: 'Dr. Rahman Ahmed',
    role: 'Cardiologist',
    text: 'Medisoft has streamlined my practice. Managing appointments and prescriptions has never been easier.',
  },
  {
    name: 'Fatima Khan',
    role: 'Patient',
    text: 'I booked a cardiologist appointment within minutes. The video consultation feature is incredibly convenient.',
  },
  {
    name: 'Dr. Sarah Mitchell',
    role: 'General Physician',
    text: 'A comprehensive platform that connects patients with the right healthcare providers seamlessly.',
  },
];

function ServiceCard({ icon, title, description, color, bg, iconBg }) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]">
      <div className={'w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md ' + iconBg + ' group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300'}>
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ value, label }) {
  const numericValue = parseInt(value) || 0;
  const suffix = value.replace(/[0-9]/g, '');
  return (
    <div className="text-center group cursor-default">
      <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
        {numericValue > 0 ? <CountUpNumber target={numericValue} duration={1800} /> : null}{suffix}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

function TestimonialCard({ name, role, text }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth={1}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

function ServiceIcon({ d }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Medisoft
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute top-20 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 animate-float" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <FadeIn delay={100}>
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Trusted by 10,000+ Patients Nationwide
              </div>
            </FadeIn>

            <FadeIn delay={250}>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight mb-6">
                Your Health,{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={400}>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">
                Medisoft is a comprehensive hospital management platform that connects patients with verified doctors,
                hospitals, and healthcare services — all from one place.
              </p>
            </FadeIn>

            <FadeIn delay={550}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95"
                >
                  Get Started Free
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  Sign In to Dashboard
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <StatCard key={i} value={stat.value} label={stat.label} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">
                Comprehensive Healthcare{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Services</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Everything you need for your healthcare journey, from finding the right doctor to managing your health records.
              </p>
            </div>
          </ScrollReveal>

          <StaggerChildren staggerDelay={100} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <ServiceCard key={i} {...service} />
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">
                How It{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Works</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Getting started with Medisoft is simple. Follow these three easy steps.
              </p>
            </div>
          </ScrollReveal>

          <StaggerChildren staggerDelay={150} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up for free with your email and basic information. It takes less than a minute.',
                color: 'from-indigo-500 to-indigo-600',
              },
              {
                step: '02',
                title: 'Choose a Service',
                desc: 'Browse doctors, book appointments, order medicines, or access any healthcare service.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                step: '03',
                title: 'Get Care',
                desc: 'Receive quality healthcare through in-person visits or video consultations from anywhere.',
                color: 'from-pink-500 to-pink-600',
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]">
                <div className={'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-xl font-extrabold bg-gradient-to-br ' + item.color + ' shadow-lg'}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">
                What People{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Say</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                Trusted by doctors, patients, and healthcare professionals across the country.
              </p>
            </div>
          </ScrollReveal>

          <StaggerChildren staggerDelay={120} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '2s' }} />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  Ready to Take Control of Your Health?
                </h2>
                <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of patients who trust Medisoft for their healthcare needs.
                  Sign up today and get access to all features for free.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="px-8 py-4 text-base font-semibold text-indigo-600 bg-white rounded-2xl hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 hover:shadow-xl"
                  >
                    Create Free Account
                    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    Sign In to Your Account
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">Medisoft</span>
              </div>
              <p className="text-sm leading-relaxed">
                Your trusted hospital management platform for comprehensive healthcare services.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>Find Doctors</li>
                <li>Book Appointments</li>
                <li>Blood Bank</li>
                <li>Medicine Shop</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About Us</li>
                <li>Contact</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>Help Center</li>
                <li>Terms of Service</li>
                <li>FAQ</li>
                <li>Emergency: 999</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Medisoft. All rights reserved. Built with care for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
