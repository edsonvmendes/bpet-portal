import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // B3.Pet Brand Colors (from BPet_Theme.json)
        brand: {
          primary:   '#2BBFB3', // teal principal
          dark:      '#0C2426', // verde-escuro / foreground
          medium:    '#3D6B6E', // header text
          light:     '#8AB0B3', // label / muted
          accent:    '#1A9E93', // hover / border
          muted:     '#C5E8E6', // light teal
          bg:        '#EDF2F3', // page background
          surface:   '#FFFFFF', // card surface
          border:    '#D4E4E5', // card border
          rowAlt:    '#F3F8F8', // table alt row
          success:   '#17C97E',
          warning:   '#F5A623',
          danger:    '#F05252',
          purple:    '#9B8AFB',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      // CSS variables bridge — allows dynamic theming via :root
      // To use in JSX: className="bg-[var(--color-primary)]"
    },
  },
  plugins: [],
}

export default config
