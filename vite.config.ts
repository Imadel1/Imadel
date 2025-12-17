import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { vitePluginWebp } from './vite-plugin-webp'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginWebp({
      quality: 80, // WebP quality (0-100)
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Leaflet (maps)
            if (id.includes('leaflet')) {
              return 'vendor-maps';
            }
            // React Icons
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            // Other vendor libraries
            return 'vendor-other';
          }
          
          // Admin Panel (large component, split separately)
          if (id.includes('AdminPanel')) {
            return 'admin';
          }
          
          // Contact page (large component with maps)
          if (id.includes('Contact') && !id.includes('Contact.css')) {
            return 'contact';
          }
        },
      },
    },
    // Optimize chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  },
  // CDN configuration via environment variable
  // Set VITE_CDN_URL in .env file (e.g., VITE_CDN_URL=https://cdn.example.com)
  base: process.env.VITE_CDN_URL || '/',
})
