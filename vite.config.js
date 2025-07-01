// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // proxy: {
    //   // Ketika frontend membuat permintaan ke '/api/...',
    //   // permintaan itu akan dialihkan ke 'http://saving-quietly-buffalo.ngrok-free.app/api/...'
    //   '/api': {
    //     target: 'http://saving-quietly-buffalo.ngrok-free.app', // Ini adalah base URL backend ngrok Anda
    //     changeOrigin: true, // Penting untuk permintaan lintas domain
    //     // rewrite: (path) => path.replace(/^\/api/, '/api'),
    //     // Perhatikan: Karena API backend Anda juga memiliki '/api' di jalurnya,
    //     // rewrite rule ini tidak perlu mengubah path secara drastis.
    //     // Jika Anda menghapus baris rewrite, itu juga bisa berfungsi jika API backend Anda
    //     // memang menggunakan /api. Namun, menyertakannya dengan perubahan ini lebih eksplisit.
    //     // Untuk contoh ini, kita akan mempertahankan '/api' di path target.
    //   },
    // },
  },
});
