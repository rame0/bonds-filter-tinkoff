import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {}
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['night', 'light'],
    darkTheme: 'night'
  }
}
