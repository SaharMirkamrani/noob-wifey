import { reactive } from 'vue'

let seq = 0
export const toasts = reactive([])

// show a little toast. kind: 'success' | 'info' | 'warn'
export function toast(message, { kind = 'success', emoji, timeout = 2600 } = {}) {
  const id = ++seq
  toasts.push({ id, message, kind, emoji })
  if (timeout) setTimeout(() => dismissToast(id), timeout)
  return id
}

export function dismissToast(id) {
  const i = toasts.findIndex((t) => t.id === id)
  if (i !== -1) toasts.splice(i, 1)
}
