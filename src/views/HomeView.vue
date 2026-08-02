<script setup>
import { computed, inject, ref } from 'vue'
import { store, MEALS, isoDay, startOfWeek, addDays, getRecipe, buildShoppingList, inPantry } from '../store.js'

const navigate = inject('navigate')
const openSettings = inject('openSettings')
const breadOpen = ref(false)
const sourOpen = ref(false)
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

    <!-- bread tutorials -->
    <div class="breads">
      <!-- easy yeast loaf -->
      <section class="bread card">
        <button class="bread-head" @click="breadOpen = !breadOpen">
          <span class="bread-emoji">🍞</span>
          <span class="bread-title">
            <span class="bread-h">Bread day — easy yeast loaf</span>
            <span class="bread-sub">No sourdough starter needed. Crusty bakery loaf from your oven.</span>
          </span>
          <span class="bread-chev" :class="{ open: breadOpen }">⌄</span>
        </button>

        <div v-if="breadOpen" class="bread-body">
          <p class="bread-intro">You have yeast, so skip the week-long sourdough starter — a packet of yeast rises this dough in a couple of hours. It's the most forgiving bread there is. 🤍</p>

          <h4>🧺 What you need</h4>
          <ul class="bread-list">
            <li><strong>3 cups</strong> bread flour (or all-purpose)</li>
            <li><strong>½ tsp</strong> instant yeast</li>
            <li><strong>1½ tsp</strong> salt</li>
            <li><strong>1½ cups</strong> warm water</li>
            <li>A <strong>lidded pot</strong> (Dutch oven / oven-safe pot) — the lid traps steam for the crackly crust</li>
          </ul>

          <h4>👩‍🍳 The rhythm</h4>
          <ol class="bread-steps">
            <li><strong>Mix (2 min):</strong> stir flour, yeast, salt and water into a shaggy, sticky dough. No kneading.</li>
            <li><strong>Rise (overnight):</strong> cover the bowl, leave on the counter 12–18 h until bubbly and doubled.</li>
            <li><strong>Shape (2 min):</strong> tip onto floured counter, fold into a rough ball, rest 30 min.</li>
            <li><strong>Heat the pot:</strong> put the empty lidded pot in the oven, preheat to 230°C / 450°F.</li>
            <li><strong>Bake:</strong> drop the dough into the hot pot, lid <em>on</em> 30 min → lid <em>off</em> 12–15 min until deep golden and hollow-sounding.</li>
            <li><strong>Wait:</strong> cool before slicing (hardest step 😅).</li>
          </ol>

          <div class="bread-tips">
            💡 <strong>Beginner wins:</strong> use a scale if you have one, a cold kitchen just means a longer rise (not a fail), and loaf #2–3 is where it really clicks.
          </div>

          <button class="btn btn-soft bread-cta" @click="navigate('plan')">🍞 It's saved as “No-Knead Dutch Oven Bread” → plan it</button>
        </div>
      </section>

      <!-- sourdough, the slow one -->
      <section class="bread sour card">
        <button class="bread-head" @click="sourOpen = !sourOpen">
          <span class="bread-emoji">🥖</span>
          <span class="bread-title">
            <span class="bread-h">Sourdough — the slow, tangy one</span>
            <span class="bread-sub">A living starter instead of yeast. A weekend ritual.</span>
          </span>
          <span class="bread-chev" :class="{ open: sourOpen }">⌄</span>
        </button>

        <div v-if="sourOpen" class="bread-body">
          <p class="bread-intro">Sourdough rises on a <strong>starter</strong> you grow yourself — a little jar of fermented flour &amp; water full of wild yeast. No packet yeast at all. More effort and about a week to get going, but you get that tangy flavour and chewy, crackly crust. 🫙</p>

          <h4>🧺 What you need</h4>
          <ul class="bread-list">
            <li><strong>Flour</strong> — bread or all-purpose; a little <strong>whole wheat or rye</strong> wakes a new starter faster</li>
            <li><strong>Water</strong> — filtered, or tap left out overnight (chlorine slows it)</li>
            <li><strong>Salt</strong></li>
            <li>A <strong>jar + a kitchen scale</strong> — sourdough is weighed, not cupped</li>
            <li>A <strong>lidded pot</strong> — same as the yeast loaf; the steam makes the crust</li>
          </ul>

          <h4>🫙 Step 1 — Raise a starter (~1 week, 2 min/day)</h4>
          <ol class="bread-steps">
            <li><strong>Day 1:</strong> mix 50 g flour + 50 g water in the jar, lid resting on loosely.</li>
            <li><strong>Each day after:</strong> discard most of it, feed 50 g flour + 50 g water.</li>
            <li><strong>Day 5–7:</strong> when it doubles a few hours after feeding and smells pleasantly sour, it's alive and ready. <em>(Or beg a spoonful from a baker friend and skip the week.)</em></li>
          </ol>

          <h4>👩‍🍳 Step 2 — Bake a loaf</h4>
          <ol class="bread-steps">
            <li><strong>Feed &amp; wait:</strong> morning feed, then wait 4–6 h until bubbly and doubled.</li>
            <li><strong>Mix:</strong> starter + flour + water + salt → shaggy dough. Rest 30 min.</li>
            <li><strong>Stretch &amp; fold</strong> 3–4× over ~2 h (30 sec each — builds strength, no kneading).</li>
            <li><strong>Bulk rise</strong> 4–8 h until puffy and jiggly.</li>
            <li><strong>Shape,</strong> then cold-proof in the fridge overnight — easier to handle and more flavour.</li>
            <li><strong>Bake</strong> next day in the hot pot: lid <em>on</em> 20 min → lid <em>off</em> 20 min.</li>
          </ol>

          <div class="bread-tips">
            💡 <strong>Beginner wins:</strong> weigh everything, warmth speeds fermentation (cold just means slower, not failure), and the "discard" isn't trash — save it for pancakes. First loaf will be a bit dense; loaf #3–4 is where it clicks.
          </div>
        </div>
      </section>
    </div>

    <!-- quick actions -->
    <div class="quick">
      <button class="btn btn-primary" @click="navigate('plan')">＋ Add a recipe</button>
      <button class="btn btn-soft" @click="navigate('plan')">🗓️ Plan the week</button>
      <button class="btn btn-ghost backup-btn" @click="openSettings()">⚙️ Settings</button>
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

/* bread tutorials */
.breads { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; align-items: start; }
.bread { padding: 0; overflow: hidden; }
.bread-head {
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; text-align: left;
  background: linear-gradient(135deg, var(--card), #f6e7cf);
}
/* sourdough card themed sage to set it apart from the yeast loaf */
.bread.sour .bread-head { background: linear-gradient(135deg, var(--card), var(--sage-tint)); }
.bread.sour .bread-steps li::before { background: var(--sage-tint); color: #5f6e51; }
.bread-emoji { font-size: 1.7rem; flex-shrink: 0; }
.bread-title { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.bread-h { font-family: var(--font-head); font-weight: 600; font-size: 1.05rem; }
.bread-sub { color: var(--ink-soft); font-weight: 600; font-size: 0.78rem; }
.bread-chev { font-size: 1.3rem; color: var(--ink-soft); transition: transform 0.2s ease; flex-shrink: 0; }
.bread-chev.open { transform: rotate(180deg); }

.bread-body { padding: 4px 16px 16px; }
.bread-intro { color: var(--ink-soft); font-weight: 600; font-size: 0.86rem; line-height: 1.5; margin: 8px 0 4px; }
.bread-body h4 { font-family: var(--font-head); font-weight: 600; font-size: 1rem; margin: 16px 0 8px; }
.bread-list { list-style: none; display: flex; flex-direction: column; gap: 5px; }
.bread-list li { padding: 7px 12px; border-radius: 9px; background: var(--cream-2); font-size: 0.84rem; font-weight: 600; }
.bread-steps { padding-left: 4px; list-style: none; counter-reset: b; display: flex; flex-direction: column; gap: 9px; }
.bread-steps li { position: relative; padding-left: 34px; counter-increment: b; font-size: 0.86rem; line-height: 1.4; }
.bread-steps li::before {
  content: counter(b); position: absolute; left: 0; top: -1px;
  width: 24px; height: 24px; border-radius: 50%; background: #f6e7cf; color: #a9741f;
  font-weight: 800; display: grid; place-items: center; font-size: 0.78rem;
}
.bread-tips {
  margin-top: 14px; padding: 11px 14px; border-radius: var(--radius-sm);
  background: var(--sage-tint); color: #5f6e51; font-weight: 600; font-size: 0.82rem; line-height: 1.5;
}
.bread-cta { margin-top: 14px; width: 100%; }

.quick { display: flex; gap: 8px; flex-wrap: wrap; }

@media (max-width: 700px) {
  .cols { grid-template-columns: 1fr; }
  .breads { grid-template-columns: 1fr; }
  .stats { grid-template-columns: repeat(2, 1fr); }
  .hero-text h1 { font-size: 1.6rem; }
  .hero-emoji { font-size: 3rem; }
}
</style>
