/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The app calls `/api` on its own origin, so a phone or HTTPS tunnel only needs Vite's port.
// Only the API's own prefix: a route like `/apiary` stays with the app.
const proxy = { '^/api(/|\\?|$)': 'http://localhost:3000' };
// HTTPS tunnels, which iPhone Safari needs before it grants the camera.
const allowedHosts = [
  '.trycloudflare.com',
  '.ngrok-free.app',
  '.ngrok-free.dev',
];

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to every interface so phones on the local network can reach Vite.
    // The API allows these origins on ports 5173 and 5174.
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy,
    allowedHosts,
  },
  preview: { proxy, allowedHosts },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
