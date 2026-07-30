import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

// Where the app's data file lives. Defaults to the project folder; point it at
// an iCloud/Dropbox folder for cross-device sync via NOOB_WIFEY_DATA.
const DATA_FILE = process.env.NOOB_WIFEY_DATA
  ? path.resolve(process.env.NOOB_WIFEY_DATA)
  : path.resolve(__dirname, 'noob-wifey-data.json')

// Serves GET/POST /api/data so the app can persist to a real file — no browser
// storage, and no file-permission popups.
function dataApi() {
  const handler = (req, res) => {
    if (req.method === 'GET') {
      let text = ''
      try { if (fs.existsSync(DATA_FILE)) text = fs.readFileSync(DATA_FILE, 'utf8') } catch (e) { /* ignore */ }
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('X-Data-Path', DATA_FILE)
      res.end(text)
      return
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      let body = ''
      req.on('data', (c) => { body += c })
      req.on('end', () => {
        try {
          fs.writeFileSync(DATA_FILE, body)
          res.setHeader('Content-Type', 'application/json')
          res.end('{"ok":true}')
        } catch (e) {
          res.statusCode = 500
          res.end('{"ok":false}')
        }
      })
      return
    }
    res.statusCode = 405
    res.end()
  }
  return {
    name: 'noob-wifey-data-api',
    configureServer(server) { server.middlewares.use('/api/data', handler) },
    configurePreviewServer(server) { server.middlewares.use('/api/data', handler) }
  }
}

export default defineConfig({
  // '/noob-wifey/' for the GitHub Pages build (set via BASE_PATH env), '/' locally
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), dataApi()],
  // host:true exposes the dev server on your local network, so you can open it
  // on your phone at http://<your-mac-ip>:5273 and Add to Home Screen.
  server: { port: 5273, host: true },
  preview: { port: 5273, host: true }
})
