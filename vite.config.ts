import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Prioritize process.env (system vars provided by Vercel) over loaded env files.
      // We use JSON.stringify to ensure the values are embedded as strings.
      // We explicitly handle undefined to avoid "undefined" string injection or crashes.
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY ?? env.API_KEY ?? ''),
      'process.env.ACCESS_CODE': JSON.stringify(process.env.ACCESS_CODE ?? env.ACCESS_CODE ?? ''),
      'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL ?? env.API_BASE_URL ?? ''),
    },
    build: {
      outDir: 'dist',
    }
  };
});