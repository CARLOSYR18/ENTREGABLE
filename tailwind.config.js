/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        sidebarItemIn: {
          '0%': { opacity: '0', transform: 'translate3d(-10px, 6px, 0) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        sidebarActive: {
          '0%': { boxShadow: '0 0 0 rgba(22, 163, 74, 0)', transform: 'translateX(0)' },
          '100%': { boxShadow: '0 14px 30px rgba(22, 101, 52, 0.14)', transform: 'translateX(0)' },
        },
        footerIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dashboardIn: {
          '0%': { opacity: '0', transform: 'translate3d(0, 14px, 0) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        progressSweep: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        statCardIn: {
          '0%': { opacity: '0', transform: 'translate3d(0, 10px, 0)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' },
        },
        barRise: {
          '0%': { transform: 'scaleY(0)', opacity: '0.35' },
          '65%': { opacity: '1' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        tableRowIn: {
          '0%': { opacity: '0', transform: 'translate3d(-12px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(0.86)' },
        },
      },
      animation: {
        'sidebar-item-in': 'sidebarItemIn 560ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'sidebar-active': 'sidebarActive 360ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'footer-in': 'footerIn 620ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'dashboard-in': 'dashboardIn 620ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'progress-sweep': 'progressSweep 1100ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'stat-card-in': 'statCardIn 680ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'bar-rise': 'barRise 900ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'table-row-in': 'tableRowIn 520ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'subtle-pulse': 'subtlePulse 1800ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
