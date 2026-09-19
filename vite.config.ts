import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Allow Cloudflare quick-tunnel subdomains (they change on every tunnel start),
    // plus normal local hosts.
    allowedHosts: ['.trycloudflare.com', 'localhost', '127.0.0.1'],
  },
  preview: {
    host: true,
    allowedHosts: ['.trycloudflare.com', 'localhost', '127.0.0.1'],
  },
});
