/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A0A12',
        surface: '#14141F',
        'surface-2': '#1C1C2B',
        'surface-3': '#25253A',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-focus': 'rgba(124, 92, 255, 0.5)',
        text: '#F4F4F8',
        muted: '#9A9AB0',
        accent: {
          purple: '#7C5CFF',
          pink: '#FF5CAA',
          amber: '#FFB45C',
          green: '#3DDC97',
          red: '#FF5C7A'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        'card': '24px',
        'btn': '14px',
        'pill': '9999px'
      },
      boxShadow: {
        'glow': '0 0 40px rgba(124, 92, 255, 0.25)',
        'glow-lg': '0 0 60px rgba(124, 92, 255, 0.35)',
        'glow-success': '0 0 40px rgba(61, 220, 151, 0.3)',
        'glow-error': '0 0 40px rgba(255, 92, 122, 0.3)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #7C5CFF, #FF5CAA, #FFB45C)',
        'glow-radial': 'radial-gradient(circle at 50% 50%, rgba(124, 92, 255, 0.15) 0%, transparent 70%)'
      }
    },
  },
  plugins: [],
}
