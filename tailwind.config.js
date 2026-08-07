/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Angolan cultural palette inspired by traditional textiles and landscapes
        earth: {
          50: '#faf7f2',
          100: '#f3ebe0',
          200: '#e6d5c0',
          300: '#d4b896',
          400: '#c19a6b',
          500: '#a87d4f',
          600: '#8e6640',
          700: '#715034',
          800: '#543c29',
          900: '#3a2a1c',
        },
        savanna: {
          50: '#f5f7f0',
          100: '#e8efdc',
          200: '#cdd9b4',
          300: '#aabf85',
          400: '#8aa45f',
          500: '#6e8a45',
          600: '#566e36',
          700: '#43572d',
          800: '#364527',
          900: '#2c3722',
        },
        acacia: {
          50: '#fef8ed',
          100: '#fdeed0',
          200: '#fadb9c',
          300: '#f5bf66',
          400: '#f0a23c',
          500: '#e68420',
          600: '#c96518',
          700: '#a64c17',
          800: '#843c19',
          900: '#6b3218',
        },
        // Okapika - deep red-brown inspired by Angolan red soil
        okapika: {
          50: '#fdf3f2',
          100: '#fce4e1',
          200: '#facdca',
          300: '#f5a8a3',
          400: '#ed736c',
          500: '#df4a42',
          600: '#c83028',
          700: '#a82420',
          800: '#871f1d',
          900: '#6f1d1c',
        },
        // Atlantic blue
        atlantic: {
          50: '#eff6fb',
          100: '#d8ebf5',
          200: '#b3d8eb',
          300: '#7fbcd9',
          400: '#4a9bbf',
          500: '#2d7da3',
          600: '#226385',
          700: '#1e516d',
          800: '#1c445a',
          900: '#1b3a4d',
        },
        baobab: {
          50: '#f7f7f5',
          100: '#edece8',
          200: '#d9d7cf',
          300: '#bdbab0',
          400: '#9c998e',
          500: '#7d7a6f',
          600: '#64615a',
          700: '#524f49',
          800: '#43413d',
          900: '#383632',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
