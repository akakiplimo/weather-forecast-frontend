import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  themes: [
    {
      themeName: 'light',
      colorScheme: 'light',
      colors: {
        primary: '#235264',
        backgroundPrimary: '#964643',
      },
    },
    {
      themeName: 'dark',
      colorScheme: 'dark',
      colors: {
        primary: '#573242',
        backgroundPrimary: '#1a1a1a',
      },
    },
  ],
  plugins: [require('rippleui')],
  rippleui: {
    defaultStyle: false,
    removeThemes: ['dark'],
  },
} satisfies Config;
