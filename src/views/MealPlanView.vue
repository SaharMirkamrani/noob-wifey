<script setup>
import { ref, computed, inject } from 'vue'
import { store, MEALS, isoDay, startOfWeek, addDays, setMeal, getRecipe, plannedRecipesForWeek } from '../store.js'
import Modal from '../components/Modal.vue'

const navigate = inject('navigate')
const weekOffset = ref(0)

const weekStart = computed(() => addDays(startOfWeek(), weekOffset.value * 7))
const days = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart.value, i)
    return {
      date: d,
      iso: isoDay(d),
      name: d.toLocaleDateString(undefined, { weekday: 'short' }),
      num: d.getDate(),
      isToday: isoDay(d) === isoDay(new Date())
    }
  })
)
const weekLabel = computed(() => {
  const end = addDays(weekStart.value, 6)
  const opts = { month: 'short', day: 'numeric' }
  return `${weekStart.value.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
})

const plannedCount = computed(() => plannedRecipesForWeek(weekStart.value).length)

// picker
const picker = ref(null) // { iso, mealKey }
function openPicker(iso, mealKey) {
  picker.value = { iso, mealKey }
}
function pick(recipeId) {
  setMeal(picker.value.iso, picker.value.mealKey, recipeId)
  picker.value = null
}
function clearSlot(iso, mealKey) {
  setMeal(iso, mealKey, null)
}
const mealAt = (iso, mealKey) => {
  const id = store.plan[iso]?.[mealKey]
  return id ? getRecipe(id) : null
}
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>Meal plan 🗓️</h1>
        <p class="sub">Tap a slot to drop in a recipe. Ingredients flow to shopping. 🔁</p>
      </div>
    </header>

    <div class="weeknav card">
      <button class="arrow" @click="weekOffset--">‹</button>
      <div class="week-center">
        <div class="week-label">{{ weekLabel }}</div>
        <button v-if="weekOffset !== 0" class="today-btn" @click="weekOffset = 0">Back to this week</button>
        <div v-else class="planned-note">{{ plannedCount }} {{ plannedCount === 1 ? 'meal' : 'meals' }} planned this week</div>
      </div>
      <button class="arrow" @click="weekOffset++">›</button>
    </div>

    <div class="planner">
      <div v-for="day in days" :key="day.iso" class="day-col card" :class="{ today: day.isToday }">
        <div class="day-head">
          <span class="day-name">{{ day.name }}</span>
          <span class="day-num" :class="{ on: day.isToday }">{{ day.num }}</span>
        </div>
        <div class="slots">
          <div v-for="meal in MEALS" :key="meal.key" class="slot">
            <div class="slot-label">{{ meal.emoji }} {{ meal.label }}</div>
            <div v-if="mealAt(day.iso, meal.key)" class="filled" @click="openPicker(day.iso, meal.key)">
              <span class="filled-emoji">{{ mealAt(day.iso, meal.key).emoji }}</span>
              <span class="filled-name">{{ mealAt(day.iso, meal.key).name }}</span>
              <button class="clear" @click.stop="clearSlot(day.iso, meal.key)">✕</button>
            </div>
            <button v-else class="add-slot" @click="openPicker(day.iso, meal.key)">＋</button>
          </div>
        </div>
      </div>
    </div>

    <div class="loop-hint card">
      <span class="loop-emoji">🛒</span>
      <div>
        <strong>The loop:</strong> everything you plan this week is already waiting on your
        <button class="link" @click="navigate('shopping')">shopping list</button>.
      </div>
    </div>

    <!-- recipe picker -->
    <Modal v-if="picker" title="Pick a recipe" @close="picker = null">
      <div v-if="store.recipes.length" class="pick-grid">
        <button v-for="r in store.recipes" :key="r.id" class="pick-item" @click="pick(r.id)">
          <div class="pick-thumb" :style="r.image ? { backgroundImage: `url(${r.image})` } : {}">
            <span v-if="!r.image">{{ r.emoji }}</span>
          </div>
          <span class="pick-name">{{ r.name }}</span>
          <span class="pick-ing">🧺 {{ r.ingredients.length }}</span>
        </button>
      </div>
      <div v-else class="empty">
        <div class="big">📖</div>
        <p>No recipes yet — add some first!</p>
        <button class="btn btn-primary" style="margin-top:12px" @click="picker = null; navigate('recipes')">Go to recipes</button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: 18px; }
.page-head h1 { font-size: 1.5rem; }
.sub { color: var(--ink-soft); font-weight: 600; margin-top: 2px; }

.weeknav { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; margin-bottom: 18px; }
.arrow {
  width: 40px; height: 40px; border-radius: 12px; font-size: 1.5rem; color: var(--terracotta);
  background: var(--terracotta-tint); display: grid; place-items: center; font-weight: 700;
}
.arrow:hover { background: #f0cdbe; }
.week-center { text-align: center; }
.week-label { font-family: var(--font-head); font-weight: 600; font-size: 1.15rem; }
.today-btn { color: var(--terracotta); font-weight: 700; font-size: 0.8rem; }
.planned-note { color: var(--sage); font-weight: 700; font-size: 0.8rem; }

.planner { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
.day-col { padding: 10px 8px; display: flex; flex-direction: column; }
.day-col.today { border-color: var(--terracotta-soft); box-shadow: 0 0 0 2px rgba(224,138,107,0.25); }
.day-head { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 10px; }
.day-name { font-weight: 800; font-size: 0.8rem; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; }
.day-num { font-family: var(--font-head); font-weight: 600; font-size: 1.05rem; }
.day-num.on { background: var(--terracotta); color: #fff; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 0.85rem; }

.slots { display: flex; flex-direction: column; gap: 8px; }
.slot-label { font-size: 0.68rem; font-weight: 800; color: var(--ink-soft); margin-bottom: 3px; }
.add-slot {
  width: 100%; padding: 12px 0; border-radius: 12px; border: 1.5px dashed var(--line);
  color: var(--ink-soft); font-size: 1.1rem; font-weight: 700; transition: all 0.15s ease;
}
.add-slot:hover { border-color: var(--terracotta-soft); color: var(--terracotta); background: var(--terracotta-tint); }
.filled {
  position: relative; padding: 9px 8px; border-radius: 12px; cursor: pointer;
  background: var(--sage-tint); display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center;
}
.filled:hover { background: #dbe5d1; }
.filled-emoji { font-size: 1.2rem; }
.filled-name { font-size: 0.72rem; font-weight: 700; line-height: 1.15; }
.clear {
  position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%;
  background: var(--terracotta); color: #fff; font-size: 0.6rem; display: grid; place-items: center;
  opacity: 0; transition: opacity 0.15s ease;
}
.filled:hover .clear { opacity: 1; }

.loop-hint {
  margin-top: 18px; padding: 16px 18px; display: flex; align-items: center; gap: 14px;
  background: var(--sage-tint); border-color: #d6e0cb;
}
.loop-emoji { font-size: 1.6rem; }
.loop-hint strong { color: #5f6e51; }
.link { color: var(--terracotta); font-weight: 800; text-decoration: underline; }

.pick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.pick-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px;
  border-radius: 16px; border: 1px solid var(--line); background: var(--card); transition: all 0.15s ease;
}
.pick-item:hover { border-color: var(--terracotta-soft); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.pick-thumb {
  width: 72px; height: 72px; border-radius: 14px; font-size: 2rem; display: grid; place-items: center;
  background: linear-gradient(145deg, var(--cream-2), var(--terracotta-tint)) center/cover;
}
.pick-name { font-weight: 700; font-size: 0.85rem; text-align: center; line-height: 1.2; }
.pick-ing { font-size: 0.72rem; color: var(--ink-soft); font-weight: 700; }

@media (max-width: 820px) {
  .planner { grid-template-columns: 1fr; }
  .day-col { flex-direction: column; }
  .day-head { padding-bottom: 6px; }
  .slots { flex-direction: row; gap: 8px; }
  .slot { flex: 1; }
}
</style>
