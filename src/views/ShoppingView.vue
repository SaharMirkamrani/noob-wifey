<script setup>
import { ref, computed, inject } from 'vue'
import {
  store, CATEGORIES, catInfo, MEALS,
  startOfWeek, addDays, buildShoppingList,
  toggleChecked, isChecked, addExtra, removeExtra, addPantry,
  PRIORITY_META, priorityRank, SUGGESTED_ITEMS, suggestedCategoryFor, inPantry
} from '../store.js'

const prio = (p) => PRIORITY_META[p] || PRIORITY_META.medium

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
  // extras (user-added, no planned day → medium priority)
  for (const e of store.boughtExtras) {
    ;(groups[e.category] ||= []).push({ name: e.name, category: e.category, qty: '', recipes: [], have: false, checked: e.checked, extra: true, id: e.id, priority: 'medium', neededLabel: '' })
  }
  // within each aisle: unbought first, then most-urgent, then soonest-needed
  const sortItems = (a, b) =>
    Number(a.checked) - Number(b.checked) ||
    priorityRank(a.priority) - priorityRank(b.priority) ||
    (a.neededIso || '').localeCompare(b.neededIso || '')
  return CATEGORIES
    .filter((c) => groups[c.key]?.length)
    .map((c) => ({ ...c, items: groups[c.key].sort(sortItems) }))
})

const urgentCount = computed(() =>
  fromRecipes.value.filter((i) => !i.have && !i.checked && i.priority === 'high').length
)

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

// add extra — with suggestions + auto category
const newExtra = ref('')
const newExtraCat = ref('other')
function addItem(name, category) {
  addExtra(name, category || suggestedCategoryFor(name) || newExtraCat.value)
}
function submitExtra() {
  if (!newExtra.value.trim()) return
  addItem(newExtra.value)
  newExtra.value = ''
}

// names already on the list or in the pantry (so we don't suggest them again)
const onList = computed(() => {
  const s = new Set(store.boughtExtras.map((e) => e.name.toLowerCase()))
  for (const i of fromRecipes.value) s.add(i.name.toLowerCase())
  return s
})
const quickAdd = computed(() =>
  SUGGESTED_ITEMS.filter((i) => !onList.value.has(i.name.toLowerCase()) && !inPantry(i.name)).slice(0, 10)
)

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
        <p class="sub">
          Sorted by what you need soonest.
          <span v-if="urgentCount" class="urgent-note">🔴 {{ urgentCount }} to grab now</span>
          <span v-else>Pantry staples are hidden. 🔁</span>
        </p>
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
      <input
        class="bare"
        v-model="newExtra"
        list="grocery-suggestions"
        placeholder="Add something (start typing — e.g. milk, rice…)"
        @keyup.enter="submitExtra"
      />
      <datalist id="grocery-suggestions">
        <option v-for="i in SUGGESTED_ITEMS" :key="i.name" :value="i.name" />
      </datalist>
      <select class="select cat-select" v-model="newExtraCat">
        <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.emoji }} {{ c.label }}</option>
      </select>
      <button class="btn btn-primary" @click="submitExtra">Add</button>
    </div>

    <!-- quick-add suggestions (common items you don't already have) -->
    <div v-if="quickAdd.length" class="quick-add">
      <span class="qa-label">Quick add:</span>
      <button v-for="i in quickAdd" :key="i.name" class="qa-chip" @click="addItem(i.name, i.category)">
        ＋ {{ i.name }}
      </button>
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
              <span
                v-if="!item.checked"
                class="prio-pill"
                :style="{ color: prio(item.priority).color, background: prio(item.priority).tint }"
                :title="`${prio(item.priority).label} priority`"
              >{{ prio(item.priority).emoji }} {{ item.neededLabel || prio(item.priority).label }}</span>
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

.add-extra { display: flex; gap: 8px; padding: 8px 10px; margin-bottom: 12px; align-items: center; }
.quick-add { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 18px; }
.qa-label { font-size: 0.78rem; font-weight: 800; color: var(--ink-soft); margin-right: 2px; }
.qa-chip {
  font-size: 0.78rem; font-weight: 700; padding: 5px 11px; border-radius: 999px;
  background: var(--cream-2); color: var(--ink); border: 1px solid var(--line); transition: all 0.15s ease;
}
.qa-chip:hover { background: var(--terracotta-tint); color: var(--terracotta); border-color: var(--terracotta-soft); }
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
.prio-pill { font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; white-space: nowrap; text-transform: capitalize; }
.item-for { color: var(--sage); font-size: 0.75rem; font-weight: 700; width: 100%; }
.urgent-note { color: #c0563f; font-weight: 800; }
.extra-tag { color: var(--honey); }
.row-x { width: 30px; height: 30px; border-radius: 8px; font-size: 0.85rem; color: var(--ink-soft); display: grid; place-items: center; flex-shrink: 0; }
.row-x:hover { background: var(--terracotta-tint); }
.row-x.have:hover { background: var(--sage-tint); }

.owned { margin-top: 16px; padding: 12px 18px; }
.owned summary { cursor: pointer; font-weight: 700; color: var(--ink-soft); font-size: 0.9rem; }
.owned-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }

@media (max-width: 560px) {
  .add-extra { flex-wrap: wrap; }
  .add-extra .bare { flex: 1 1 100%; min-width: 0; padding: 6px; } /* input on its own row */
  .cat-select { flex: 1; }
}
</style>
