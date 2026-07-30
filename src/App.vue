<script setup>
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import HomeView from './views/HomeView.vue'
import PlanView from './views/PlanView.vue'
import ShoppingView from './views/ShoppingView.vue'
import PantryView from './views/PantryView.vue'
import ToastHost from './components/ToastHost.vue'
import SettingsModal from './components/SettingsModal.vue'
import StorageGate from './components/StorageGate.vue'
import { status as storageStatus, init as initStorage } from './storage.js'

const tabs = [
  { key: 'home', label: 'Home', emoji: '🏠', comp: HomeView },
  { key: 'plan', label: 'Plan', emoji: '🗓️', comp: PlanView },
  { key: 'shopping', label: 'Shopping', emoji: '🛒', comp: ShoppingView },
  { key: 'pantry', label: 'Pantry', emoji: '🫙', comp: PantryView }
]

const isValid = (key) => tabs.some((t) => t.key === key)
// keep the active page in the URL hash so a refresh stays put (and back/forward work)
const fromHash = () => {
  let key = window.location.hash.replace(/^#\/?/, '')
  if (key === 'recipes') key = 'plan' // recipes + plan merged into one page
  return isValid(key) ? key : 'home'
}

const current = ref(fromHash())
const activeComp = computed(() => tabs.find((t) => t.key === current.value).comp)

function go(key) {
  if (!isValid(key)) return
  current.value = key
  if (fromHash() !== key) window.location.hash = `#/${key}`
}

const syncFromHash = () => { current.value = fromHash() }
onMounted(() => {
  initStorage() // open the data file (or show the connect gate)
  window.addEventListener('hashchange', syncFromHash)
  // normalize the URL on first load (e.g. bare "/" -> "#/home")
  if (!window.location.hash) window.location.hash = `#/${current.value}`
})
onUnmounted(() => window.removeEventListener('hashchange', syncFromHash))

// let child views jump between tabs (e.g. "plan a meal" from Home)
provide('navigate', go)

// settings / backup modal, openable from the sidebar or any view
const showSettings = ref(false)
provide('openSettings', () => { showSettings.value = true })
</script>

<template>
  <StorageGate v-if="storageStatus !== 'ready'" />

  <div v-else class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">🍳</div>
        <div class="brand-text">
          <div class="brand-name">Noob Wifey</div>
          <div class="brand-tag">cook · shop · breathe</div>
        </div>
      </div>

      <nav class="nav">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="nav-item"
          :class="{ active: current === t.key }"
          @click="go(t.key)"
        >
          <span class="nav-emoji">{{ t.emoji }}</span>
          <span class="nav-label">{{ t.label }}</span>
        </button>
      </nav>

      <div class="sidebar-foot">
        <button class="settings-btn" @click="showSettings = true">⚙️ Settings</button>
        <p>Made with 🤍 for busy bees</p>
      </div>
    </aside>

    <main class="stage">
      <Transition name="pop" mode="out-in">
        <component :is="activeComp" :key="current" />
      </Transition>
    </main>

    <!-- mobile bottom nav -->
    <nav class="tabbar">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tabbar-item"
        :class="{ active: current === t.key }"
        @click="go(t.key)"
      >
        <span class="tb-emoji">{{ t.emoji }}</span>
        <span class="tb-label">{{ t.label }}</span>
      </button>
    </nav>
  </div>

  <!-- always mounted so toasts/settings work over the gate too -->
  <ToastHost />
  <SettingsModal v-if="showSettings" @close="showSettings = false" />
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 208px 1fr;
  min-height: 100vh;
  max-width: 1180px;
  margin: 0 auto;
}

.sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.brand { display: flex; align-items: center; gap: 9px; padding: 4px 6px; }
.brand-mark {
  width: 34px; height: 34px; border-radius: 11px;
  display: grid; place-items: center; font-size: 1.1rem;
  background: linear-gradient(145deg, #f4c9b3, #e08a6b);
  box-shadow: var(--shadow-sm);
}
.brand-name { font-family: var(--font-head); font-weight: 600; font-size: 1.05rem; }
.brand-tag { font-size: 0.64rem; color: var(--ink-soft); font-weight: 600; letter-spacing: 0.02em; }

.nav { display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 11px; border-radius: 10px; text-align: left;
  font-weight: 700; color: var(--ink-soft); font-size: 0.88rem;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.nav-item:hover { background: rgba(199, 107, 78, 0.07); color: var(--ink); }
.nav-item.active { background: var(--card); color: var(--terracotta); box-shadow: var(--shadow-sm); border: 1px solid var(--line); }
.nav-emoji { font-size: 1rem; width: 20px; text-align: center; }

.sidebar-foot { margin-top: auto; padding: 10px 8px; }
.settings-btn {
  display: block; width: 100%; text-align: left; padding: 8px 10px; border-radius: 10px;
  font-weight: 700; font-size: 0.82rem; color: var(--ink-soft); margin-bottom: 8px;
  transition: background 0.15s ease, color 0.15s ease;
}
.settings-btn:hover { background: rgba(199, 107, 78, 0.07); color: var(--ink); }
.sidebar-foot p { font-size: 0.68rem; color: var(--ink-soft); font-weight: 600; padding-left: 10px; }

.stage { padding: 22px 26px 60px; min-width: 0; }

.tabbar { display: none; }

@media (max-width: 820px) {
  .shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .stage { padding: 20px 16px 96px; }
  .tabbar {
    display: flex; position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--card); border-top: 1px solid var(--line);
    padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
    z-index: 40; box-shadow: 0 -6px 20px rgba(122, 82, 60, 0.08);
  }
  .tabbar-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 6px 2px; border-radius: 12px; color: var(--ink-soft); font-weight: 700;
  }
  .tabbar-item.active { color: var(--terracotta); }
  .tb-emoji { font-size: 1.3rem; }
  .tb-label { font-size: 0.66rem; }
}
</style>
