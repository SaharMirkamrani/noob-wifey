<script setup>
import { computed, inject } from 'vue'
import { store, MEALS, isoDay, startOfWeek, addDays, getRecipe, buildShoppingList, inPantry } from '../store.js'

const navigate = inject('navigate')
const openSettings = inject('openSettings')
const today = new Date()
const hour = today.getHours()
const greeting = computed(() => {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
const dateLine = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

const weekStart = startOfWeek()
const todayIso = isoDay(today)

const todayMeals = computed(() =>
  MEALS.map((m) => ({ ...m, recipe: store.plan[todayIso]?.[m.key] ? getRecipe(store.plan[todayIso][m.key]) : null }))
)

// find next planned meal from now onward this week
const upNext = computed(() => {
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i)
    if (isoDay(d) < todayIso) continue
    for (const m of MEALS) {
      const id = store.plan[isoDay(d)]?.[m.key]
      if (id) {
        const r = getRecipe(id)
        if (r) return { recipe: r, meal: m, isToday: isoDay(d) === todayIso, dayName: d.toLocaleDateString(undefined, { weekday: 'long' }) }
      }
    }
  }
  return null
})

const shopping = computed(() => buildShoppingList(weekStart))
const toBuy = computed(() => shopping.value.filter((i) => !i.have && !i.checked))
const plannedThisWeek = computed(() => {
  let n = 0
  for (let i = 0; i < 7; i++) {
    const day = store.plan[isoDay(addDays(weekStart, i))]
    if (day) n += Object.values(day).filter(Boolean).length
  }
  return n
})

const stats = computed(() => [
  { emoji: '📖', label: 'Recipes', value: store.recipes.length, to: 'plan' },
  { emoji: '🍽️', label: 'Meals planned', value: plannedThisWeek.value, to: 'plan' },
  { emoji: '🛒', label: 'Left to buy', value: toBuy.value.length, to: 'shopping' },
  { emoji: '🫙', label: 'Pantry items', value: store.pantry.length, to: 'pantry' }
])
</script>

<template>
  <div>
    <header class="hero card">
      <div class="hero-text">
        <p class="hi">{{ greeting }}, love 🤍</p>
        <h1>What are we cooking today?</h1>
        <p class="date">{{ dateLine }}</p>
      </div>
      <div class="hero-emoji">🍳</div>
    </header>

    <!-- up next -->
    <div v-if="upNext" class="upnext card" @click="navigate('plan')">
      <div class="un-badge">{{ upNext.isToday ? 'Up next today' : `Next: ${upNext.dayName}` }}</div>
      <div class="un-body">
        <div class="un-emoji" :style="upNext.recipe.image ? { backgroundImage: `url(${upNext.recipe.image})` } : {}">
          <span v-if="!upNext.recipe.image">{{ upNext.recipe.emoji }}</span>
        </div>
        <div>
          <div class="un-meal">{{ upNext.meal.emoji }} {{ upNext.meal.label }}</div>
          <div class="un-name">{{ upNext.recipe.name }}</div>
          <div class="un-meta">⏱️ {{ upNext.recipe.minutes }}m · 🧺 {{ upNext.recipe.ingredients.length }} ingredients</div>
        </div>
      </div>
    </div>

    <div class="cols">
      <!-- today's plate -->
      <section class="card panel">
        <div class="panel-head">
          <h2>Today's plate</h2>
          <button class="link" @click="navigate('plan')">Plan →</button>
        </div>
        <div class="today-meals">
          <div v-for="m in todayMeals" :key="m.key" class="tm-row" @click="navigate('plan')">
            <span class="tm-meal">{{ m.emoji }} {{ m.label }}</span>
            <span v-if="m.recipe" class="tm-recipe">{{ m.recipe.emoji }} {{ m.recipe.name }}</span>
            <span v-else class="tm-empty">— tap to plan</span>
          </div>
        </div>
      </section>

      <!-- shopping snapshot -->
      <section class="card panel">
        <div class="panel-head">
          <h2>To buy</h2>
          <button class="link" @click="navigate('shopping')">List →</button>
        </div>
        <div v-if="toBuy.length" class="buy-preview">
          <div v-for="i in toBuy.slice(0, 6)" :key="i.name" class="buy-chip">
            {{ i.name }}<small v-if="i.qty"> · {{ i.qty }}</small>
          </div>
          <div v-if="toBuy.length > 6" class="buy-more">+{{ toBuy.length - 6 }} more</div>
        </div>
        <div v-else class="all-good">
          <span>✨</span> All shopped — you're ready to cook!
        </div>
      </section>
    </div>

    <!-- stats -->
    <div class="stats">
      <button v-for="s in stats" :key="s.label" class="stat card" @click="navigate(s.to)">
        <span class="stat-emoji">{{ s.emoji }}</span>
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </button>
    </div>

    <!-- quick actions -->
    <div class="quick">
      <button class="btn btn-primary" @click="navigate('plan')">＋ Add a recipe</button>
      <button class="btn btn-soft" @click="navigate('plan')">🗓️ Plan the week</button>
      <button class="btn btn-ghost backup-btn" @click="openSettings()">⚙️ Backup &amp; restore</button>
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 18px 22px; margin-bottom: 14px; overflow: hidden;
  background: linear-gradient(135deg, var(--card), var(--terracotta-tint));
}
.hi { color: var(--terracotta); font-weight: 800; margin-bottom: 3px; font-size: 0.9rem; }
.hero-text h1 { font-size: 1.45rem; line-height: 1.1; }
.date { color: var(--ink-soft); font-weight: 600; margin-top: 4px; font-size: 0.85rem; }
.hero-emoji { font-size: 2.5rem; opacity: 0.9; }

.upnext { padding: 14px 16px; margin-bottom: 14px; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.2s ease; }
.upnext:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.un-badge { display: inline-block; background: var(--sage); color: #fff; font-weight: 800; font-size: 0.66rem; padding: 3px 10px; border-radius: 999px; margin-bottom: 9px; }
.un-body { display: flex; align-items: center; gap: 12px; }
.un-emoji {
  width: 52px; height: 52px; border-radius: 12px; font-size: 1.7rem; display: grid; place-items: center; flex-shrink: 0;
  background: linear-gradient(145deg, var(--cream-2), var(--terracotta-tint)) center/cover;
}
.un-meal { font-weight: 800; color: var(--ink-soft); font-size: 0.72rem; }
.un-name { font-family: var(--font-head); font-weight: 600; font-size: 1.1rem; margin: 1px 0; }
.un-meta { color: var(--ink-soft); font-weight: 600; font-size: 0.76rem; }

.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.panel { padding: 14px 16px; }
.panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.panel-head h2 { font-size: 1.05rem; }
.link { color: var(--terracotta); font-weight: 800; font-size: 0.8rem; }

.today-meals { display: flex; flex-direction: column; gap: 4px; }
.tm-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; border-radius: 9px; cursor: pointer; transition: background 0.15s ease; }
.tm-row:hover { background: var(--cream-2); }
.tm-meal { font-weight: 700; color: var(--ink-soft); font-size: 0.82rem; }
.tm-recipe { font-weight: 700; text-align: right; font-size: 0.85rem; }
.tm-empty { color: #c3ac9b; font-weight: 600; font-size: 0.8rem; }

.buy-preview { display: flex; flex-wrap: wrap; gap: 6px; }
.buy-chip { background: var(--cream-2); padding: 6px 10px; border-radius: 999px; font-weight: 700; font-size: 0.78rem; }
.buy-chip small { color: var(--ink-soft); font-weight: 600; }
.buy-more { background: var(--terracotta-tint); color: var(--terracotta); padding: 6px 10px; border-radius: 999px; font-weight: 800; font-size: 0.78rem; }
.all-good { display: flex; align-items: center; gap: 7px; color: var(--sage); font-weight: 700; padding: 6px 0; font-size: 0.9rem; }
.all-good span { font-size: 1.1rem; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 12px 8px; transition: transform 0.15s ease, box-shadow 0.2s ease; }
.stat:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.stat-emoji { font-size: 1.2rem; }
.stat-value { font-family: var(--font-head); font-weight: 700; font-size: 1.25rem; color: var(--terracotta); }
.stat-label { font-size: 0.68rem; color: var(--ink-soft); font-weight: 700; }

.quick { display: flex; gap: 8px; flex-wrap: wrap; }

@media (max-width: 700px) {
  .cols { grid-template-columns: 1fr; }
  .stats { grid-template-columns: repeat(2, 1fr); }
  .hero-text h1 { font-size: 1.6rem; }
  .hero-emoji { font-size: 3rem; }
}
</style>
