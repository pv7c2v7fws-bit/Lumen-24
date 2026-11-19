import type { Config } from 'tailwindcss';

// Màu lấy từ biến CSS trong styles/tokens.css (định dạng "R G B")
// để vẫn dùng được độ trong suốt, ví dụ bg-accent/30.
const color = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: color('--color-canvas'),
        surface: color('--color-surface'),
        'surface-muted': color('--color-surface-muted'),
        ink: color('--color-ink'),
        'ink-soft': color('--color-ink-soft'),
        line: color('--color-line'),
        accent: color('--color-accent'),
        'accent-strong': color('--color-accent-strong'),
        'on-accent': color('--color-on-accent'),
        focus: color('--color-focus'),
        success: color('--color-success'),
        warning: color('--color-warning'),
        danger: color('--color-danger'),
        info: color('--color-info'),
        // Mức độ đông ở sơ đồ chỗ ngồi
        crowd: {
          low: color('--color-crowd-low'),
          mid: color('--color-crowd-mid'),
          high: color('--color-crowd-high'),
          full: color('--color-crowd-full'),
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      maxWidth: {
        page: 'var(--page-max)',
      },
    },
  },
  plugins: [],
};

export default config;
