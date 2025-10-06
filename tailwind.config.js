/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#FF6B35',
        'primary-orange-dark': '#E55A2B',
        'primary-orange-light': '#FF8555',
        'bg-dark': '#1A1A1A',
        'bg-medium': '#2D2D2D',
        'bg-light': '#3D3D3D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0B0',
        'text-disabled': '#666666',
        'waveform-signal': '#00FF00',
        'waveform-grid': '#333333',
        'waveform-gate-a': '#FFD700',
        'waveform-gate-b': '#FF69B4'
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        industrial: {
          'primary': '#FF6B35',
          'secondary': '#2D2D2D',
          'accent': '#FFD700',
          'neutral': '#1A1A1A',
          'base-100': '#1A1A1A',
          'info': '#2196F3',
          'success': '#4CAF50',
          'warning': '#FFC107',
          'error': '#F44336'
        }
      }
    ]
  }
};
