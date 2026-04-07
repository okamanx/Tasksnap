import fs from 'fs';

const colors = {
  'on-surface': '#1b1c1a',
  'on-tertiary-fixed-variant': '#005312',
  'surface': '#fbf9f6',
  'on-tertiary': '#ffffff',
  'tertiary': '#1b6d24',
  'on-primary-container': '#613100',
  'on-secondary-container': '#6f4600',
  'secondary': '#845400',
  'outline': '#8a7362',
  'primary-container': '#ff8a00',
  'surface-container-highest': '#e4e2df',
  'on-primary-fixed-variant': '#6f3900',
  'surface-tint': '#914c00',
  'outline-variant': '#ddc1ae',
  'on-secondary-fixed': '#2a1800',
  'on-tertiary-container': '#00490e',
  'background': '#fbf9f6',
  'on-background': '#1b1c1a',
  'on-secondary-fixed-variant': '#643f00',
  'secondary-fixed-dim': '#ffb95a',
  'on-surface-variant': '#564334',
  'on-primary': '#ffffff',
  'on-primary-fixed': '#2f1500',
  'surface-variant': '#e4e2df',
  'on-tertiary-fixed': '#002204',
  'on-error-container': '#93000a',
  'primary-fixed': '#ffdcc4',
  'secondary-fixed': '#ffddb6',
  'inverse-on-surface': '#f2f0ed',
  'on-error': '#ffffff',
  'surface-dim': '#dbdad7',
  'error': '#ba1a1a',
  'surface-container-lowest': '#ffffff',
  'inverse-surface': '#30312f',
  'tertiary-container': '#6bbb68',
  'tertiary-fixed-dim': '#88d982',
  'surface-container': '#efeeeb',
  'error-container': '#ffdad6',
  'primary': '#914c00',
  'surface-container-high': '#eae8e5',
  'primary-fixed-dim': '#ffb77f',
  'inverse-primary': '#ffb77f',
  'surface-container-low': '#f5f3f0',
  'on-secondary': '#ffffff',
  'tertiary-fixed': '#a3f69c',
  'surface-bright': '#fbf9f6',
  'secondary-container': '#feb246',
};

// Simple dark mode invert mapping (just a rough mapping for dark mode)
const darkColors = {
  ...colors, // base
  'surface': '#121212',
  'background': '#121212',
  'surface-bright': '#1a1a1a',
  'surface-dim': '#0a0a0a',
  'surface-container-lowest': '#000000',
  'surface-container-low': '#181818',
  'surface-container': '#1e1e1e',
  'surface-container-high': '#242424',
  'surface-container-highest': '#2a2a2a',
  'on-surface': '#e0e0e0',
  'on-background': '#e0e0e0',
  'on-surface-variant': '#a0a0a0',
  'outline': '#666666',
  'outline-variant': '#444444',
  /* making orange pops lighter/less hurtful in dark mode */
  'primary': '#ffa333',
  /* texts on primary stay dark for contrast */
  'on-primary': '#4d2600',
  'primary-container': '#7d4000',
  'on-primary-container': '#ffdbbd',
  /* secondary */
  'secondary': '#ffb95a',
  'on-secondary': '#452b00',
  'secondary-container': '#6f4600',
  'on-secondary-container': '#ffddb6',
  'inverse-surface': '#e0e0e0',
  'inverse-on-surface': '#121212',
};

let css = ':root {\n';
for (let [k,v] of Object.entries(colors)) {
  css += `  --color-${k}: ${v};\n`;
}
css += '}\n\n.dark {\n';
for (let [k,v] of Object.entries(darkColors)) {
  css += `  --color-${k}: ${v};\n`;
}
css += '}\n';

let tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {\n`;
for (let k of Object.keys(colors)) {
  tailwindConfig += `        '${k}': 'var(--color-${k})',\n`;
}
tailwindConfig += `      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
`;

fs.writeFileSync('tailwind.config.js', tailwindConfig);

let indexCss = fs.readFileSync('src/index.css', 'utf-8');
// replace body styles and insert vars
indexCss = indexCss.replace(/body \{[\s\S]*?\}/, `body {
  font-family: 'Manrope', sans-serif;
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100dvh;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}`);

// add dark mode glass helpers
if (!indexCss.includes('.dark .glass-nav')) {
  indexCss += `
.dark .glass-nav {
  background: rgba(18, 18, 18, 0.80);
}
.dark .card-shadow {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3);
}
`;
}

// insert vars at top
indexCss = indexCss.replace(/@tailwind utilities;/g, `@tailwind utilities;\n\n${css}`);
fs.writeFileSync('src/index.css', indexCss);
