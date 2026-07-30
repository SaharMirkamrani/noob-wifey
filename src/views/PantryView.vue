<script setup>
import { ref, computed } from 'vue'
import { store, CATEGORIES, catInfo, slotInfo, addPantry, removePantry, suggestFromPantry, inPantry, addExtra } from '../store.js'
import { toast } from '../toast.js'
import Modal from '../components/Modal.vue'

const name = ref('')
const cat = ref('pantry')
const viewing = ref(null) // a suggestion object

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

const suggestions = computed(() => suggestFromPantry())
const readyCount = computed(() => suggestions.value.filter((s) => s.canCook).length)

const slotGradient = (slot) => ({
  breakfast: 'linear-gradient(145deg, #ffe9cf, #f6c9a3)',
  main: 'linear-gradient(145deg, #f7dccf, #e0a487)',
  snack: 'linear-gradient(145deg, #fde7c0, #f0c069)'
}[slot] || 'linear-gradient(145deg, var(--cream-2), var(--terracotta-tint))')

function addMissingToShopping(sug) {
  let n = 0
  for (const ing of sug.missing) { addExtra(ing.name, ing.category); n++ }
  toast(`Added ${n} item${n === 1 ? '' : 's'} to shopping`, { emoji: '🛒' })
  viewing.value = null
}
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

    <!-- suggestions from what you have -->
    <section class="suggest">
      <div class="suggest-head">
        <h2>🍳 Cook from what you have</h2>
        <span v-if="readyCount" class="ready-note">{{ readyCount }} ready to cook now</span>
      </div>

      <div v-if="suggestions.length" class="sug-grid">
        <article v-for="s in suggestions" :key="s.recipe.id" class="sug-card card" @click="viewing = s">
          <div class="sug-thumb" :style="s.recipe.image ? { backgroundImage: `url(${s.recipe.image})` } : { background: slotGradient(s.recipe.slot) }">
            <span v-if="!s.recipe.image">{{ s.recipe.emoji }}</span>
          </div>
          <div class="sug-body">
            <div class="sug-top">
              <h3>{{ s.recipe.name }}</h3>
              <span v-if="s.canCook" class="ready-badge">✅ Ready</span>
            </div>
            <div class="sug-bar"><div class="sug-fill" :style="{ width: s.pct + '%' }"></div></div>
            <div class="sug-meta">
              <span>You have {{ s.haveCount }}/{{ s.total }}</span>
              <span v-if="!s.canCook" class="sug-need">need {{ s.missing.length }} more</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty card">
        <div class="big">🍳</div>
        <h3>No matches yet</h3>
        <p>Add a few things you already have and I'll suggest meals you can make.</p>
      </div>
    </section>

    <!-- suggestion detail -->
    <Modal v-if="viewing" :title="viewing.recipe.name" @close="viewing = null">
      <div class="detail">
        <div class="detail-hero" :style="viewing.recipe.image ? { backgroundImage: `url(${viewing.recipe.image})` } : { background: slotGradient(viewing.recipe.slot) }">
          <span v-if="!viewing.recipe.image">{{ viewing.recipe.emoji }}</span>
        </div>
        <div class="detail-meta">
          <span class="chip slot">{{ slotInfo(viewing.recipe.slot).emoji }} {{ slotInfo(viewing.recipe.slot).label }}</span>
          <span class="chip" :class="viewing.canCook ? 'ok' : 'need'">{{ viewing.haveCount }}/{{ viewing.total }} on hand</span>
          <span v-if="viewing.recipe.minutes" class="chip time">⏱️ {{ viewing.recipe.minutes }} min</span>
        </div>

        <h4>🧺 Ingredients</h4>
        <ul class="ing-list">
          <li v-for="ing in viewing.recipe.ingredients" :key="ing.id" :class="{ owned: inPantry(ing.name) }">
            <span class="ing-mark">{{ inPantry(ing.name) ? '✓' : '🛒' }}</span>
            <strong>{{ ing.name }}</strong>
            <span v-if="ing.qty" class="qty">{{ ing.qty }} {{ ing.unit }}</span>
          </li>
        </ul>

        <template v-if="viewing.recipe.steps && viewing.recipe.steps.length">
          <h4>👩‍🍳 Method</h4>
          <ol class="step-list">
            <li v-for="(st, i) in viewing.recipe.steps" :key="i">{{ st }}</li>
          </ol>
        </template>
      </div>
      <template #footer>
        <span v-if="viewing.canCook" class="all-set">You've got everything! 🎉</span>
        <button v-else class="btn btn-primary" @click="addMissingToShopping(viewing)">＋ Add {{ viewing.missing.length }} missing to shopping</button>
      </template>
    </Modal>
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

/* suggestions */
.suggest { margin-top: 26px; }
.suggest-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 14px; }
.suggest-head h2 { font-size: 1.2rem; }
.ready-note { color: var(--sage); font-weight: 800; font-size: 0.82rem; }
.sug-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.sug-card { display: flex; gap: 12px; padding: 12px; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease; border: 1px solid var(--line); }
.sug-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--terracotta-soft); }
.sug-thumb { width: 52px; height: 52px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.6rem; background-size: cover; background-position: center; }
.sug-body { flex: 1; min-width: 0; }
.sug-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sug-top h3 { font-size: 0.98rem; line-height: 1.15; }
.ready-badge { flex-shrink: 0; font-size: 0.64rem; font-weight: 800; padding: 3px 8px; border-radius: 999px; background: var(--sage); color: #fff; }
.sug-bar { height: 6px; border-radius: 999px; background: var(--cream-2); overflow: hidden; margin: 8px 0 6px; }
.sug-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--sage), #a3b393); transition: width 0.4s ease; }
.sug-meta { display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 700; color: var(--ink-soft); }
.sug-need { color: var(--terracotta); }

/* detail */
.detail-hero { height: 130px; border-radius: 14px; margin-bottom: 12px; display: grid; place-items: center; font-size: 2.6rem; background-size: cover; background-position: center; }
.detail-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.chip.time { background: var(--terracotta-tint); color: var(--terracotta); }
.chip.slot { background: var(--cream-2); color: var(--ink); }
.chip.ok { background: var(--sage); color: #fff; }
.chip.need { background: var(--terracotta-tint); color: var(--terracotta); }
.detail h4 { font-family: var(--font-head); margin: 18px 0 10px; font-size: 1.15rem; }
.ing-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
.ing-list li { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; }
.ing-list li:nth-child(odd) { background: var(--cream-2); }
.ing-list li.owned .ing-mark { color: var(--sage); }
.ing-mark { width: 18px; text-align: center; font-weight: 800; font-size: 0.8rem; }
.ing-list .qty { margin-left: auto; color: var(--ink-soft); font-weight: 700; font-size: 0.85rem; }
.step-list { padding-left: 4px; list-style: none; counter-reset: s; display: flex; flex-direction: column; gap: 12px; }
.step-list li { position: relative; padding-left: 40px; counter-increment: s; }
.step-list li::before {
  content: counter(s); position: absolute; left: 0; top: -2px;
  width: 28px; height: 28px; border-radius: 50%; background: var(--sage-tint); color: #5f6e51;
  font-weight: 800; display: grid; place-items: center; font-size: 0.85rem;
}
.all-set { color: var(--sage); font-weight: 800; font-size: 0.9rem; }

@media (max-width: 560px) {
  .page-head h1 { font-size: 1.6rem; }
  .add { flex-wrap: wrap; }
  .cat-select { flex: 1; }
}
</style>
