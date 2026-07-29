/*
 * Starter recipes — a batch of simple, healthy recipes (researched July 2026,
 * built around the Harvard Healthy Eating Plate) that ship with the app so the
 * cookbook starts full. These are real cookbook recipes (all flagged healthy),
 * not a separate browsing feature. store.js seeds them on first run and
 * back-fills them once into existing cookbooks.
 *
 * Categories match store.js CATEGORIES:
 * produce · meat · dairy · bakery · pantry · spices · frozen · other
 */

const ing = (name, qty, unit, category) => ({ name, qty, unit, category })

export const STARTER_RECIPES = [
  /* ---------------- Breakfast ---------------- */
  {
    name: 'Berry Yogurt Parfait', emoji: '🥣', minutes: 5, servings: 1, healthy: true,
    tags: ['breakfast', 'no-cook', 'high-protein'],
    ingredients: [
      ing('Greek yogurt', '1', 'cup', 'dairy'),
      ing('Mixed berries', '1/2', 'cup', 'produce'),
      ing('Granola', '1/4', 'cup', 'pantry'),
      ing('Almonds', '1', 'tbsp', 'pantry'),
      ing('Honey', '1', 'tsp', 'pantry')
    ],
    steps: [
      'Spoon half the yogurt into a glass or bowl.',
      'Add half the berries and granola, then repeat the layers.',
      'Top with almonds and a drizzle of honey. 🍯'
    ]
  },
  {
    name: 'Peanut Butter Overnight Oats', emoji: '🥜', minutes: 5, servings: 1, healthy: true,
    tags: ['breakfast', 'make-ahead', 'no-cook'],
    ingredients: [
      ing('Rolled oats', '1/2', 'cup', 'pantry'),
      ing('Milk', '1/2', 'cup', 'dairy'),
      ing('Chia seeds', '1', 'tbsp', 'pantry'),
      ing('Peanut butter', '1', 'tbsp', 'pantry'),
      ing('Banana', '1/2', 'pc', 'produce')
    ],
    steps: [
      'Stir oats, milk, chia and peanut butter in a jar.',
      'Cover and refrigerate overnight.',
      'In the morning, top with sliced banana and eat cold. 🌙→🌅'
    ]
  },
  {
    name: 'Cottage Cheese Toast', emoji: '🍞', minutes: 5, servings: 1, healthy: true,
    tags: ['breakfast', 'quick', 'high-protein'],
    ingredients: [
      ing('Whole grain bread', '1', 'slice', 'bakery'),
      ing('Cottage cheese', '1/2', 'cup', 'dairy'),
      ing('Cherry tomatoes', '4', 'pcs', 'produce'),
      ing('Everything bagel seasoning', '1', 'pinch', 'spices'),
      ing('Olive oil', '1', 'tsp', 'pantry')
    ],
    steps: [
      'Toast the bread until golden.',
      'Spread cottage cheese thickly over the top.',
      'Add halved tomatoes, a drizzle of olive oil and the seasoning.'
    ]
  },
  {
    name: 'Spinach & Feta Egg Scramble', emoji: '🍳', minutes: 10, servings: 1, healthy: true,
    tags: ['breakfast', 'quick', 'veggie'],
    ingredients: [
      ing('Eggs', '2', 'pcs', 'dairy'),
      ing('Baby spinach', '1', 'handful', 'produce'),
      ing('Feta', '2', 'tbsp', 'dairy'),
      ing('Olive oil', '1', 'tsp', 'pantry')
    ],
    steps: [
      'Warm olive oil in a pan and wilt the spinach for a minute.',
      'Pour in whisked eggs and gently stir until just set.',
      'Fold through crumbled feta and season. 🧀'
    ]
  },

  /* ---------------- Lunch / bowls ---------------- */
  {
    name: 'Chicken Quinoa Power Bowl', emoji: '🥗', minutes: 25, servings: 2, healthy: true,
    tags: ['lunch', 'meal-prep', 'high-protein'],
    ingredients: [
      ing('Chicken breast', '2', 'pcs', 'meat'),
      ing('Quinoa', '1', 'cup', 'pantry'),
      ing('Cucumber', '1', 'pc', 'produce'),
      ing('Cherry tomatoes', '1', 'cup', 'produce'),
      ing('Feta', '1/4', 'cup', 'dairy'),
      ing('Lemon', '1', 'pc', 'produce'),
      ing('Olive oil', '2', 'tbsp', 'pantry')
    ],
    steps: [
      'Cook quinoa per package and let it cool slightly.',
      'Season and pan-sear the chicken, then slice.',
      'Chop cucumber and halve tomatoes.',
      'Build bowls with quinoa, veg and chicken; top with feta, lemon juice and olive oil.'
    ]
  },
  {
    name: 'Tuna White Bean Salad', emoji: '🐟', minutes: 10, servings: 2, healthy: true,
    tags: ['lunch', 'no-cook', 'pantry'],
    ingredients: [
      ing('Canned tuna', '1', 'can', 'pantry'),
      ing('White beans', '1', 'can', 'pantry'),
      ing('Red onion', '1/4', 'pc', 'produce'),
      ing('Parsley', '1', 'handful', 'produce'),
      ing('Lemon', '1', 'pc', 'produce'),
      ing('Olive oil', '2', 'tbsp', 'pantry')
    ],
    steps: [
      'Drain the tuna and beans and add to a bowl.',
      'Finely slice the onion and chop the parsley.',
      'Toss everything with lemon juice, olive oil, salt and pepper.'
    ]
  },
  {
    name: 'Chickpea Avocado Wrap', emoji: '🌯', minutes: 10, servings: 2, healthy: true,
    tags: ['lunch', 'vegetarian', 'no-cook'],
    ingredients: [
      ing('Chickpeas', '1', 'can', 'pantry'),
      ing('Avocado', '1', 'pc', 'produce'),
      ing('Whole wheat wraps', '2', 'pcs', 'bakery'),
      ing('Baby spinach', '1', 'handful', 'produce'),
      ing('Lemon', '1/2', 'pc', 'produce')
    ],
    steps: [
      'Drain chickpeas and mash with avocado and lemon juice.',
      'Season with salt and pepper.',
      'Spread over wraps, add spinach, roll up and slice.'
    ]
  },

  /* ---------------- Dinner ---------------- */
  {
    name: 'Sheet-Pan Salmon & Broccoli', emoji: '🐠', minutes: 25, servings: 2, healthy: true,
    tags: ['dinner', 'sheet-pan', 'omega-3'],
    ingredients: [
      ing('Salmon fillets', '2', 'pcs', 'meat'),
      ing('Broccoli', '1', 'head', 'produce'),
      ing('Garlic', '2', 'cloves', 'produce'),
      ing('Lemon', '1', 'pc', 'produce'),
      ing('Olive oil', '2', 'tbsp', 'pantry')
    ],
    steps: [
      'Heat oven to 200°C / 400°F.',
      'Toss broccoli florets with olive oil, minced garlic, salt and pepper on a tray.',
      'Roast 10 min, then add salmon and lemon slices.',
      'Roast another 12 min until salmon flakes easily. 🍋'
    ]
  },
  {
    name: 'Lemon Garlic Shrimp & Zucchini', emoji: '🦐', minutes: 20, servings: 2, healthy: true,
    tags: ['dinner', 'quick', 'low-carb'],
    ingredients: [
      ing('Shrimp', '400', 'g', 'meat'),
      ing('Zucchini', '2', 'pcs', 'produce'),
      ing('Garlic', '3', 'cloves', 'produce'),
      ing('Lemon', '1', 'pc', 'produce'),
      ing('Olive oil', '2', 'tbsp', 'pantry')
    ],
    steps: [
      'Sauté sliced zucchini in olive oil until just tender; set aside.',
      'Add a little more oil and the garlic, then the shrimp.',
      'Cook 2–3 min per side until pink; return zucchini.',
      'Finish with a big squeeze of lemon.'
    ]
  },
  {
    name: 'Turkey Taco Lettuce Wraps', emoji: '🌮', minutes: 20, servings: 3, healthy: true,
    tags: ['dinner', 'quick', 'high-protein'],
    ingredients: [
      ing('Ground turkey', '500', 'g', 'meat'),
      ing('Taco seasoning', '1', 'tbsp', 'spices'),
      ing('Little gem lettuce', '1', 'head', 'produce'),
      ing('Tomato', '1', 'pc', 'produce'),
      ing('Avocado', '1', 'pc', 'produce')
    ],
    steps: [
      'Brown the turkey in a pan, breaking it up.',
      'Stir in taco seasoning and a splash of water; simmer 5 min.',
      'Spoon into lettuce cups and top with diced tomato and avocado.'
    ]
  },
  {
    name: 'Coconut Chickpea Curry', emoji: '🍛', minutes: 30, servings: 3, healthy: true,
    tags: ['dinner', 'vegetarian', 'one-pot'],
    ingredients: [
      ing('Chickpeas', '2', 'cans', 'pantry'),
      ing('Coconut milk', '1', 'can', 'pantry'),
      ing('Onion', '1', 'pc', 'produce'),
      ing('Baby spinach', '2', 'handfuls', 'produce'),
      ing('Curry paste', '2', 'tbsp', 'pantry'),
      ing('Brown rice', '1', 'cup', 'pantry')
    ],
    steps: [
      'Start the rice cooking.',
      'Soften diced onion in a pot, then stir in curry paste for 1 min.',
      'Add chickpeas and coconut milk; simmer 10–12 min.',
      'Wilt in the spinach and serve over rice. 🥥'
    ]
  },
  {
    name: 'Veggie Chicken Stir-Fry', emoji: '🥢', minutes: 25, servings: 2, healthy: true,
    tags: ['dinner', 'quick', 'veg-packed'],
    ingredients: [
      ing('Chicken breast', '2', 'pcs', 'meat'),
      ing('Mixed stir-fry vegetables', '4', 'cups', 'produce'),
      ing('Garlic', '2', 'cloves', 'produce'),
      ing('Soy sauce', '3', 'tbsp', 'pantry'),
      ing('Brown rice', '1', 'cup', 'pantry')
    ],
    steps: [
      'Cook the rice.',
      'Stir-fry sliced chicken in a hot pan until golden; set aside.',
      'Stir-fry garlic and vegetables until crisp-tender.',
      'Return chicken, add soy sauce, toss and serve over rice.'
    ]
  },

  /* ---------------- Meal prep ---------------- */
  {
    name: 'Baked Egg Muffins', emoji: '🧁', minutes: 30, servings: 6, healthy: true,
    tags: ['meal-prep', 'breakfast', 'high-protein', 'make-ahead'],
    ingredients: [
      ing('Eggs', '8', 'pcs', 'dairy'),
      ing('Baby spinach', '2', 'handfuls', 'produce'),
      ing('Bell pepper', '1', 'pc', 'produce'),
      ing('Cheddar', '1/2', 'cup', 'dairy'),
      ing('Olive oil', '1', 'tsp', 'pantry')
    ],
    steps: [
      'Heat oven to 190°C / 375°F and oil a muffin tin.',
      'Whisk eggs with salt and pepper; stir in chopped spinach, diced pepper and cheese.',
      'Pour into 12 cups and bake 18–20 min until set.',
      'Cool, then keep in the fridge up to 4 days. 🗓️'
    ]
  },
  {
    name: 'Mason Jar Chicken Salads', emoji: '🫙', minutes: 25, servings: 4, healthy: true,
    tags: ['meal-prep', 'lunch', 'make-ahead'],
    ingredients: [
      ing('Chicken breast', '3', 'pcs', 'meat'),
      ing('Cherry tomatoes', '2', 'cups', 'produce'),
      ing('Cucumber', '2', 'pcs', 'produce'),
      ing('Mixed greens', '6', 'cups', 'produce'),
      ing('Chickpeas', '1', 'can', 'pantry'),
      ing('Olive oil', '1/4', 'cup', 'pantry'),
      ing('Lemon', '1', 'pc', 'produce')
    ],
    steps: [
      'Cook and dice the chicken.',
      'Whisk olive oil and lemon juice; spoon into the bottom of 4 jars.',
      'Layer chickpeas, tomatoes, cucumber, then chicken, then greens on top.',
      'Seal and refrigerate. Shake into a bowl when ready to eat.'
    ]
  },
  {
    name: 'Sweet Potato & Black Bean Bowls', emoji: '🍠', minutes: 35, servings: 4, healthy: true,
    tags: ['meal-prep', 'dinner', 'vegetarian', 'batch'],
    ingredients: [
      ing('Sweet potatoes', '2', 'pcs', 'produce'),
      ing('Black beans', '2', 'cans', 'pantry'),
      ing('Brown rice', '1.5', 'cups', 'pantry'),
      ing('Red onion', '1', 'pc', 'produce'),
      ing('Avocado', '2', 'pcs', 'produce'),
      ing('Olive oil', '2', 'tbsp', 'pantry'),
      ing('Cumin', '1', 'tsp', 'spices')
    ],
    steps: [
      'Roast cubed sweet potato and onion with olive oil and cumin at 200°C / 400°F for 25 min.',
      'Meanwhile cook the rice and warm the drained beans.',
      'Divide rice, sweet potato and beans into 4 containers.',
      'Add fresh avocado each day when serving. 🥑'
    ]
  },

  /* ---------------- Snacks ---------------- */
  {
    name: 'No-Bake Energy Bites', emoji: '⚡', minutes: 15, servings: 12, healthy: true,
    tags: ['snack', 'no-cook', 'make-ahead', 'batch'],
    ingredients: [
      ing('Rolled oats', '1', 'cup', 'pantry'),
      ing('Peanut butter', '1/2', 'cup', 'pantry'),
      ing('Honey', '1/3', 'cup', 'pantry'),
      ing('Chia seeds', '1', 'tbsp', 'pantry'),
      ing('Dark chocolate chips', '1/4', 'cup', 'pantry')
    ],
    steps: [
      'Stir everything together in a bowl until it clumps.',
      'Chill 15 min so it firms up.',
      'Roll into bite-size balls and keep in the fridge up to a week.'
    ]
  },
  {
    name: 'Crispy Roasted Chickpeas', emoji: '🫛', minutes: 30, servings: 4, healthy: true,
    tags: ['snack', 'vegan', 'crunchy', 'batch'],
    ingredients: [
      ing('Chickpeas', '2', 'cans', 'pantry'),
      ing('Olive oil', '1', 'tbsp', 'pantry'),
      ing('Paprika', '1', 'tsp', 'spices'),
      ing('Salt', '1/2', 'tsp', 'spices')
    ],
    steps: [
      'Heat oven to 200°C / 400°F.',
      'Drain, rinse and pat the chickpeas very dry.',
      'Toss with oil, paprika and salt; spread on a tray.',
      'Roast 25–30 min, shaking once, until crisp.'
    ]
  },
  {
    name: 'Frozen Yogurt Bark', emoji: '🍧', minutes: 10, servings: 6, healthy: true,
    tags: ['snack', 'no-cook', 'make-ahead', 'freezer'],
    ingredients: [
      ing('Greek yogurt', '2', 'cups', 'dairy'),
      ing('Honey', '2', 'tbsp', 'pantry'),
      ing('Mixed berries', '1', 'cup', 'produce'),
      ing('Almonds', '1/4', 'cup', 'pantry')
    ],
    steps: [
      'Stir yogurt with honey and spread on a lined tray.',
      'Scatter berries and chopped almonds over the top.',
      'Freeze 3–4 hours, then break into pieces. Keep frozen. ❄️'
    ]
  },
  {
    name: 'Hummus & Veggie Sticks', emoji: '🥕', minutes: 10, servings: 4, healthy: true,
    tags: ['snack', 'no-cook', 'veggie'],
    ingredients: [
      ing('Chickpeas', '1', 'can', 'pantry'),
      ing('Tahini', '2', 'tbsp', 'pantry'),
      ing('Lemon', '1', 'pc', 'produce'),
      ing('Garlic', '1', 'clove', 'produce'),
      ing('Carrots', '3', 'pcs', 'produce'),
      ing('Cucumber', '1', 'pc', 'produce')
    ],
    steps: [
      'Blend drained chickpeas, tahini, lemon juice, garlic and a splash of water until smooth.',
      'Season with salt.',
      'Cut carrots and cucumber into sticks for dipping.'
    ]
  }
]
