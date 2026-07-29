<script setup>
import { ref, computed } from 'vue'
import { store, deleteRecipe } from '../store.js'
import RecipeForm from '../components/RecipeForm.vue'
import Modal from '../components/Modal.vue'

const search = ref('')
const editing = ref(null) // recipe object or {} for new
const showForm = ref(false)
const viewing = ref(null)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.recipes
  return store.recipes.filter(
    (r) => r.name.toLowerCase().includes(q) || (r.tags || []).some((t) => t.toLowerCase().includes(q))
  )
})

function openNew() {
  editing.value = null
  showForm.value = true
}
function openEdit(r) {
  editing.value = r
  viewing.value = null
  showForm.value = true
}
function onSaved() {
  showForm.value = false
}
function confirmDelete(r) {
  if (confirm(`Delete "${r.name}"? This can't be undone.`)) {
    deleteRecipe(r.id)
    viewing.value = null
  }
}
</script>

<template>
  <div>
    <header class="page-head">
      <div>
        <h1>Your cookbook 📖</h1>
        <p class="sub">Everything you've saved to make. {{ store.recipes.length }} recipes.</p>
      </div>
      <button class="btn btn-primary" @click="openNew">＋ New recipe</button>
    </header>

    <div class="searchbar card">
      <span>🔍</span>
      <input class="bare" v-model="search" placeholder="Search recipes or tags…" />
    </div>

    <div v-if="filtered.length" class="grid">
      <TransitionGroup name="pop">
        <article v-for="r in filtered" :key="r.id" class="recipe-card card" @click="viewing = r">
          <div class="thumb" :style="r.image ? { backgroundImage: `url(${r.image})` } : {}">
            <span v-if="!r.image">{{ r.emoji }}</span>
            <span v-if="r.healthy" class="healthy-badge">🥗 Healthy</span>
          </div>
          <div class="rc-body">
            <h3>{{ r.name }}</h3>
            <div class="meta">
              <span class="chip">🧺 {{ r.ingredients.length }}</span>
              <span v-if="r.minutes" class="chip time">⏱️ {{ r.minutes }}m</span>
              <span class="chip time">🍽️ {{ r.servings }}</span>
            </div>
          </div>
        </article>
      </TransitionGroup>
    </div>

    <div v-else class="empty card">
      <div class="big">🍅</div>
      <h3>{{ search ? 'No matches' : 'No recipes yet' }}</h3>
      <p>{{ search ? 'Try another search.' : 'Add the recipes you saved on Instagram.' }}</p>
      <button v-if="!search" class="btn btn-primary" style="margin-top:14px" @click="openNew">＋ Add your first</button>
    </div>

    <!-- detail view -->
    <Modal v-if="viewing" :title="viewing.name" @close="viewing = null">
      <div class="detail">
        <div class="detail-hero" :style="viewing.image ? { backgroundImage: `url(${viewing.image})` } : {}">
          <span v-if="!viewing.image">{{ viewing.emoji }}</span>
        </div>
        <div class="detail-meta">
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

        <h4>👩‍🍳 Method</h4>
        <ol class="step-list">
          <li v-for="(s, i) in viewing.steps" :key="i">{{ s }}</li>
        </ol>
      </div>
      <template #footer>
        <button class="btn btn-ghost danger" @click="confirmDelete(viewing)">Delete</button>
        <button class="btn btn-soft" @click="openEdit(viewing)">Edit</button>
      </template>
    </Modal>

    <RecipeForm v-if="showForm" :recipe="editing" @close="showForm = false" @saved="onSaved" />
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.page-head h1 { font-size: 1.5rem; }
.sub { color: var(--ink-soft); font-weight: 600; margin-top: 2px; }

.searchbar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-bottom: 20px; }
.bare { flex: 1; border: none; background: none; outline: none; font-size: 1rem; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.recipe-card { overflow: hidden; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.2s ease; }
.recipe-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.thumb {
  position: relative;
  height: 92px; background: linear-gradient(145deg, var(--cream-2), var(--terracotta-tint)) center/cover;
  display: grid; place-items: center; font-size: 2.1rem;
}
.healthy-badge {
  position: absolute; top: 8px; left: 8px; font-size: 0.64rem; font-weight: 800;
  padding: 3px 8px; border-radius: 999px; background: var(--sage); color: #fff;
  box-shadow: var(--shadow-sm); letter-spacing: 0.01em;
}
.rc-body { padding: 10px 12px 12px; }
.rc-body h3 { font-size: 1rem; margin-bottom: 6px; }
.meta { display: flex; flex-wrap: wrap; gap: 5px; }
.chip.time { background: var(--terracotta-tint); color: var(--terracotta); }
.chip.healthy { background: var(--sage); color: #fff; }
.chip.ig { background: #f3e3f0; color: #a4508a; text-decoration: none; }

.detail-hero {
  height: 130px; border-radius: 14px; margin-bottom: 12px;
  background: linear-gradient(145deg, var(--cream-2), var(--terracotta-tint)) center/cover;
  display: grid; place-items: center; font-size: 2.6rem;
}
.detail-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.detail h4 { font-family: var(--font-head); margin: 18px 0 10px; font-size: 1.15rem; }
.ing-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
.ing-list li {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 12px; border-radius: 10px;
}
.ing-list li:nth-child(odd) { background: var(--cream-2); }
.ing-list .qty { color: var(--ink-soft); font-weight: 700; font-size: 0.88rem; }
.step-list { padding-left: 4px; list-style: none; counter-reset: s; display: flex; flex-direction: column; gap: 12px; }
.step-list li { position: relative; padding-left: 40px; counter-increment: s; }
.step-list li::before {
  content: counter(s); position: absolute; left: 0; top: -2px;
  width: 28px; height: 28px; border-radius: 50%; background: var(--sage-tint); color: #5f6e51;
  font-weight: 800; display: grid; place-items: center; font-size: 0.85rem;
}
.danger { color: #c0563f; }
.danger:hover { background: var(--terracotta-tint); }

@media (max-width: 560px) {
  .page-head h1 { font-size: 1.6rem; }
}
</style>
