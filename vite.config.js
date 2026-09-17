import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for Richfield Connect (client-only React SPA, no backend).
export default defineConfig({
  plugins: [react()],
});
