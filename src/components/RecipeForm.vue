<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import { CATEGORIES, catInfo, SLOTS, blankIngredient, blankRecipe, saveRecipe } from '../store.js'

const props = defineProps({ recipe: Object })
const emit = defineEmits(['close', 'saved'])

// deep copy so edits are cancelable
const form = ref(JSON.parse(JSON.stringify(props.recipe || blankRecipe())))
if (!form.value.ingredients?.length) form.value.ingredients = [blankIngredient()]
if (!form.value.steps?.length) form.value.steps = ['']
if (typeof form.value.healthy !== 'boolean') form.value.healthy = false
if (!form.value.slot || form.value.slot === 'lunch' || form.value.slot === 'dinner') form.value.slot = 'main'
if (typeof form.value.mealPrep !== 'boolean') form.value.mealPrep = false
if (typeof form.value.knowHow !== 'boolean') form.value.knowHow = false

const EMOJIS = ['🍽️', '🍝', '🍗', '🥗', '🍲', '🥘', '🍜', '🌮', '🍛', '🥞', '🍳', '🧁', '🍰', '🥪']

function addIngredient() {
  form.value.ingredients.push(blankIngredient())
}
function removeIngredient(i) {
  form.value.ingredients.splice(i, 1)
  if (!form.value.ingredients.length) form.value.ingredients.push(blankIngredient())
}
function addStep() {
  form.value.steps.push('')
}
function removeStep(i) {
  form.value.steps.splice(i, 1)
  if (!form.value.steps.length) form.value.steps.push('')
}

function onImage(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { form.value.image = reader.result }
  reader.readAsDataURL(file)
}

const error = ref('')
function submit() {
  if (!form.value.name.trim()) {
    error.value = 'Give your recipe a name 🍅'
    return
  }
  const clean = { ...form.value }
  clean.ingredients = clean.ingredients.filter((i) => i.name.trim())
  clean.steps = clean.knowHow ? [] : clean.steps.filter((s) => s.trim())
  const id = saveRecipe(clean)
  emit('saved', id)
}
</script>

<template>
  <Modal :title="recipe ? 'Edit recipe' : 'New recipe'" @close="emit('close')">
    <div class="form">
      <!-- header row: emoji + name -->
      <div class="row-top">
        <div class="emoji-pick">
          <div class="current">{{ form.emoji }}</div>
          <div class="emoji-grid">
            <button v-for="e in EMOJIS" :key="e" class="emoji-opt" :class="{ on: form.emoji === e }" @click="form.emoji = e">{{ e }}</button>
          </div>
        </div>
        <div class="field grow">
          <label>Recipe name</label>
          <input class="input" v-model="form.name" placeholder="Creamy tomato pasta" @input="error = ''" />
        </div>
      </div>

      <div class="two">
        <div class="field">
          <label>Servings</label>
          <input class="input" type="number" min="1" v-model="form.servings" />
        </div>
        <div class="field">
          <label>Minutes</label>
          <input class="input" type="number" min="0" v-model="form.minutes" />
        </div>
      </div>

      <div class="field">
        <label>Meal or snack?</label>
        <div class="slot-picker">
          <button
            v-for="s in SLOTS"
            :key="s.key"
            type="button"
            class="slot-opt"
            :class="{ on: form.slot === s.key }"
            @click="form.slot = s.key"
          >
            {{ s.emoji }} {{ s.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="healthy-toggle"
        :class="{ on: form.healthy }"
        @click="form.healthy = !form.healthy"
      >
        <span class="ht-check">{{ form.healthy ? '✓' : '' }}</span>
        <span class="ht-label">🥗 Mark as a healthy recipe</span>
        <span class="ht-hint">{{ form.healthy ? 'Shows a Healthy badge' : 'Tap if it’s wholesome' }}</span>
      </button>

      <button
        type="button"
        class="healthy-toggle prep"
        :class="{ on: form.mealPrep }"
        @click="form.mealPrep = !form.mealPrep"
      >
        <span class="ht-check">{{ form.mealPrep ? '✓' : '' }}</span>
        <span class="ht-label">🗓️ Good for meal prep</span>
        <span class="ht-hint">{{ form.mealPrep ? 'Batch &amp; store it' : 'Tap if it keeps well' }}</span>
      </button>

      <div class="field">
        <label>Instagram link (optional)</label>
        <input class="input" v-model="form.igLink" placeholder="https://instagram.com/reel/…" />
      </div>

      <div class="field">
        <label>Photo (optional)</label>
        <div class="photo-row">
          <div class="photo-preview" :style="form.image ? { backgroundImage: `url(${form.image})` } : {}">
            <span v-if="!form.image">{{ form.emoji }}</span>
          </div>
          <label class="btn btn-soft file-btn">
            {{ form.image ? 'Change photo' : 'Upload photo' }}
            <input type="file" accept="image/*" hidden @change="onImage" />
          </label>
          <button v-if="form.image" class="btn btn-ghost" @click="form.image = ''">Remove</button>
        </div>
      </div>

      <!-- ingredients -->
      <div class="section-label">
        <span>🧺 Ingredients</span>
        <small>these flow to your shopping list</small>
      </div>
      <div class="ingredients">
        <div v-for="(ing, i) in form.ingredients" :key="ing.id" class="ing-row">
          <input class="input ing-name" v-model="ing.name" placeholder="Ingredient" />
          <input class="input ing-qty" v-model="ing.qty" placeholder="Qty" />
          <input class="input ing-unit" v-model="ing.unit" placeholder="Unit" />
          <select class="select ing-cat" v-model="ing.category">
            <option v-for="c in CATEGORIES" :key="c.key" :value="c.key">{{ c.emoji }} {{ c.label }}</option>
          </select>
          <button class="mini-x" @click="removeIngredient(i)" aria-label="Remove">✕</button>
        </div>
      </div>
      <button class="btn btn-ghost add-line" @click="addIngredient">＋ Add ingredient</button>

      <!-- steps (optional) -->
      <div class="section-label"><span>👩‍🍳 How to make it</span><small>optional</small></div>

      <button
        type="button"
        class="healthy-toggle knowhow"
        :class="{ on: form.knowHow }"
        @click="form.knowHow = !form.knowHow"
      >
        <span class="ht-check">{{ form.knowHow ? '✓' : '' }}</span>
        <span class="ht-label">🧠 I already know how to make this</span>
        <span class="ht-hint">{{ form.knowHow ? 'Steps skipped' : 'Skip the steps' }}</span>
      </button>

      <template v-if="!form.knowHow">
        <div class="steps">
          <div v-for="(step, i) in form.steps" :key="i" class="step-row">
            <div class="step-num">{{ i + 1 }}</div>
            <textarea class="textarea" v-model="form.steps[i]" :placeholder="`Step ${i + 1}…`" rows="2"></textarea>
            <button class="mini-x" @click="removeStep(i)" aria-label="Remove">✕</button>
          </div>
        </div>
        <button class="btn btn-ghost add-line" @click="addStep">＋ Add step</button>
      </template>

      <p v-if="error" class="err">{{ error }}</p>
    </div>

    <template #footer>
      <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="submit">Save recipe</button>
    </template>
  </Modal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 16px; }
.row-top { display: flex; gap: 14px; align-items: flex-start; }
.grow { flex: 1; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.emoji-pick { position: relative; }
.current {
  width: 58px; height: 58px; border-radius: 16px; font-size: 1.8rem;
  display: grid; place-items: center; background: var(--terracotta-tint); cursor: default;
}
.emoji-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-top: 8px;
  width: 220px; position: absolute; z-index: 5; background: var(--card);
  border: 1px solid var(--line); border-radius: 12px; padding: 6px; box-shadow: var(--shadow);
  opacity: 0; pointer-events: none; transform: translateY(-4px); transition: all 0.15s ease;
}
.emoji-pick:hover .emoji-grid, .emoji-pick:focus-within .emoji-grid { opacity: 1; pointer-events: auto; transform: none; }
.emoji-opt { padding: 4px; border-radius: 8px; font-size: 1.1rem; }
.emoji-opt:hover, .emoji-opt.on { background: var(--terracotta-tint); }

.section-label {
  display: flex; align-items: baseline; gap: 10px; margin-top: 6px;
  font-family: var(--font-head); font-weight: 600; font-size: 1.05rem;
}
.section-label small { font-family: var(--font-body); font-weight: 600; color: var(--sage); font-size: 0.75rem; }

.ingredients, .steps { display: flex; flex-direction: column; gap: 8px; }
.ing-row { display: grid; grid-template-columns: 1fr 62px 74px 130px 30px; gap: 6px; align-items: center; }
.ing-row .input, .ing-row .select { padding: 9px 10px; font-size: 0.88rem; }

.step-row { display: grid; grid-template-columns: 28px 1fr 30px; gap: 8px; align-items: start; }
.step-num {
  width: 28px; height: 28px; margin-top: 6px; border-radius: 50%; background: var(--sage-tint);
  color: #5f6e51; font-weight: 800; display: grid; place-items: center; font-size: 0.85rem;
}

.mini-x {
  width: 28px; height: 28px; border-radius: 8px; color: var(--ink-soft); font-size: 0.8rem;
  display: grid; place-items: center; align-self: center;
}
.mini-x:hover { background: var(--terracotta-tint); color: var(--terracotta); }
.add-line { align-self: flex-start; color: var(--terracotta); font-weight: 700; padding-left: 6px; }

.slot-picker { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.slot-opt {
  padding: 9px 6px; border-radius: var(--radius-sm); border: 1.5px solid var(--line);
  background: var(--white); font-weight: 700; font-size: 0.82rem; color: var(--ink-soft);
  transition: all 0.15s ease;
}
.slot-opt:hover { border-color: var(--terracotta-soft); }
.slot-opt.on { background: var(--terracotta-tint); border-color: var(--terracotta-soft); color: var(--terracotta); }

.healthy-toggle {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: var(--radius-sm);
  border: 1.5px solid var(--line); background: var(--white); text-align: left; transition: all 0.15s ease;
}
.healthy-toggle:hover { border-color: var(--sage); }
.healthy-toggle.on { background: var(--sage-tint); border-color: var(--sage); }
.healthy-toggle.prep.on { background: #f6e7cf; border-color: var(--honey); }
.healthy-toggle.knowhow.on { background: #e7e6f2; border-color: #9a94c4; }
.healthy-toggle.knowhow.on .ht-check { background: #9a94c4; border-color: #9a94c4; }
.ht-check {
  width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0; display: grid; place-items: center;
  border: 2px solid var(--line); color: #fff; font-weight: 800; font-size: 0.78rem;
}
.healthy-toggle.on .ht-check { background: var(--sage); border-color: var(--sage); }
.healthy-toggle.prep.on .ht-check { background: var(--honey); border-color: var(--honey); }
.ht-label { font-weight: 700; color: var(--ink); }
.ht-hint { margin-left: auto; font-size: 0.74rem; font-weight: 700; color: var(--ink-soft); }

.photo-row { display: flex; align-items: center; gap: 12px; }
.photo-preview {
  width: 64px; height: 64px; border-radius: 14px; background: var(--cream-2) center/cover;
  display: grid; place-items: center; font-size: 1.6rem; flex-shrink: 0; border: 1px solid var(--line);
}
.file-btn { cursor: pointer; }
.err { color: var(--terracotta); font-weight: 700; font-size: 0.88rem; }

@media (max-width: 560px) {
  .ing-row { grid-template-columns: 1fr 52px 30px; grid-auto-rows: auto; }
  .ing-row .ing-cat { grid-column: 1 / 3; }
}
</style>
