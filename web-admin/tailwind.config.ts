import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
          dark: '#C1121F',
          light: '#FF6B6B',
        },
        background: {
          DEFAULT: '#0F0F1A',
          light: '#1A1A2E',
          card: '#16213E',
        },
        border: '#2D3748',
        muted: '#718096',
      },
    },
  },
  plugins: [],
};

export default config;

