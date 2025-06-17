import { defineConfig } from 'unocss'

export default defineConfig({
  content: {
    filesystem: ['**/*.{html,js,ts,jsx,tsx}']
  },
  theme: {
    fontFamily: {
      mono: ['JetBrains Mono', 'monospace'],
    },
    colors: {
      pink: {
        400: '#F8229B',
      },
      cyan: {
        400: '#00ffe1',
      },
      green: {
        400: '#56F39A',
      },
    },
  },
  rules: [
    ['scrollbar-hide', {
      'scrollbar-width': 'none',
      '-ms-overflow-style': 'none',
      '&::-webkit-scrollbar': {
        'display': 'none'
      }
    }]
  ]
})
