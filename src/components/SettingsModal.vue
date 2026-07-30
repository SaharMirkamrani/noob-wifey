<script setup>
import { ref, computed } from 'vue'
import Modal from './Modal.vue'
import { store, exportData, inspectBackup, restoreData } from '../store.js'
import { filePath } from '../storage.js'
import { toast } from '../toast.js'

const emit = defineEmits(['close'])

const plannedMeals = computed(() =>
  Object.values(store.plan || {}).reduce((n, day) => n + Object.values(day).filter(Boolean).length, 0)
)

/* ---- backup ---- */
function downloadBackup() {
  const blob = new Blob([exportData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `noob-wifey-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  toast('Backup downloaded', { emoji: '💾' })
}

/* ---- restore ---- */
const pending = ref(null) // { data, recipes, meals, pantry, fileName }
const fileInput = ref(null)

function chooseFile() {
  fileInput.value?.click()
}
function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const info = inspectBackup(reader.result)
      pending.value = { ...info, fileName: file.name }
    } catch (err) {
      toast(err.message || 'Could not read that file', { kind: 'warn', emoji: '⚠️' })
    }
  }
  reader.onerror = () => toast('Could not read that file', { kind: 'warn', emoji: '⚠️' })
  reader.readAsText(file)
  e.target.value = '' // allow re-selecting the same file later
}
function confirmRestore() {
  restoreData(pending.value.data)
  const n = pending.value.recipes
  pending.value = null
  toast(`Restored ${n} recipes`, { emoji: '✅' })
  emit('close')
}
</script>

<template>
  <Modal title="Settings" @close="emit('close')">
    <div class="settings">
      <p class="lead">Noob Wifey saves everything straight to a file on your computer — no browser storage. Keep an extra backup now and then, just in case. 🤍</p>

      <!-- current data file -->
      <section class="block">
        <div class="block-head">
          <span class="block-emoji">📁</span>
          <div>
            <h3>Your data file</h3>
            <p>Autosaving to <strong class="path">{{ filePath || '—' }}</strong></p>
            <p>{{ store.recipes.length }} recipes · {{ plannedMeals }} planned meals · {{ store.pantry.length }} pantry items.</p>
          </div>
        </div>
      </section>

      <!-- backup -->
      <section class="block">
        <div class="block-head">
          <span class="block-emoji">💾</span>
          <div>
            <h3>Save a backup</h3>
            <p>Downloads a file with {{ store.recipes.length }} recipes, {{ plannedMeals }} planned meals and {{ store.pantry.length }} pantry items.</p>
          </div>
        </div>
        <button class="btn btn-primary" @click="downloadBackup">Download backup file</button>
      </section>

      <!-- restore -->
      <section class="block">
        <div class="block-head">
          <span class="block-emoji">📂</span>
          <div>
            <h3>Restore from a backup</h3>
            <p>Load a previously saved file. This replaces everything currently in the app.</p>
          </div>
        </div>

        <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onFile" />

        <template v-if="!pending">
          <button class="btn btn-soft" @click="chooseFile">Choose backup file…</button>
        </template>

        <div v-else class="confirm-box">
          <div class="cb-info">
            <strong>{{ pending.fileName }}</strong>
            <span>{{ pending.recipes }} recipes · {{ pending.meals }} meals · {{ pending.pantry }} pantry items</span>
          </div>
          <p class="cb-warn">⚠️ This replaces your current cookbook, plan and pantry.</p>
          <div class="cb-actions">
            <button class="btn btn-ghost" @click="pending = null">Cancel</button>
            <button class="btn btn-danger" @click="confirmRestore">Replace everything</button>
          </div>
        </div>
      </section>
    </div>
  </Modal>
</template>

<style scoped>
.settings { display: flex; flex-direction: column; gap: 18px; }
.lead { color: var(--ink-soft); font-weight: 600; line-height: 1.5; }

.block { border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; background: var(--card); }
.block-head { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.block-emoji {
  font-size: 1.3rem; width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px;
  display: grid; place-items: center; background: var(--cream-2);
}
.block-head h3 { font-size: 1.05rem; margin-bottom: 2px; }
.block-head p { font-size: 0.84rem; color: var(--ink-soft); font-weight: 600; line-height: 1.4; }
.path { color: var(--terracotta); word-break: break-all; font-size: 0.82rem; }
.block .btn { width: 100%; }

.confirm-box { background: #fbeee2; border: 1px solid #f0d3bd; border-radius: var(--radius-sm); padding: 14px; }
.cb-info { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
.cb-info strong { font-size: 0.9rem; }
.cb-info span { font-size: 0.8rem; color: var(--ink-soft); font-weight: 700; }
.cb-warn { font-size: 0.82rem; font-weight: 700; color: #a9741f; margin-bottom: 12px; }
.cb-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-danger { background: #c0563f; color: #fff; width: auto; }
.btn-danger:hover { background: #a8492f; }
.cb-actions .btn { width: auto; }
</style>
