/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: 'var(--bg-dark)',
        bgCard: 'var(--bg-card)',
        bgGlass: 'var(--bg-glass)',
        borderGlass: 'var(--border-glass)',
        borderGlow: 'var(--border-glow)',
        
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        
        accentPurple: 'var(--accent-purple)',
        accentBlue: 'var(--accent-blue)',
        accentOrange: 'var(--accent-orange)',
        accentPink: 'var(--accent-pink)',
        accentCyan: 'var(--accent-cyan)',
        accentGreen: 'var(--accent-green)',
        accentRed: 'var(--accent-red)',
      },
      backgroundImage: {
        gradientPurple: 'var(--gradient-purple)',
        gradientBlue: 'var(--gradient-blue)',
        gradientOrange: 'var(--gradient-orange)',
        gradientPink: 'var(--gradient-pink)',
        gradientCyan: 'var(--gradient-cyan)',
        gradientGreen: 'var(--gradient-green)',
        gradientRed: 'var(--gradient-red)',
        gradientBg: 'var(--gradient-bg)',
        gradientGlass: 'var(--gradient-glass)',
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'lg': 'var(--border-radius-lg)',
        'md': 'var(--border-radius-md)',
        'sm': 'var(--border-radius-sm)',
      }
    },
  },
  plugins: [],
}
