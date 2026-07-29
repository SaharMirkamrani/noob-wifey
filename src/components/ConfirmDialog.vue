<script setup>
defineProps({
  title: { type: String, default: 'Are you sure?' },
  message: String,
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false },
  emoji: { type: String, default: '🤍' }
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="pop" appear>
    <div class="overlay" @click.self="emit('cancel')">
      <div class="dialog card">
        <div class="dialog-emoji">{{ emoji }}</div>
        <h3>{{ title }}</h3>
        <p v-if="message">{{ message }}</p>
        <div class="dialog-actions">
          <button class="btn btn-ghost" @click="emit('cancel')">{{ cancelLabel }}</button>
          <button class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" @click="emit('confirm')">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 70;
  background: rgba(74, 59, 52, 0.4); backdrop-filter: blur(4px);
  display: grid; place-items: center; padding: 20px;
}
.dialog {
  width: 100%; max-width: 360px; padding: 26px 24px; text-align: center;
  box-shadow: var(--shadow-lg);
}
.dialog-emoji { font-size: 2.2rem; margin-bottom: 8px; }
.dialog h3 { font-size: 1.2rem; margin-bottom: 6px; }
.dialog p { color: var(--ink-soft); font-weight: 600; font-size: 0.9rem; margin-bottom: 20px; }
.dialog-actions { display: flex; gap: 10px; justify-content: center; }
.btn-danger { background: #c0563f; color: #fff; }
.btn-danger:hover { background: #a8492f; }
</style>
