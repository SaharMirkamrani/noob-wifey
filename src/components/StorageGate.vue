<script setup>
import { status, retry } from '../storage.js'
</script>

<template>
  <div class="gate">
    <div class="gate-card">
      <div class="gate-mark">🍳</div>

      <template v-if="status === 'error'">
        <h1>Can't reach your recipes</h1>
        <p>Noob Wifey saves to a file through its own server. Make sure the app is
          running (<code>npm run dev</code>), then try again. 🤍</p>
        <div class="gate-actions">
          <button class="btn btn-primary" @click="retry">Try again</button>
        </div>
      </template>

      <template v-else>
        <h1>Noob Wifey</h1>
        <p class="loading">Opening your kitchen…</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.gate {
  position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px;
  background:
    radial-gradient(1000px 480px at 100% -10%, rgba(224, 138, 107, 0.16), transparent),
    radial-gradient(800px 480px at -10% 110%, rgba(138, 154, 123, 0.16), transparent),
    var(--cream);
}
.gate-card {
  width: 100%; max-width: 400px; background: var(--card); border: 1px solid var(--line);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); padding: 30px 26px; text-align: center;
}
.gate-mark {
  width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 18px; font-size: 2rem;
  display: grid; place-items: center; background: linear-gradient(145deg, #f4c9b3, #e08a6b); box-shadow: var(--shadow-sm);
}
.gate-card h1 { font-size: 1.5rem; margin-bottom: 8px; }
.gate-card p { color: var(--ink-soft); font-weight: 600; line-height: 1.5; }
.gate-card code { background: var(--cream-2); padding: 2px 6px; border-radius: 6px; font-weight: 700; }
.loading { color: var(--ink-soft); }
.gate-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.gate-actions .btn { width: 100%; padding: 12px 18px; }
</style>
