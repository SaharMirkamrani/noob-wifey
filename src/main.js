import { createApp } from 'vue'
import './assets/styles.css'
import App from './App.vue'

createApp(App).mount('#app')

// Register the service worker in production builds only (avoids clashing with
// Vite's HMR during `npm run dev`).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('SW registration failed', e))
  })
}
