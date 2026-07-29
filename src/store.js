import { reactive, watch, computed } from 'vue'
import { STARTER_RECIPES } from './starterRecipes.js'

/* ---------- ingredient categories (grocery aisles) ---------- */
export const CATEGORIES = [
  { key: 'produce', label: 'Produce', emoji: '🥬' },
  { key: 'meat', label: 'Meat & Fish', emoji: '🍗' },
  { key: 'dairy', label: 'Dairy & Eggs', emoji: '🧀' },
  { key: 'bakery', label: 'Bakery', emoji: '🍞' },
  { key: 'pantry', label: 'Pantry & Dry', emoji: '🫙' },
  { key: 'spices', label: 'Spices & Herbs', emoji: '🌿' },
  { key: 'frozen', label: 'Frozen', emoji: '🧊' },
  { key: 'other', label: 'Other', emoji: '🛒' }
]
export const catInfo = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1]

export const MEALS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' }
]

// a recipe's slot answers "is this breakfast, a main meal, or a snack?"
// (lunch & dinner are the same thing — a main — so they're merged)
export const SLOTS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', meal: true },
  { key: 'main', label: 'Main', emoji: '🍽️', meal: true },
  { key: 'snack', label: 'Snack', emoji: '🍎', meal: false }
]
export const slotInfo = (key) => SLOTS.find((s) => s.key === key) || SLOTS[1]

// authoritative slot + meal-prep suitability for the built-in recipes
const RECIPE_META = {
  'creamy tomato pasta': { slot: 'main', mealPrep: false },
  'honey garlic chicken': { slot: 'main', mealPrep: true },
  'berry yogurt parfait': { slot: 'breakfast', mealPrep: false },
  'peanut butter overnight oats': { slot: 'breakfast', mealPrep: true },
  'cottage cheese toast': { slot: 'breakfast', mealPrep: false },
  'spinach & feta egg scramble': { slot: 'breakfast', mealPrep: false },
  'chicken quinoa power bowl': { slot: 'main', mealPrep: true },
  'tuna white bean salad': { slot: 'main', mealPrep: true },
  'chickpea avocado wrap': { slot: 'main', mealPrep: false },
  'sheet-pan salmon & broccoli': { slot: 'main', mealPrep: true },
  'lemon garlic shrimp & zucchini': { slot: 'main', mealPrep: false },
  'turkey taco lettuce wraps': { slot: 'main', mealPrep: true },
  'coconut chickpea curry': { slot: 'main', mealPrep: true },
  'veggie chicken stir-fry': { slot: 'main', mealPrep: true },
  'baked egg muffins': { slot: 'breakfast', mealPrep: true },
  'mason jar chicken salads': { slot: 'main', mealPrep: true },
  'sweet potato & black bean bowls': { slot: 'main', mealPrep: true },
  'no-bake energy bites': { slot: 'snack', mealPrep: true },
  'crispy roasted chickpeas': { slot: 'snack', mealPrep: true },
  'frozen yogurt bark': { slot: 'snack', mealPrep: true },
  'hummus & veggie sticks': { slot: 'snack', mealPrep: true }
}
const metaFor = (name) => RECIPE_META[(name || '').trim().toLowerCase()]

// fallbacks for user-made recipes (guessed from their tags)
const PREP_TAGS = ['meal-prep', 'make-ahead', 'batch', 'freezer']
const slotFromTags = (tags = []) =>
  tags.includes('snack') ? 'snack'
    : tags.includes('breakfast') ? 'breakfast' : 'main'
const prepFromTags = (tags = []) => tags.some((t) => PREP_TAGS.includes(t))

const STORAGE_KEY = 'noob-wifey-v1'

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)

/* ---------- date helpers (weeks start Monday) ---------- */
export const isoDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const startOfWeek = (d = new Date()) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = (x.getDay() + 6) % 7 // Mon=0
  x.setDate(x.getDate() - day)
  return x
}
export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/* ---------- seed data so it never feels empty on first open ---------- */
function seed() {
  const r1 = {
    id: uid(),
    name: 'Creamy Tomato Pasta',
    emoji: '🍝',
    image: '',
    igLink: '',
    servings: 2,
    minutes: 25,
    healthy: false,
    slot: 'main',
    mealPrep: false,
    tags: ['cozy', 'quick'],
    ingredients: [
      { id: uid(), name: 'Pasta', qty: '250', unit: 'g', category: 'pantry' },
      { id: uid(), name: 'Cherry tomatoes', qty: '2', unit: 'cups', category: 'produce' },
      { id: uid(), name: 'Garlic', qty: '3', unit: 'cloves', category: 'produce' },
      { id: uid(), name: 'Heavy cream', qty: '100', unit: 'ml', category: 'dairy' },
      { id: uid(), name: 'Parmesan', qty: '50', unit: 'g', category: 'dairy' },
      { id: uid(), name: 'Basil', qty: '1', unit: 'handful', category: 'spices' }
    ],
    steps: [
      'Boil pasta in salted water until al dente.',
      'Sizzle garlic in olive oil, add tomatoes until they burst.',
      'Pour in cream, simmer, then toss with pasta and parmesan.',
      'Finish with torn basil. 💛'
    ]
  }
  const r2 = {
    id: uid(),
    name: 'Honey Garlic Chicken',
    emoji: '🍗',
    image: '',
    igLink: '',
    servings: 3,
    minutes: 35,
    healthy: true,
    slot: 'main',
    mealPrep: true,
    tags: ['dinner'],
    ingredients: [
      { id: uid(), name: 'Chicken thighs', qty: '6', unit: 'pcs', category: 'meat' },
      { id: uid(), name: 'Honey', qty: '3', unit: 'tbsp', category: 'pantry' },
      { id: uid(), name: 'Garlic', qty: '4', unit: 'cloves', category: 'produce' },
      { id: uid(), name: 'Soy sauce', qty: '2', unit: 'tbsp', category: 'pantry' },
      { id: uid(), name: 'Rice', qty: '1.5', unit: 'cups', category: 'pantry' }
    ],
    steps: [
      'Sear seasoned chicken thighs skin-side down.',
      'Whisk honey, garlic, soy; pour over chicken.',
      'Simmer until glossy and cooked through. Serve over rice.'
    ]
  }
  return {
    recipes: [r1, r2, ...STARTER_RECIPES.map(materialize)],
    plan: {}, // { 'YYYY-MM-DD': { breakfast: recipeId, lunch: id, dinner: id } }
    pantry: [
      { id: uid(), name: 'Olive oil', category: 'pantry' },
      { id: uid(), name: 'Salt', category: 'spices' },
      { id: uid(), name: 'Garlic', category: 'produce' }
    ],
    boughtExtras: [], // manual shopping additions: { id, name, category, checked }
    checked: {}, // ingredient-name(lowercased) -> true when ticked off
    starterPackAdded: true // fresh installs already have the starter recipes
  }
}

// turn a starter-recipe template into a real cookbook recipe (fresh ids)
function materialize(t) {
  const meta = metaFor(t.name)
  return {
    id: uid(),
    name: t.name,
    emoji: t.emoji,
    image: '',
    igLink: '',
    servings: t.servings,
    minutes: t.minutes,
    healthy: t.healthy !== false,
    slot: meta ? meta.slot : slotFromTags(t.tags),
    mealPrep: meta ? meta.mealPrep : prepFromTags(t.tags),
    knowHow: false,
    tags: [...(t.tags || [])],
    ingredients: t.ingredients.map((i) => ({ ...i, id: uid() })),
    steps: [...t.steps]
  }
}

// recipes previously added from the "Healthy ideas" research batch — used once to
// backfill the `healthy` badge on cookbooks created before badges existed.
const HEALTHY_SEED_NAMES = new Set(
  [
    'Berry Yogurt Parfait', 'Peanut Butter Overnight Oats', 'Cottage Cheese Toast',
    'Spinach & Feta Egg Scramble', 'Chicken Quinoa Power Bowl', 'Tuna White Bean Salad',
    'Chickpea Avocado Wrap', 'Sheet-Pan Salmon & Broccoli', 'Lemon Garlic Shrimp & Zucchini',
    'Turkey Taco Lettuce Wraps', 'Coconut Chickpea Curry', 'Veggie Chicken Stir-Fry',
    'Baked Egg Muffins', 'Mason Jar Chicken Salads', 'Sweet Potato & Black Bean Bowls',
    'No-Bake Energy Bites', 'Crispy Roasted Chickpeas', 'Frozen Yogurt Bark',
    'Hummus & Veggie Sticks'
  ].map((n) => n.toLowerCase())
)

function migrate(data) {
  if (!Array.isArray(data.recipes)) return data

  // backfill fields added after these recipes were first saved
  for (const r of data.recipes) {
    if (typeof r.healthy !== 'boolean') {
      r.healthy = HEALTHY_SEED_NAMES.has((r.name || '').trim().toLowerCase())
    }
    const meta = metaFor(r.name)
    if (!r.slot) r.slot = meta ? meta.slot : slotFromTags(r.tags)
    if (r.slot === 'lunch' || r.slot === 'dinner') r.slot = 'main' // merged
    if (typeof r.mealPrep !== 'boolean') r.mealPrep = meta ? meta.mealPrep : prepFromTags(r.tags)
    if (typeof r.knowHow !== 'boolean') r.knowHow = false
  }

  // one-time: add any starter recipes that aren't already in the cookbook.
  // Guarded by a flag so recipes the user deletes don't come back.
  if (!data.starterPackAdded) {
    const have = new Set(data.recipes.map((r) => (r.name || '').trim().toLowerCase()))
    for (const t of STARTER_RECIPES) {
      if (!have.has(t.name.trim().toLowerCase())) data.recipes.push(materialize(t))
    }
    data.starterPackAdded = true
  }
  return data
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return migrate(JSON.parse(raw))
  } catch (e) {
    console.warn('load failed', e)
  }
  return seed()
}

export const store = reactive(load())

watch(
  store,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      console.warn('save failed', e)
    }
  },
  // immediate so a first-load migration (e.g. back-filling starter recipes)
  // is persisted right away, not just on the next user edit.
  { deep: true, immediate: true }
)

/* ---------- backup & restore ---------- */
export function exportData() {
  return JSON.stringify({ app: 'noob-wifey', version: 1, exportedAt: new Date().toISOString(), data: store }, null, 2)
}

// summarise a parsed backup for the confirm step (throws if it's not valid)
export function inspectBackup(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  const data = parsed && parsed.data ? parsed.data : parsed // accept raw store dumps too
  if (!data || !Array.isArray(data.recipes)) {
    throw new Error('That file doesn’t look like a Noob Wifey backup.')
  }
  const meals = Object.values(data.plan || {}).reduce((n, day) => n + Object.values(day).filter(Boolean).length, 0)
  return { data, recipes: data.recipes.length, meals, pantry: (data.pantry || []).length }
}

// replace everything in the live store with a validated backup
export function restoreData(data) {
  migrate(data) // fill any fields missing from older backups
  store.recipes = data.recipes || []
  store.plan = data.plan || {}
  store.pantry = data.pantry || []
  store.boughtExtras = data.boughtExtras || []
  store.checked = data.checked || {}
  store.starterPackAdded = data.starterPackAdded !== false
}

/* ---------- recipe actions ---------- */
export function saveRecipe(recipe) {
  const clean = {
    ...recipe,
    servings: Number(recipe.servings) || 1,
    minutes: Number(recipe.minutes) || 0
  }
  if (recipe.id) {
    const i = store.recipes.findIndex((r) => r.id === recipe.id)
    if (i !== -1) store.recipes[i] = clean
  } else {
    clean.id = uid()
    store.recipes.unshift(clean)
  }
  return clean.id
}
export function deleteRecipe(id) {
  store.recipes = store.recipes.filter((r) => r.id !== id)
  // remove from plan too
  for (const day of Object.keys(store.plan)) {
    for (const meal of Object.keys(store.plan[day])) {
      if (store.plan[day][meal] === id) delete store.plan[day][meal]
    }
  }
}
export const getRecipe = (id) => store.recipes.find((r) => r.id === id)
export const blankIngredient = () => ({ id: uid(), name: '', qty: '', unit: '', category: 'produce' })
export const blankRecipe = () => ({
  name: '', emoji: '🍽️', image: '', igLink: '', servings: 2, minutes: 20,
  healthy: false, slot: 'main', mealPrep: false, knowHow: false, tags: [], ingredients: [blankIngredient()], steps: ['']
})

/* ---------- meal plan actions ---------- */
export function setMeal(dayIso, mealKey, recipeId) {
  if (!store.plan[dayIso]) store.plan[dayIso] = {}
  if (recipeId) store.plan[dayIso][mealKey] = recipeId
  else delete store.plan[dayIso][mealKey]
}
export function plannedRecipesForWeek(weekStart) {
  const ids = []
  for (let i = 0; i < 7; i++) {
    const key = isoDay(addDays(weekStart, i))
    const day = store.plan[key]
    if (!day) continue
    for (const meal of MEALS) if (day[meal.key]) ids.push(day[meal.key])
  }
  return ids
}

/* ---------- pantry ---------- */
export function addPantry(name, category = 'other') {
  if (!name.trim()) return
  store.pantry.push({ id: uid(), name: name.trim(), category })
}
export function removePantry(id) {
  store.pantry = store.pantry.filter((p) => p.id !== id)
}
const normalize = (s) => s.trim().toLowerCase()
export const inPantry = (name) => store.pantry.some((p) => normalize(p.name) === normalize(name))

/* ---------- shopping extras ---------- */
export function addExtra(name, category = 'other') {
  if (!name.trim()) return
  store.boughtExtras.push({ id: uid(), name: name.trim(), category, checked: false })
}
export function removeExtra(id) {
  store.boughtExtras = store.boughtExtras.filter((e) => e.id !== id)
}
export function toggleChecked(name) {
  const k = normalize(name)
  store.checked[k] = !store.checked[k]
}
export const isChecked = (name) => !!store.checked[normalize(name)]

/* ---------- the loop: build shopping list from the planned week ---------- */
export function buildShoppingList(weekStart) {
  const map = new Map() // name -> { name, category, qtyParts:[], recipes:Set }
  for (const id of plannedRecipesForWeek(weekStart)) {
    const r = getRecipe(id)
    if (!r) continue
    for (const ing of r.ingredients) {
      if (!ing.name || !ing.name.trim()) continue
      const key = normalize(ing.name)
      if (!map.has(key)) {
        map.set(key, { name: ing.name.trim(), category: ing.category || 'other', qtyParts: [], recipes: new Set() })
      }
      const entry = map.get(key)
      if (ing.qty) entry.qtyParts.push(`${ing.qty}${ing.unit ? ' ' + ing.unit : ''}`)
      entry.recipes.add(r.name)
    }
  }
  const items = [...map.values()].map((e) => ({
    name: e.name,
    category: e.category,
    qty: e.qtyParts.join(' + '),
    recipes: [...e.recipes],
    have: inPantry(e.name),
    checked: isChecked(e.name)
  }))
  return items
}
