/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        dm: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        sidebar: {
          from: '#1d293d',
          to: '#0f172b',
        },
        brand: {
          blue: '#0089ff',
          cyan: '#00d4ff',
        },
        slate: {
          50: '#f7f8fb',
          200: '#e2e8f0',
          400: '#97a3b6',
          500: '#64748b',
          700: '#aeb0b6',
          900: '#0f172a',
        },
        status: {
          pending: { bg: '#fff8db', text: '#c25e16' },
          approved: { bg: '#e6f1ff', text: '#2958e8' },
          shipped: { bg: '#eef1fd', text: '#363998' },
          delivered: { bg: '#defced', text: '#007a55' },
          rejected: { bg: '#ffebec', text: '#f23e41' },
          active: { bg: '#defced', text: '#007a55' },
          critical: { bg: '#ffebec', text: '#f23e41' },
        },
        badge: {
          red: '#de524c',
        },
      },
    },
  },
  plugins: [],
};
