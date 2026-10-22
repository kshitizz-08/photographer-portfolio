import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Warn on chunks over 500 kB (default is 500 kB, but make it explicit)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting strategy:
         * - react-vendor: React core (highly stable, rarely changes)
         * - router-vendor: React Router (changes independently)
         * - icons-vendor: Lucide React icon library (large, rarely changes per-route)
         * - Everything else falls into per-page async chunks produced by React.lazy()
         */
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
        },
      },
    },
  },
})
