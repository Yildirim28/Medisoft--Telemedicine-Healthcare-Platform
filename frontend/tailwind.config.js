/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-down': 'fadeInDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-left': 'fadeInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-right': 'fadeInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fadeIn': 'fadeIn 0.5s ease-out both',
        'fadeInUp': 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scaleIn': 'scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'bounceIn': 'bounceIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 1.5s infinite',
        'count-up': 'countUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(99, 102, 241, 0)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
