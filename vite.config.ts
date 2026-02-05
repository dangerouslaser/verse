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

  console.log('Vite config - kodiHost:', kodiHost);
  console.log('Vite config - kodiPath:', kodiPath);
  console.log('Vite config - kodiUsername:', kodiUsername);
  console.log('Vite config - kodiPassword:', kodiPassword ? '***' : undefined);

  // Build basic auth header if credentials are provided
  const headers: Record<string, string> = {
    // Disable compression - Kodi may send compressed responses that cause issues
    'accept-encoding': 'identity',
  };
  if (kodiUsername && kodiPassword) {
    const auth = Buffer.from(`${kodiUsername}:${kodiPassword}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
    console.log('Vite config - Authorization header:', headers['Authorization']);
  } else {
    console.log('Vite config - No auth credentials provided');
  }

  return {
    // Use relative paths for production builds (required for Kodi web interface)
    base: mode === 'production' ? './' : '/',
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
      cors: true,
      proxy: {
        // Proxy Kodi API calls during development
        [kodiPath]: {
          target: kodiHost,
          changeOrigin: true,
          secure: false,
          ws: false,
          timeout: 60000, // 60 second timeout for large responses
          proxyTimeout: 60000,
          headers,
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, _res) => {
              console.error('Proxy error:', err);
              console.error('Request:', req.method, req.url);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
              console.log('Proxy request headers:', proxyReq.getHeaders());
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              console.log('Response headers:', proxyRes.headers);
            });
          },
        },
        // Proxy Kodi image requests during development
        '/image': {
          target: kodiHost,
          changeOrigin: true,
          secure: false,
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
