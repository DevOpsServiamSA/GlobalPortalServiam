/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        serviam: {
          // Light theme colors (existing)
          dark: "#252525",
          primary: "#00699C",
          secondary: "#1EB8D8",
          background: "#F5F5F5",
          alert: "#F4B942",
          
          // Dark theme variants
          'dark-bg': "#1a1a1a",
          'dark-surface': "#2d2d2d",
          'dark-card': "#3a3a3a",
          'dark-border': "#4a4a4a",
          'dark-text': "#e5e5e5",
          'dark-text-secondary': "#b3b3b3",
          'dark-primary': "#4da3d1",
          'dark-secondary': "#52c7e3",
          'dark-alert': "#f7c55a"
        }
      },
      backgroundColor: {
        'theme-bg': 'var(--bg-primary)',
        'theme-surface': 'var(--bg-surface)',
        'theme-card': 'var(--bg-card)'
      },
      textColor: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)'
      },
      borderColor: {
        'theme-border': 'var(--border-color)'
      }
    }
  },
  plugins: [],
}

