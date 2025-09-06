/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DCFD00',      // Primary button color
        secondary: '#FFFFFF',    // Pure white for components
        accent: '#000000',       // Pure black
        warning: '#FFA500',      // Orange
        'bg-primary': '#FFFFF4', // Primary background color
        'bg-secondary': '#D9DBFF', // Secondary background
        'bg-accent': '#E6F3FF',  // Light blue
        'brutal-black': '#000000',
      },
      boxShadow: {
        'brutal': '3px 3px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-xs': '1px 1px 0px 0px #000000',
        'brutal-lg': '4px 4px 0px 0px #000000',
        'brutal-xl': '6px 6px 0px 0px #000000',
        'brutal-2xl': '8px 8px 0px 0px #000000',
        'brutal-inset': '3px 3px 0px 0px #000000, inset 0 0 0 2px #000000',
        'brutal-inset-sm': '2px 2px 0px 0px #000000, inset 0 0 0 1px #000000',
        'brutal-inset-lg': '4px 4px 0px 0px #000000, inset 0 0 0 2px #000000',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '5': '5px',
        '6': '6px',
      },
      borderRadius: {
        'brutal': '8px',
        'brutal-sm': '6px',
        'brutal-xs': '4px',
        'brutal-lg': '12px',
        'brutal-xl': '16px',
        'brutal-2xl': '20px',
        'brutal-nav': '8px',
        'brutal-top': '8px 8px 0 0',
        'brutal-bottom': '0 0 8px 8px',
        'brutal-left': '8px 0 0 8px',
        'brutal-right': '0 8px 8px 0',
      },
      fontFamily: {
        'sans': ['Inter', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}