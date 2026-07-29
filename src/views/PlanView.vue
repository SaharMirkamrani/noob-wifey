<script setup>
import { ref, computed, inject } from 'vue'
import {
  store, MEALS, slotInfo, isoDay, startOfWeek, addDays,
  setMeal, getRecipe, deleteRecipe, plannedRecipesForWeek
} from '../store.js'
import { toast } from '../toast.js'
import RecipeForm from '../components/RecipeForm.vue'
import Modal from '../components/Modal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const navigate = inject('navigate')

/* ---------- cookbook ---------- */
const search = ref('')
const editing = ref(null)
const showForm = ref(false)
const viewing = ref(null)
const pendingDelete = ref(null)

const slotGradient = (slot) => ({
  breakfast: 'linear-gradient(145deg, #ffe9cf, #f6c9a3)',
  main: 'linear-gradient(145deg, #f7dccf, #e0a487)',
  snack: 'linear-gradient(145deg, #fde7c0, #f0c069)'
}[slot] || 'linear-gradient(145deg, var(--cream-2), var(--terracotta-tint))')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.recipes
  return store.recipes.filter(
    (r) => r.name.toLowerCase().includes(q) || (r.tags || []).some((t) => t.toLowerCase().includes(q))
  )
})

function openNew() { editing.value = null; showForm.value = true }
function openEdit(r) { editing.value = r; viewing.value = null; showForm.value = true }
function onSaved() { showForm.value = false; toast('Recipe saved', { emoji: '🍳' }) }
function askDelete(r) { pendingDelete.value = r }
function doDelete() {
  const r = pendingDelete.value
  if (!r) return
  deleteRecipe(r.id)
  pendingDelete.value = null
  viewing.value = null
  toast(`Deleted “${r.name}”`, { kind: 'warn', emoji: '🗑️' })
}

/* ---------- schedule ---------- */
const weekOffset = ref(0)
const weekStart = computed(() => addDays(startOfWeek(), weekOffset.value * 7))
const days = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart.value, i)
    return {
      iso: isoDay(d),
      name: d.toLocaleDateString(undefined, { weekday: 'short' }),
      num: d.getDate(),
      isToday: isoDay(d) === isoDay(new Date())
    }
  })
)
const weekLabel = computed(() => {
  const end = addDays(weekStart.value, 6)
  const o = { month: 'short', day: 'numeric' }
  return `${weekStart.value.toLocaleDateString(undefined, o)} – ${end.toLocaleDateString(undefined, o)}`
})
const plannedCount = computed(() => plannedRecipesForWeek(weekStart.value).length)
const mealAt = (iso, mealKey) => {
  const id = store.plan[iso]?.[mealKey]
  return id ? getRecipe(id) : null
}

// tap-to-pick fallback (mobile / no-drag)
const picker = ref(null)
function openPicker(iso, mealKey) { picker.value = { iso, mealKey } }
function pick(recipeId) {
  setMeal(picker.value.iso, picker.value.mealKey, recipeId)
  const r = getRecipe(recipeId)
  if (r) toast(`Added ${r.name}`, { emoji: '🍽️' })
  picker.value = null
}
function clearSlot(iso, mealKey) {
  setMeal(iso, mealKey, null)
  toast('Removed from plan', { kind: 'warn', emoji: '✕' })
}

/* ---------- drag & drop ---------- */
const dragId = ref(null)
const dropKey = ref(null)
const dragging = computed(() => dragId.value !== null)
function onDragStart(e, recipeId) {
  dragId.value = recipeId
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('text/plain', recipeId)
}
function onDragEnd() { dragId.value = null; dropKey.value = null }
function onDragOver(e, iso, mealKey) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
  dropKey.value = `${iso}|${mealKey}`
}
function onDragLeave(iso, mealKey) {
  if (dropKey.value === `${iso}|${mealKey}`) dropKey.value = null
}
function onDrop(e, iso, mealKey, dayName) {
  e.preventDefault()
  const id = dragId.value || e.dataTransfer.getData('text/plain')
  dragId.value = null
  dropKey.value = null
  if (!id) return
  setMeal(iso, mealKey, id)
  const r = getRecipe(id)
  const meal = MEALS.find((m) => m.key === mealKey)
  if (r) toast(`${r.name} → ${dayName} ${meal.label.toLowerCase()}`, { emoji: '🗓️' })
}
const isHot = (iso, mealKey) => dropKey.value === `${iso}|${mealKey}`
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>Plan 🗓️</h1>
        <p class="sub">Drag a recipe from your cookbook onto any slot — or tap a slot. Ingredients flow to shopping. 🔁</p>
      </div>
    </header>

    <div class="plan-layout" :class="{ dragging }">
      <!-- LEFT: cookbook -->
      <section class="cookbook card">
        <div class="cb-head">
          <div class="searchbar">
            <span>🔍</span>
            <input class="bare" v-model="search" placeholder="Search recipes…" />
          </div>
          <button class="btn btn-primary cb-new" @click="openNew">＋</button>
        </div>

        <div v-if="filtered.length" class="recipe-rail">
          <article
            v-for="r in filtered"
            :key="r.id"
            class="mini-card"
            draggable="true"
            @dragstart="onDragStart($event, r.id)"
            @dragend="onDragEnd"
            @click="viewing = r"
          >
            <div
              class="mini-thumb"
              :style="r.image ? { backgroundImage: `url(${r.image})` } : { background: slotGradient(r.slot) }"
            >
              <span v-if="!r.image">{{ r.emoji }}</span>
            </div>
            <div class="mini-info">
              <div class="mini-name">{{ r.name }}</div>
              <div class="mini-chips">
                <span class="mchip" :class="{ snack: slotInfo(r.slot).meal === false }">
                  {{ slotInfo(r.slot).emoji }} {{ slotInfo(r.slot).label }}
                </span>
                <span v-if="r.mealPrep" class="mchip prep" title="Meal prep">🗓️</span>
                <span v-if="r.healthy" class="mchip healthy" title="Healthy">🥗</span>
              </div>
            </div>
            <span class="grip">⠿</span>
          </article>
        </div>

        <div v-else class="empty">
          <div class="big">🍅</div>
          <p>{{ search ? 'No matches.' : 'No recipes yet.' }}</p>
          <button v-if="!search" class="btn btn-primary" style="margin-top:10px" @click="openNew">＋ Add one</button>
        </div>
      </section>

      <!-- RIGHT: schedule -->
      <section class="schedule">
        <div class="weeknav card">
          <button class="arrow" @click="weekOffset--">‹</button>
          <div class="week-center">
            <div class="week-label">{{ weekLabel }}</div>
            <button v-if="weekOffset !== 0" class="today-btn" @click="weekOffset = 0">Back to this week</button>
            <div v-else class="planned-note">{{ plannedCount }} {{ plannedCount === 1 ? 'meal' : 'meals' }} planned</div>
          </div>
          <button class="arrow" @click="weekOffset++">›</button>
        </div>

        <div class="sched card">
          <div class="sched-grid">
            <div class="sg-corner"></div>
            <div v-for="meal in MEALS" :key="meal.key" class="sg-mealhead">{{ meal.emoji }} {{ meal.label }}</div>

            <template v-for="day in days" :key="day.iso">
              <div class="sg-dayhead" :class="{ today: day.isToday }">
                <span class="sg-dayname">{{ day.name }}</span>
                <span class="sg-daynum" :class="{ on: day.isToday }">{{ day.num }}</span>
              </div>
              <div
                v-for="meal in MEALS"
                :key="day.iso + meal.key"
                class="sg-cell"
                :class="{ 'drop-hot': isHot(day.iso, meal.key), droppable: dragging }"
                @dragover="onDragOver($event, day.iso, meal.key)"
                @dragleave="onDragLeave(day.iso, meal.key)"
                @drop="onDrop($event, day.iso, meal.key, day.name)"
              >
                <div v-if="mealAt(day.iso, meal.key)" class="filled" @click="openPicker(day.iso, meal.key)">
                  <span class="filled-emoji">{{ mealAt(day.iso, meal.key).emoji }}</span>
                  <span class="filled-name">{{ mealAt(day.iso, meal.key).name }}</span>
                  <button class="clear" @click.stop="clearSlot(day.iso, meal.key)">✕</button>
                </div>
                <button v-else class="add-slot" @click="openPicker(day.iso, meal.key)">＋</button>
              </div>
            </template>
          </div>
        </div>

        <div class="loop-hint card">
          <span class="loop-emoji">🛒</span>
          <div>
            <strong>The loop:</strong> everything you plan is already waiting on your
            <button class="link" @click="navigate('shopping')">shopping list</button>.
          </div>
        </div>
      </section>
    </div>

    <!-- tap-to-pick fallback -->
    <Modal v-if="picker" title="Pick a recipe" @close="picker = null">
      <div v-if="store.recipes.length" class="pick-grid">
        <button v-for="r in store.recipes" :key="r.id" class="pick-item" @click="pick(r.id)">
          <div class="pick-thumb" :style="r.image ? { backgroundImage: `url(${r.image})` } : { background: slotGradient(r.slot) }">
            <span v-if="!r.image">{{ r.emoji }}</span>
          </div>
          <span class="pick-name">{{ r.name }}</span>
        </button>
      </div>
      <div v-else class="empty">
        <div class="big">📖</div>
        <p>No recipes yet — add some first!</p>
        <button class="btn btn-primary" style="margin-top:12px" @click="picker = null; openNew()">Add a recipe</button>
      </div>
    </Modal>

    <!-- recipe detail -->
    <Modal v-if="viewing" :title="viewing.name" @close="viewing = null">
      <div class="detail">
        <div class="detail-hero" :style="viewing.image ? { backgroundImage: `url(${viewing.image})` } : { background: slotGradient(viewing.slot) }">
          <span v-if="!viewing.image">{{ viewing.emoji }}</span>
        </div>
        <div class="detail-meta">
          <span class="chip slot" :class="{ snack: slotInfo(viewing.slot).meal === false }">
            {{ slotInfo(viewing.slot).emoji }} {{ slotInfo(viewing.slot).label }}
          </span>
          <span v-if="viewing.mealPrep" class="chip prep">🗓️ Meal prep</span>
          <span v-if="viewing.healthy" class="chip healthy">🥗 Healthy</span>
          <span v-if="viewing.minutes" class="chip time">⏱️ {{ viewing.minutes }} min</span>
          <span class="chip time">🍽️ {{ viewing.servings }} servings</span>
          <a v-if="viewing.igLink" :href="viewing.igLink" target="_blank" rel="noopener" class="chip ig">📷 Instagram</a>
        </div>
        <h4>🧺 Ingredients</h4>
        <ul class="ing-list">
          <li v-for="ing in viewing.ingredients" :key="ing.id">
            <strong>{{ ing.name }}</strong>
            <span v-if="ing.qty" class="qty">{{ ing.qty }} {{ ing.unit }}</span>
          </li>
        </ul>
        <template v-if="viewing.steps && viewing.steps.length">
          <h4>👩‍🍳 Method</h4>
          <ol class="step-list">
            <li v-for="(s, i) in viewing.steps" :key="i">{{ s }}</li>
          </ol>
        </template>
        <div v-else-if="viewing.knowHow" class="know-note">🧠 You know this one by heart — no steps needed.</div>
      </div>
      <template #footer>
        <button class="btn btn-ghost danger" @click="askDelete(viewing)">Delete</button>
        <button class="btn btn-soft" @click="openEdit(viewing)">Edit</button>
      </template>
    </Modal>

    <ConfirmDialog
      v-if="pendingDelete"
      title="Delete this recipe?"
      :message="`“${pendingDelete.name}” will be removed from your cookbook.`"
      confirmLabel="Delete"
      emoji="🗑️"
      danger
      @confirm="doDelete"
      @cancel="pendingDelete = null"
    />

    <RecipeForm v-if="showForm" :recipe="editing" @close="showForm = false" @saved="onSaved" />
  </div>
</template>

<style scoped>
.page-head { margin-bottom: 16px; }
.page-head h1 { font-size: 1.5rem; }
.sub { color: var(--ink-soft); font-weight: 600; margin-top: 2px; }

.plan-layout { display: grid; grid-template-columns: 296px 1fr; gap: 16px; align-items: start; }

/* ---- cookbook ---- */
.cookbook { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.cb-head { display: flex; gap: 8px; }
.searchbar {
  flex: 1; display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border-radius: var(--radius-sm); background: var(--white); border: 1.5px solid var(--line);
}
.bare { flex: 1; min-width: 0; border: none; background: none; outline: none; font-size: 0.88rem; }
.cb-new { flex: 0 0 auto; }

.recipe-rail {
  display: flex; flex-direction: column; gap: 6px;
  overflow-y: auto; max-height: calc(100vh - 205px); padding-right: 2px;
}
.mini-card {
  display: flex; align-items: center; gap: 10px; padding: 7px 8px; border-radius: 12px;
  border: 1.5px solid var(--line); background: var(--card); cursor: grab; user-select: none;
  transition: transform 0.14s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.mini-card:hover { border-color: var(--terracotta-soft); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.mini-card:active { cursor: grabbing; transform: scale(0.99); }
.mini-thumb {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: grid; place-items: center; font-size: 1.2rem; background-size: cover; background-position: center;
}
.mini-info { flex: 1; min-width: 0; }
.mini-name { font-weight: 700; font-size: 0.82rem; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-chips { display: flex; gap: 4px; margin-top: 3px; align-items: center; }
.mchip { font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 999px; background: var(--cream-2); color: var(--ink-soft); }
.mchip.snack { background: var(--honey); color: #fff; }
.mchip.prep { background: #f6e7cf; color: #a9741f; }
.mchip.healthy { background: var(--sage-tint); color: #5f6e51; }
.grip { color: #cbb6a5; font-size: 0.85rem; flex-shrink: 0; }

/* ---- schedule ---- */
.weeknav { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; margin-bottom: 12px; }
.arrow {
  width: 34px; height: 34px; border-radius: 10px; font-size: 1.3rem; color: var(--terracotta);
  background: var(--terracotta-tint); display: grid; place-items: center; font-weight: 700;
}
.arrow:hover { background: #f0cdbe; }
.week-center { text-align: center; }
.week-label { font-family: var(--font-head); font-weight: 600; font-size: 1.05rem; }
.today-btn { color: var(--terracotta); font-weight: 700; font-size: 0.76rem; }
.planned-note { color: var(--sage); font-weight: 700; font-size: 0.76rem; }

.sched { padding: 12px; }
.sched-grid { display: grid; grid-template-columns: 48px repeat(3, 1fr); gap: 6px; }
.sg-mealhead {
  font-size: 0.66rem; font-weight: 800; color: var(--ink-soft); text-align: center;
  padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; align-self: end;
}
.sg-dayhead {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
  border-radius: 10px; padding: 4px 0;
}
.sg-dayhead.today { background: var(--terracotta-tint); }
.sg-dayname { font-weight: 800; font-size: 0.6rem; color: var(--ink-soft); text-transform: uppercase; }
.sg-daynum { font-family: var(--font-head); font-weight: 600; font-size: 0.92rem; }
.sg-daynum.on { background: var(--terracotta); color: #fff; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-size: 0.72rem; }

.sg-cell {
  min-height: 52px; display: flex; border-radius: 11px;
  background: var(--cream); transition: box-shadow 0.12s ease, background 0.12s ease;
}
.sg-cell.droppable { outline: 1.5px dashed var(--line); outline-offset: -1.5px; }
.sg-cell.drop-hot { background: var(--sage-tint); box-shadow: 0 0 0 2px var(--sage); outline: none; }
.add-slot {
  width: 100%; border-radius: 11px; border: none; background: transparent;
  color: #cbb6a5; font-size: 1.15rem; font-weight: 700; transition: all 0.15s ease;
}
.add-slot:hover { color: var(--terracotta); background: var(--terracotta-tint); }
.sg-cell.drop-hot .add-slot { color: var(--sage); }
.filled {
  position: relative; width: 100%; padding: 7px 6px; border-radius: 11px; cursor: pointer;
  background: var(--sage-tint); display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center;
}
.filled:hover { background: #dbe5d1; }
.filled-emoji { font-size: 1.05rem; }
.filled-name { font-size: 0.64rem; font-weight: 700; line-height: 1.12; }
.clear {
  position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%;
  background: var(--terracotta); color: #fff; font-size: 0.55rem; display: grid; place-items: center;
  opacity: 0; transition: opacity 0.15s ease;
}
.filled:hover .clear { opacity: 1; }

.loop-hint {
  margin-top: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;
  background: var(--sage-tint); border-color: #d6e0cb;
}
.loop-emoji { font-size: 1.4rem; }
.loop-hint strong { color: #5f6e51; }
.link { color: var(--terracotta); font-weight: 800; text-decoration: underline; }

/* ---- picker + detail (shared) ---- */
.pick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
.pick-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px;
  border-radius: 16px; border: 1px solid var(--line); background: var(--card); transition: all 0.15s ease;
}
.pick-item:hover { border-color: var(--terracotta-soft); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.pick-thumb {
  width: 64px; height: 64px; border-radius: 14px; font-size: 1.8rem; display: grid; place-items: center; background-size: cover; background-position: center;
}
.pick-name { font-weight: 700; font-size: 0.82rem; text-align: center; line-height: 1.2; }

.detail-hero {
  height: 130px; border-radius: 14px; margin-bottom: 12px;
  display: grid; place-items: center; font-size: 2.6rem; background-size: cover; background-position: center;
}
.detail-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.chip.time { background: var(--terracotta-tint); color: var(--terracotta); }
.chip.healthy { background: var(--sage); color: #fff; }
.chip.prep { background: #f6e7cf; color: #a9741f; }
.chip.slot { background: var(--cream-2); color: var(--ink); }
.chip.slot.snack { background: var(--honey); color: #fff; }
.chip.ig { background: #f3e3f0; color: #a4508a; text-decoration: none; }
.detail h4 { font-family: var(--font-head); margin: 18px 0 10px; font-size: 1.15rem; }
.ing-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
.ing-list li { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; border-radius: 10px; }
.ing-list li:nth-child(odd) { background: var(--cream-2); }
.ing-list .qty { color: var(--ink-soft); font-weight: 700; font-size: 0.88rem; }
.step-list { padding-left: 4px; list-style: none; counter-reset: s; display: flex; flex-direction: column; gap: 12px; }
.step-list li { position: relative; padding-left: 40px; counter-increment: s; }
.step-list li::before {
  content: counter(s); position: absolute; left: 0; top: -2px;
  width: 28px; height: 28px; border-radius: 50%; background: var(--sage-tint); color: #5f6e51;
  font-weight: 800; display: grid; place-items: center; font-size: 0.85rem;
}
.know-note {
  margin-top: 8px; padding: 12px 14px; border-radius: var(--radius-sm);
  background: #e7e6f2; color: #55508a; font-weight: 700; font-size: 0.9rem;
}
.danger { color: #c0563f; }
.danger:hover { background: var(--terracotta-tint); }

@media (max-width: 860px) {
  .plan-layout { grid-template-columns: 1fr; }
  .recipe-rail { flex-direction: row; overflow-x: auto; overflow-y: hidden; max-height: none; padding-bottom: 6px; }
  .mini-card { flex: 0 0 auto; width: 190px; }
  .grip { display: none; }
}
</style>
