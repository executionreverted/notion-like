// tailwind.config.js
module.exports = {
  content: ['./src/renderer/**/*.tsx', "./public/index.html"],

  darkMode: "media",
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            h1: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' },
            h2: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' },
            h3: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' },
            p: { marginBottom: '0.75rem' },
            ul: { marginBottom: '0.75rem' },
            ol: { marginBottom: '0.75rem' },
            li: { marginBottom: '0.25rem' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
