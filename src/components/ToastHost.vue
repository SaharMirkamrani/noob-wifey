<script setup>
import { toasts, dismissToast } from '../toast.js'
</script>

<template>
  <div class="toast-host" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.kind" @click="dismissToast(t.id)">
        <span class="toast-emoji">{{ t.emoji || (t.kind === 'warn' ? '⚠️' : t.kind === 'info' ? '💬' : '✅') }}</span>
        <span class="toast-msg">{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed; z-index: 80; left: 0; right: 0; bottom: 20px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  pointer-events: none; padding: 0 16px;
}
.toast {
  pointer-events: auto; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px; border-radius: 999px; max-width: 90vw;
  background: var(--ink); color: #fff5ee; font-weight: 700; font-size: 0.88rem;
  box-shadow: var(--shadow-lg);
}
.toast.success { background: #5f6e51; }
.toast.info { background: var(--terracotta); }
.toast.warn { background: #b26a3f; }
.toast-emoji { font-size: 1.05rem; }
.toast-msg { line-height: 1.2; }

.toast-enter-active { transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.22s ease; }
.toast-enter-from { opacity: 0; transform: translateY(16px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translateY(8px) scale(0.96); }
.toast-move { transition: transform 0.25s ease; }

@media (min-width: 820px) {
  .toast-host { bottom: 26px; }
}
</style>
