<script setup>
defineProps({ title: String })
const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="pop" appear>
    <div class="overlay" @click.self="emit('close')">
      <div class="sheet card">
        <header class="sheet-head">
          <h2>{{ title }}</h2>
          <button class="x" @click="emit('close')" aria-label="Close">✕</button>
        </header>
        <div class="sheet-body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="sheet-foot">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 60;
  background: rgba(74, 59, 52, 0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0;
}
.sheet {
  width: 100%; max-width: 620px; max-height: 92vh;
  border-radius: 26px 26px 0 0; display: flex; flex-direction: column;
  box-shadow: var(--shadow-lg); overflow: hidden;
}
.sheet-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 14px; border-bottom: 1px solid var(--line);
}
.sheet-head h2 { font-size: 1.3rem; }
.x {
  width: 34px; height: 34px; border-radius: 50%; background: var(--cream-2);
  color: var(--ink-soft); font-weight: 700; display: grid; place-items: center;
}
.x:hover { background: var(--terracotta-tint); color: var(--terracotta); }
.sheet-body { padding: 20px 22px; overflow-y: auto; }
.sheet-foot {
  padding: 14px 22px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line); display: flex; gap: 10px; justify-content: flex-end;
  background: var(--card);
}

@media (min-width: 640px) {
  .overlay { align-items: center; padding: 24px; }
  .sheet { border-radius: 26px; }
}
</style>
