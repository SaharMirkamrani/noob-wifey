<script setup>
import { ref, computed } from 'vue'
import { store, CATEGORIES, catInfo, addPantry, removePantry } from '../store.js'

const name = ref('')
const cat = ref('pantry')

function submit() {
  if (!name.value.trim()) return
  addPantry(name.value, cat.value)
  name.value = ''
}

const grouped = computed(() =>
  CATEGORIES
    .map((c) => ({ ...c, items: store.pantry.filter((p) => p.category === c.key) }))
    .filter((c) => c.items.length)
)
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>My pantry 🫙</h1>
        <p class="sub">Staples you keep on hand. These get hidden from your shopping list.</p>
      </div>
    </header>

    <div class="add card">
      <input class="bare" v-model="name" placeholder="Add a staple (olive oil, salt, rice…)" @keyup.enter="submit" />
      <select class="select cat-select" v-model="cat">
        <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.emoji }} {{ c.label }}</option>
      </select>
      <button class="btn btn-sage" @click="submit">Add</button>
    </div>

    <div v-if="grouped.length" class="cats">
      <section v-for="g in grouped" :key="g.key" class="cat-card card">
        <div class="cat-head"><span>{{ g.emoji }}</span><h3>{{ g.label }}</h3></div>
        <div class="pills">
          <TransitionGroup name="pop">
            <div v-for="p in g.items" :key="p.id" class="pill">
              {{ p.name }}
              <button class="pill-x" @click="removePantry(p.id)">✕</button>
            </div>
          </TransitionGroup>
        </div>
      </section>
    </div>

    <div v-else class="empty card">
      <div class="big">🫙</div>
      <h3>Pantry's empty</h3>
      <p>Add the things you always have, so the shopping list only shows what you actually need.</p>
    </div>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: 18px; }
.page-head h1 { font-size: 1.5rem; }
.sub { color: var(--ink-soft); font-weight: 600; margin-top: 2px; }

.add { display: flex; gap: 8px; padding: 8px 10px; margin-bottom: 20px; align-items: center; }
.bare { flex: 1; border: none; background: none; outline: none; font-size: 0.95rem; padding-left: 6px; }
.cat-select { width: auto; padding: 8px 10px; font-size: 0.85rem; }

.cats { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; align-items: start; }
.cat-card { padding: 16px 18px; }
.cat-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.cat-head h3 { font-size: 1.1rem; }
.pills { display: flex; flex-wrap: wrap; gap: 8px; }
.pill {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 8px 8px 14px;
  border-radius: 999px; background: var(--sage-tint); color: #5f6e51; font-weight: 700; font-size: 0.9rem;
}
.pill-x {
  width: 20px; height: 20px; border-radius: 50%; background: rgba(95,110,81,0.15); color: #5f6e51;
  font-size: 0.65rem; display: grid; place-items: center;
}
.pill-x:hover { background: var(--terracotta); color: #fff; }

@media (max-width: 560px) {
  .page-head h1 { font-size: 1.6rem; }
  .add { flex-wrap: wrap; }
  .cat-select { flex: 1; }
}
</style>
