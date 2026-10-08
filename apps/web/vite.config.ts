/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The app calls `/api` on its own origin, so a phone or HTTPS tunnel only needs Vite's port.
const proxy = { '/api': 'http://localhost:3000' };

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to every interface so phones on the local network can reach Vite.
    // The API allows these origins on ports 5173 and 5174.
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy,
    // HTTPS tunnels, which iPhone Safari needs before it grants the camera.
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app'],
  },
  preview: { proxy },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
