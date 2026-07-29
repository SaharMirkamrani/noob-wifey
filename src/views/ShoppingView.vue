<script setup>
import { ref, computed, inject } from 'vue'
import {
  store, CATEGORIES, catInfo, MEALS,
  startOfWeek, addDays, buildShoppingList,
  toggleChecked, isChecked, addExtra, removeExtra, addPantry
} from '../store.js'

const navigate = inject('navigate')
const weekOffset = ref(0)
const weekStart = computed(() => addDays(startOfWeek(), weekOffset.value * 7))
const weekLabel = computed(() => {
  const end = addDays(weekStart.value, 6)
  const o = { month: 'short', day: 'numeric' }
  return `${weekStart.value.toLocaleDateString(undefined, o)} – ${end.toLocaleDateString(undefined, o)}`
})

const fromRecipes = computed(() => buildShoppingList(weekStart.value))

// group by category, needed (not owned) first
const grouped = computed(() => {
  const groups = {}
  for (const item of fromRecipes.value) {
    if (item.have) continue // pantry-aware: hide what you already own
    ;(groups[item.category] ||= []).push(item)
  }
  // extras
  for (const e of store.boughtExtras) {
    ;(groups[e.category] ||= []).push({ name: e.name, category: e.category, qty: '', recipes: [], have: false, checked: e.checked, extra: true, id: e.id })
  }
  return CATEGORIES
    .filter((c) => groups[c.key]?.length)
    .map((c) => ({ ...c, items: groups[c.key].sort((a, b) => Number(a.checked) - Number(b.checked)) }))
})

const ownedHidden = computed(() => fromRecipes.value.filter((i) => i.have))

const totalToBuy = computed(() =>
  grouped.value.reduce((n, g) => n + g.items.filter((i) => !i.checked).length, 0)
)
const totalItems = computed(() => grouped.value.reduce((n, g) => n + g.items.length, 0))
const progress = computed(() => (totalItems.value ? Math.round(((totalItems.value - totalToBuy.value) / totalItems.value) * 100) : 0))

function tick(item) {
  if (item.extra) {
    const e = store.boughtExtras.find((x) => x.id === item.id)
    if (e) e.checked = !e.checked
  } else {
    toggleChecked(item.name)
  }
}

// add extra
const newExtra = ref('')
const newExtraCat = ref('other')
function submitExtra() {
  if (!newExtra.value.trim()) return
  addExtra(newExtra.value, newExtraCat.value)
  newExtra.value = ''
}

// "I already have this" -> move to pantry
function moveToPantry(item) {
  addPantry(item.name, item.category)
}
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>Shopping 🛒</h1>
        <p class="sub">Auto-built from your planned meals. Pantry staples are hidden. 🔁</p>
      </div>
    </header>

    <div class="weeknav card">
      <button class="arrow" @click="weekOffset--">‹</button>
      <div class="week-label">{{ weekLabel }}</div>
      <button class="arrow" @click="weekOffset++">›</button>
    </div>

    <div v-if="totalItems" class="progress-card card">
      <div class="progress-top">
        <div>
          <div class="p-count">{{ totalToBuy }} <span>left to buy</span></div>
          <div class="p-sub">{{ totalItems - totalToBuy }} of {{ totalItems }} in the cart</div>
        </div>
        <div class="p-ring" :style="{ '--p': progress }">
          <span>{{ progress }}%</span>
        </div>
      </div>
      <div class="bar"><div class="bar-fill" :style="{ width: progress + '%' }"></div></div>
    </div>

    <!-- add extra -->
    <div class="add-extra card">
      <input class="bare" v-model="newExtra" placeholder="Add something extra (milk, snacks…)" @keyup.enter="submitExtra" />
      <select class="select cat-select" v-model="newExtraCat">
        <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.emoji }} {{ c.label }}</option>
      </select>
      <button class="btn btn-primary" @click="submitExtra">Add</button>
    </div>

    <div v-if="grouped.length" class="aisles">
      <section v-for="g in grouped" :key="g.key" class="aisle card">
        <div class="aisle-head">
          <span class="aisle-emoji">{{ g.emoji }}</span>
          <h3>{{ g.label }}</h3>
          <span class="aisle-count">{{ g.items.filter((i) => !i.checked).length }}</span>
        </div>
        <TransitionGroup name="pop" tag="ul" class="items">
          <li v-for="item in g.items" :key="item.name + (item.extra ? '-x' : '')" class="item" :class="{ done: item.checked }">
            <button class="check" :class="{ on: item.checked }" @click="tick(item)">
              <span v-if="item.checked">✓</span>
            </button>
            <div class="item-main" @click="tick(item)">
              <span class="item-name">{{ item.name }}</span>
              <span v-if="item.qty" class="item-qty">{{ item.qty }}</span>
              <span v-if="item.recipes?.length" class="item-for">for {{ item.recipes.join(', ') }}</span>
              <span v-if="item.extra" class="item-for extra-tag">added by you</span>
            </div>
            <button v-if="item.extra" class="row-x" @click="removeExtra(item.id)" title="Remove">✕</button>
            <button v-else class="row-x have" @click="moveToPantry(item)" title="I already have this">🫙</button>
          </li>
        </TransitionGroup>
      </section>
    </div>

    <div v-else class="empty card">
      <div class="big">🧺</div>
      <h3>Your list is empty</h3>
      <p>Plan some meals and their ingredients will land here.</p>
      <button class="btn btn-primary" style="margin-top:14px" @click="navigate('plan')">Go to meal plan</button>
    </div>

    <!-- owned staples note -->
    <div v-if="ownedHidden.length" class="owned card">
      <details>
        <summary>🫙 {{ ownedHidden.length }} ingredient{{ ownedHidden.length > 1 ? 's' : '' }} hidden — already in your pantry</summary>
        <div class="owned-list">
          <span v-for="i in ownedHidden" :key="i.name" class="chip">{{ i.name }}</span>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: 18px; }
.page-head h1 { font-size: 1.5rem; }
.sub { color: var(--ink-soft); font-weight: 600; margin-top: 2px; }

.weeknav { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; margin-bottom: 16px; }
.arrow { width: 38px; height: 38px; border-radius: 12px; font-size: 1.4rem; color: var(--terracotta); background: var(--terracotta-tint); display: grid; place-items: center; font-weight: 700; }
.arrow:hover { background: #f0cdbe; }
.week-label { font-family: var(--font-head); font-weight: 600; font-size: 1.1rem; }

.progress-card { padding: 18px 20px; margin-bottom: 16px; }
.progress-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.p-count { font-family: var(--font-head); font-size: 1.8rem; font-weight: 600; }
.p-count span { font-size: 0.9rem; color: var(--ink-soft); font-family: var(--font-body); font-weight: 700; }
.p-sub { color: var(--ink-soft); font-weight: 600; font-size: 0.85rem; }
.p-ring {
  width: 64px; height: 64px; border-radius: 50%;
  background: conic-gradient(var(--sage) calc(var(--p) * 1%), var(--sage-tint) 0);
  display: grid; place-items: center;
}
.p-ring span { background: var(--card); width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 0.85rem; color: #5f6e51; }
.bar { height: 8px; border-radius: 999px; background: var(--cream-2); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--sage), #a3b393); transition: width 0.4s ease; }

.add-extra { display: flex; gap: 8px; padding: 8px 10px; margin-bottom: 18px; align-items: center; }
.bare { flex: 1; border: none; background: none; outline: none; font-size: 0.95rem; padding-left: 6px; }
.cat-select { width: auto; padding: 8px 10px; font-size: 0.85rem; }

.aisles { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; align-items: start; }
.aisle { padding: 14px 16px 8px; }
.aisle-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.aisle-emoji { font-size: 1.3rem; }
.aisle-head h3 { font-size: 1.1rem; flex: 1; }
.aisle-count { background: var(--terracotta-tint); color: var(--terracotta); font-weight: 800; font-size: 0.8rem; padding: 3px 10px; border-radius: 999px; }
.items { list-style: none; display: flex; flex-direction: column; }
.item { display: flex; align-items: center; gap: 12px; padding: 10px 6px; border-radius: 12px; transition: background 0.15s ease; }
.item:hover { background: var(--cream-2); }
.item.done { opacity: 0.55; }
.item.done .item-name { text-decoration: line-through; }
.check {
  width: 26px; height: 26px; border-radius: 8px; border: 2px solid var(--line); flex-shrink: 0;
  display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 0.85rem; transition: all 0.15s ease;
}
.check.on { background: var(--sage); border-color: var(--sage); }
.item-main { flex: 1; display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; cursor: pointer; min-width: 0; }
.item-name { font-weight: 700; }
.item-qty { color: var(--ink-soft); font-weight: 700; font-size: 0.85rem; }
.item-for { color: var(--sage); font-size: 0.75rem; font-weight: 700; width: 100%; }
.extra-tag { color: var(--honey); }
.row-x { width: 30px; height: 30px; border-radius: 8px; font-size: 0.85rem; color: var(--ink-soft); display: grid; place-items: center; flex-shrink: 0; }
.row-x:hover { background: var(--terracotta-tint); }
.row-x.have:hover { background: var(--sage-tint); }

.owned { margin-top: 16px; padding: 12px 18px; }
.owned summary { cursor: pointer; font-weight: 700; color: var(--ink-soft); font-size: 0.9rem; }
.owned-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }

@media (max-width: 560px) {
  .page-head h1 { font-size: 1.6rem; }
  .add-extra { flex-wrap: wrap; }
  .cat-select { flex: 1; }
}
</style>
