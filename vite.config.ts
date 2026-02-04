import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  const kodiHost = env.VITE_KODI_HOST || 'http://localhost:8080';
  const kodiPath = env.VITE_KODI_JSONRPC_PATH || '/jsonrpc';
  const kodiUsername = env.VITE_KODI_USERNAME;
  const kodiPassword = env.VITE_KODI_PASSWORD;

  // Build basic auth header if credentials are provided
  const headers: Record<string, string> = {};
  if (kodiUsername && kodiPassword) {
    const auth = Buffer.from(`${kodiUsername}:${kodiPassword}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  return {
    plugins: [
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      TanStackRouterVite(),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Proxy Kodi API calls during development
        [kodiPath]: {
          target: kodiHost,
          changeOrigin: true,
          headers,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'tanstack-vendor': [
              '@tanstack/react-query',
              '@tanstack/react-router',
              '@tanstack/react-virtual',
            ],
          },
        },
      },
    },
  };
});
