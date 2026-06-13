import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        terminal: {
          bg:      '#0d1117',
          surface: '#161b22',
          border:  '#30363d',
          text:    '#e6edf3',
          muted:   '#8b949e',
          green:   '#3fb950',
          red:     '#f85149',
          yellow:  '#d29922',
          blue:    '#58a6ff',
          purple:  '#bc8cff',
        }
      },
      animation: {
        'scan-line': 'scan 1.5s ease-in-out infinite',
        'fade-in':   'fadeIn 0.3s ease-out forwards',
        'pulse-dot': 'pulseDot 1s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1' },
          '50%':      { transform: 'scale(1.4)', opacity: '0.6' },
        }
      }
    }
  },
  plugins: [],
}

export default config
