/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:         '#2BBFB3',
        'primary-dark':  '#1A9E93',
        'primary-light': '#C5E8E6',
        foreground:      '#0C2426',
        muted:           '#3D6B6E',
        subtle:          '#8AB0B3',
        surface:         '#FFFFFF',
        page:            '#EDF2F3',
        border:          '#D4E4E5',
        accent:          '#F5A623',
        success:         '#17C97E',
        danger:          '#F05252',
        good:            '#17C97E',
        bad:             '#F05252',
        neutral:         '#F5A623',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 4px 0 rgba(12,36,38,.08)',
        'card-hover':'0 4px 16px 0 rgba(43,191,179,.18)',
      },
    },
  },
  plugins: [],
}