/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand palette ─────────────────────────────────────────────────────
        brand: {
          bg:    '#FFF7E6',   // warm cream page background
          navy:  '#0D183D',   // primary text / dark surfaces
          honey: '#FFB703',   // primary accent (buttons, badges, highlights)
          gold:  '#FFD56A',   // soft gold highlight / secondary accent
          muted: '#4B6382',   // body text, subtitles
          card:  '#FFFFFF',   // card backgrounds
          light: '#F5F7FA',   // light gray / secondary surface
        },
        // ── Extended navy scale ───────────────────────────────────────────────
        navy: {
          50:  '#eef1f7',
          100: '#d5dded',
          200: '#abbcdb',
          300: '#7d96c4',
          400: '#5575ae',
          500: '#2d5a9e',
          600: '#1a3366',
          700: '#112249',
          800: '#0a1530',
          900: '#0D183D',   // exact brand primary
        },
        // ── Cream scale ───────────────────────────────────────────────────────
        cream: {
          50:  '#fffdf7',
          100: '#FFF7E6',   // matches brand.bg exactly
          200: '#faefd0',
          300: '#f2e4b5',
          400: '#e8d48e',
        },
        // ── Honey scale ───────────────────────────────────────────────────────
        honey: {
          50:  '#fffbeb',
          100: '#fff3c4',
          200: '#ffe680',
          300: '#FFD56A',   // brand.gold
          400: '#FFB703',   // brand.honey (primary)
          500: '#FFB703',
          600: '#D99E00',   // hover / pressed
          700: '#b07e00',
        },
        // ── Orange for secondary accents ──────────────────────────────────────
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:   '1rem',
        '2xl':'1.5rem',
        '3xl':'2rem',
        '4xl':'2.5rem',
      },
      boxShadow: {
        soft:       '0 4px 24px rgba(13,24,61,0.07)',
        card:       '0 2px 12px rgba(13,24,61,0.06)',
        lifted:     '0 8px 32px rgba(13,24,61,0.10)',
        glow:       '0 0 32px rgba(13,24,61,0.15)',
        'glow-honey':'0 0 32px rgba(255,183,3,0.28)',
      },
    },
  },
  plugins: [],
}
