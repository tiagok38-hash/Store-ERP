/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nova paleta de cores
        primary: {
          DEFAULT: '#4A90E2', // Um azul vibrante
          light: '#6AADEF',
          dark: '#3A7BD5',
        },
        secondary: {
          DEFAULT: '#50E3C2', // Um verde-água/menta
          light: '#70EAD0',
          dark: '#3ECDAF',
        },
        accent: {
          DEFAULT: '#F5A623', // Um laranja quente
          light: '#F8B84D',
          dark: '#E0951A',
        },
        background: {
          light: '#F0F2F5', // Um cinza claro suave
          dark: '#1A202C',  // Um azul escuro para o modo escuro
        },
        card: {
          light: '#FFFFFF', // Branco puro para cards no modo claro
          dark: '#2D3748',   // Um azul escuro mais claro para cards no modo escuro
        },
        text: {
          light: '#2D3748', // Texto escuro para modo claro
          dark: '#E2E8F0',  // Texto claro para modo escuro
        },
      },
      boxShadow: {
        // Sombras mais suaves e modernas
        'soft-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'soft-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'xl': '0.75rem', // Manter um bom arredondamento
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};