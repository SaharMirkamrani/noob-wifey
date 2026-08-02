// Persistence with two backends:
//  • 'file' — the dev server's /api/data endpoint writes a real .json on disk
//    (used on the desktop via `npm run dev`; no browser storage, no popups).
//  • 'idb'  — on-device IndexedDB, used when the API isn't reachable (the
//    installed PWA on a phone, or a static deploy). Keeps the app usable offline.
import { ref, watch } from 'vue'
import { store, seed, restoreData, exportData } from './store.js'
import { idbGet, idbSet } from './idb.js'
import { toast } from './toast.js'

const IDB_KEY = 'data'

// 'init' | 'ready' | 'error'
export const status = ref('init')
export const mode = ref('file') // 'file' | 'idb'
export const filePath = ref('')

let suppress = false
let saving = false
let pendingSave = false
let dirty = false // true when the store has local changes not yet written out
let syncing = false

function legacyData() {
  try {
    const raw = localStorage.getItem('noob-wifey-v1')
    if (raw) {
      const d = JSON.parse(raw)
      if (d && Array.isArray(d.recipes) && d.recipes.length) return d
    }
  } catch (e) { /* ignore */ }
  return null
}

function applyPayload(text) {
  suppress = true
  if (text && (typeof text === 'string' ? text.trim() : true)) {
    const parsed = typeof text === 'string' ? JSON.parse(text) : text
    restoreData(parsed && parsed.data ? parsed.data : parsed)
    suppress = false
    return true
  }
  suppress = false
  return false
}

async function writeNow() {
  const payload = exportData()
  if (mode.value === 'file') {
    await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload })
  } else {
    await idbSet(IDB_KEY, payload)
  }
}

export async function init() {
  status.value = 'init'
  // 1) try the dev-server file API
  try {
    const res = await fetch('/api/data', { cache: 'no-store' })
    if (res.ok) {
      mode.value = 'file'
      filePath.value = res.headers.get('X-Data-Path') || 'noob-wifey-data.json'
      const text = await res.text()
      if (!applyPayload(text)) {
        suppress = true
        restoreData(legacyData() || seed())
        suppress = false
        await writeNow()
      }
      status.value = 'ready'
      return
    }
  } catch (e) { /* fall through to on-device storage */ }

  // 2) fall back to on-device IndexedDB (PWA / offline / static deploy)
  try {
    mode.value = 'idb'
    filePath.value = 'This device'
    const stored = await idbGet(IDB_KEY)
    if (!applyPayload(stored)) {
      suppress = true
      restoreData(legacyData() || seed())
      suppress = false
      await writeNow()
    }
    status.value = 'ready'
  } catch (e) {
    console.warn('storage init failed', e)
    status.value = 'error'
  }
}

export async function retry() {
  await init()
}

async function save() {
  if (status.value !== 'ready') return
  if (saving) { pendingSave = true; return }
  saving = true
  try {
    await writeNow()
    dirty = false
  } catch (e) {
    console.warn('save failed', e)
    toast('Couldn’t save your changes', { kind: 'warn' })
  }
  saving = false
  if (pendingSave) { pendingSave = false; save() }
}

let timer = null
watch(
  store,
  () => {
    if (suppress || status.value !== 'ready') return
    dirty = true
    clearTimeout(timer)
    timer = setTimeout(save, 400)
  },
  { deep: true }
)

/* ---------- cross-tab / cross-device sync ----------
 * When the window regains focus (or a mobile PWA comes back to the foreground),
 * re-read the shared backend and hydrate the store if it changed elsewhere.
 * Guarded so it never overwrites local edits that haven't been saved yet. */
async function readBackend() {
  if (mode.value === 'file') {
    const res = await fetch('/api/data', { cache: 'no-store' })
    return res.ok ? await res.text() : null
  }
  return await idbGet(IDB_KEY)
}

// compare just the data payload (ignoring the export wrapper + its timestamp)
function sameData(a, b) {
  const sig = (t) => {
    try {
      const p = typeof t === 'string' ? JSON.parse(t) : t
      return JSON.stringify(p && p.data ? p.data : p)
    } catch (e) { return null }
  }
  const x = sig(a)
  return x !== null && x === sig(b)
}

async function pullRemote() {
  // don't stomp on unsaved local changes or an in-flight save
  if (status.value !== 'ready' || saving || dirty || syncing) return
  syncing = true
  try {
    const text = await readBackend()
    if (text && !sameData(text, exportData())) applyPayload(text)
  } catch (e) { /* offline / transient — ignore, we'll try again on next focus */ }
  syncing = false
}

function onVisibility() {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') pullRemote()
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', pullRemote)
  document.addEventListener('visibilitychange', onVisibility)
}
