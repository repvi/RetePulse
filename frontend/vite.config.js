// vite.config.mjs
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env vars from the frontend directory
  const env = loadEnv(mode, process.cwd(), '');
  
  // Fallback values if env vars are not found
  const flaskUrl = env.VITE_FLASK_URL || 'http://localhost:5000';
  const socketioUrl = env.VITE_SOCKETIO_URL || 'http://localhost:5000';
  const reactAppUrl = env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

  console.log('Loaded environment variables:', {
    VITE_FLASK_URL: flaskUrl,
    VITE_SOCKETIO_URL: socketioUrl,
    VITE_REACT_APP_API_URL: reactAppUrl
  });

  return {
    plugins: [react()],
    define: {
      __FLASK_URL__: JSON.stringify(flaskUrl),
      __SOCKETIO_URL__: JSON.stringify(socketioUrl),
      __REACT_APP_API_URL__: JSON.stringify(reactAppUrl)
    },
    server: {
      port: 3000,
      host: true,
      hmr: {
        overlay: true
      }
    },
    // Ensure proper URL handling
    base: './',
    build: {
      outDir: 'dist'
    }
  };
});