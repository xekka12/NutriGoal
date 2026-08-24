/**
 * Built-in Filipino recipes used when the AI generator is unavailable.
 * Quantities are per person and prices are rough Philippine market estimates.
 */

/** Carb sides used to top a dish up to the meal's calorie target. */
const FILLERS = {
  rice: {
    kcalPerUnit: 200,
    proteinPerUnit: 4,
    pricePerUnit: 10,
    step: 0.5,
    max: 3,
    label: (units) => `${units} cup${units === 1 ? "" : "s"} cooked rice`,
  },
  pandesal: {
    kcalPerUnit: 150,
    proteinPerUnit: 4,
    pricePerUnit: 6,
    step: 1,
    max: 3,
    label: (units) => `${units} piece${units === 1 ? "" : "s"} pandesal`,
  },
  kamote: {
    kcalPerUnit: 180,
    proteinPerUnit: 2,
    pricePerUnit: 10,
    step: 1,
    max: 2,
    label: (units) => `${units} small boiled kamote`,
  },
};

const BREAKFAST = [
  {
    name: "Tortang Talong with Egg",
    tags: ["vegetarian", "budget"],
    cookTime: "20 minutes",
    baseCalories: 300,
    baseProtein: 15,
    ingredients: [
      { item: "1 medium talong (eggplant)", estimatedPrice: 15 },
      { item: "2 eggs", estimatedPrice: 18 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
      { item: "1 pinch salt and pepper", estimatedPrice: 1 },
    ],
    steps: [
      { instruction: "Grill the talong until soft, then peel the skin.", estimatedTime: "8 minutes" },
      { instruction: "Beat the eggs with salt and pepper.", estimatedTime: "2 minutes" },
      { instruction: "Flatten the talong, dip in egg, then pan-fry both sides.", estimatedTime: "8 minutes" },
    ],
  },
  {
    name: "Tinapa Fried Rice with Egg",
    tags: ["budget"],
    cookTime: "20 minutes",
    baseCalories: 340,
    baseProtein: 22,
    ingredients: [
      { item: "60g tinapa flakes (smoked fish)", estimatedPrice: 30 },
      { item: "1 egg", estimatedPrice: 9 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
      { item: "1 stalk spring onion, chopped", estimatedPrice: 4 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Saute garlic in oil until light brown.", estimatedTime: "3 minutes" },
      { instruction: "Add tinapa flakes and cooked rice, then stir-fry.", estimatedTime: "6 minutes" },
      { instruction: "Fry the egg separately and place on top with spring onion.", estimatedTime: "5 minutes" },
    ],
  },
  {
    name: "Ginisang Monggo with Malunggay",
    tags: ["vegetarian", "budget", "heart"],
    cookTime: "35 minutes",
    baseCalories: 320,
    baseProtein: 18,
    ingredients: [
      { item: "1/2 cup dried monggo (mung beans)", estimatedPrice: 12 },
      { item: "1 cup malunggay leaves", estimatedPrice: 8 },
      { item: "1 small tomato, chopped", estimatedPrice: 5 },
      { item: "1/2 onion, chopped", estimatedPrice: 4 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Boil the monggo in 3 cups water until soft.", estimatedTime: "20 minutes" },
      { instruction: "Saute garlic, onion, and tomato in oil.", estimatedTime: "5 minutes" },
      { instruction: "Add the boiled monggo with its broth and simmer.", estimatedTime: "7 minutes" },
      { instruction: "Stir in malunggay leaves and season with salt.", estimatedTime: "3 minutes" },
    ],
  },
  {
    name: "Scrambled Eggs with Tokwa and Pechay",
    tags: ["vegetarian", "high-protein"],
    cookTime: "18 minutes",
    baseCalories: 360,
    baseProtein: 26,
    ingredients: [
      { item: "2 eggs", estimatedPrice: 18 },
      { item: "100g tokwa (firm tofu), cubed", estimatedPrice: 15 },
      { item: "1 cup chopped pechay", estimatedPrice: 8 },
      { item: "2 cloves garlic, minced", estimatedPrice: 2 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Pan-fry the tokwa cubes until golden.", estimatedTime: "6 minutes" },
      { instruction: "Saute garlic, then add pechay until wilted.", estimatedTime: "4 minutes" },
      { instruction: "Pour in beaten eggs and scramble with the tokwa.", estimatedTime: "5 minutes" },
    ],
  },
  {
    name: "Chicken Arroz Caldo with Ginger",
    tags: ["budget", "light"],
    cookTime: "35 minutes",
    baseCalories: 380,
    baseProtein: 24,
    ingredients: [
      { item: "100g chicken, cut into small pieces", estimatedPrice: 25 },
      { item: "1/2 cup glutinous or regular rice", estimatedPrice: 8 },
      { item: "1 thumb ginger, sliced", estimatedPrice: 3 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
      { item: "1 stalk spring onion, chopped", estimatedPrice: 4 },
      { item: "1 tbsp fish sauce", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Saute garlic and ginger, then add the chicken.", estimatedTime: "6 minutes" },
      { instruction: "Add rice and 3 cups water, then simmer until thick.", estimatedTime: "22 minutes" },
      { instruction: "Season with fish sauce and top with spring onion.", estimatedTime: "3 minutes" },
    ],
    filler: "pandesal",
  },
  {
    name: "Boiled Saba with Egg and Peanut Butter",
    tags: ["budget", "vegetarian", "low-carb"],
    cookTime: "15 minutes",
    baseCalories: 400,
    baseProtein: 16,
    ingredients: [
      { item: "2 pieces saba banana", estimatedPrice: 14 },
      { item: "1 egg", estimatedPrice: 9 },
      { item: "1 tbsp peanut butter", estimatedPrice: 8 },
      { item: "1 cup water or barako coffee", estimatedPrice: 5 },
    ],
    steps: [
      { instruction: "Boil the saba and egg together until cooked.", estimatedTime: "12 minutes" },
      { instruction: "Peel the saba and spread peanut butter on top.", estimatedTime: "2 minutes" },
      { instruction: "Serve with the boiled egg and a warm drink.", estimatedTime: "1 minute" },
    ],
    filler: "pandesal",
  },
  {
    name: "Lugaw with Tokwa Toppings",
    tags: ["vegetarian", "budget", "light"],
    cookTime: "30 minutes",
    baseCalories: 330,
    baseProtein: 17,
    ingredients: [
      { item: "1/2 cup rice", estimatedPrice: 8 },
      { item: "100g tokwa (firm tofu), cubed", estimatedPrice: 15 },
      { item: "1 thumb ginger, sliced", estimatedPrice: 3 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
      { item: "1 stalk spring onion, chopped", estimatedPrice: 4 },
      { item: "1 tbsp soy sauce", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Boil rice with ginger in 3 cups water until thick.", estimatedTime: "20 minutes" },
      { instruction: "Pan-fry the tokwa until golden, then toss in soy sauce.", estimatedTime: "7 minutes" },
      { instruction: "Top the lugaw with tokwa, garlic, and spring onion.", estimatedTime: "3 minutes" },
    ],
    filler: "pandesal",
  },
  {
    name: "Pandesal with Sardinas and Tomato",
    tags: ["budget", "high-protein"],
    cookTime: "15 minutes",
    baseCalories: 340,
    baseProtein: 20,
    ingredients: [
      { item: "1 can sardinas in tomato sauce", estimatedPrice: 28 },
      { item: "1 medium tomato, sliced", estimatedPrice: 5 },
      { item: "1/4 onion, sliced", estimatedPrice: 3 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Saute onion and tomato in oil for two minutes.", estimatedTime: "3 minutes" },
      { instruction: "Add the sardinas and simmer gently.", estimatedTime: "6 minutes" },
      { instruction: "Serve hot with warm pandesal on the side.", estimatedTime: "2 minutes" },
    ],
    filler: "pandesal",
  },
];

const LUNCH = [
  {
    name: "Chicken Tinola with Sayote and Malunggay",
    tags: ["high-protein", "light", "heart"],
    cookTime: "35 minutes",
    baseCalories: 330,
    baseProtein: 30,
    ingredients: [
      { item: "150g chicken thigh, bone-in", estimatedPrice: 38 },
      { item: "1 small sayote, sliced", estimatedPrice: 12 },
      { item: "1 cup malunggay leaves", estimatedPrice: 8 },
      { item: "1 thumb ginger, sliced", estimatedPrice: 3 },
      { item: "1/2 onion, sliced", estimatedPrice: 4 },
      { item: "1 tbsp fish sauce", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Saute ginger and onion, then add the chicken.", estimatedTime: "6 minutes" },
      { instruction: "Pour in 3 cups water and simmer until tender.", estimatedTime: "20 minutes" },
      { instruction: "Add sayote and cook until soft.", estimatedTime: "6 minutes" },
      { instruction: "Stir in malunggay and season with fish sauce.", estimatedTime: "3 minutes" },
    ],
  },
  {
    name: "Ginisang Sayote with Ground Pork",
    tags: ["budget"],
    cookTime: "25 minutes",
    baseCalories: 350,
    baseProtein: 22,
    ingredients: [
      { item: "100g ground pork", estimatedPrice: 32 },
      { item: "1 medium sayote, cut into strips", estimatedPrice: 12 },
      { item: "1 small carrot, sliced", estimatedPrice: 8 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
      { item: "1/2 onion, chopped", estimatedPrice: 4 },
      { item: "1 tbsp soy sauce", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Saute garlic and onion, then brown the ground pork.", estimatedTime: "8 minutes" },
      { instruction: "Add sayote and carrot with 1/4 cup water.", estimatedTime: "10 minutes" },
      { instruction: "Season with soy sauce and simmer until tender.", estimatedTime: "5 minutes" },
    ],
  },
  {
    name: "Pinakbet with Grilled Bangus",
    tags: ["heart", "light"],
    cookTime: "35 minutes",
    baseCalories: 380,
    baseProtein: 28,
    ingredients: [
      { item: "1 bangus belly slice (about 120g)", estimatedPrice: 45 },
      { item: "1/2 cup sliced kalabasa", estimatedPrice: 8 },
      { item: "5 pieces sitaw, cut into 2-inch pieces", estimatedPrice: 8 },
      { item: "1 small ampalaya, sliced", estimatedPrice: 10 },
      { item: "1 small tomato, chopped", estimatedPrice: 5 },
      { item: "1 tbsp bagoong isda", estimatedPrice: 4 },
    ],
    steps: [
      { instruction: "Grill the bangus until cooked through.", estimatedTime: "12 minutes" },
      { instruction: "Simmer tomato and bagoong in 1/2 cup water.", estimatedTime: "5 minutes" },
      { instruction: "Add kalabasa, sitaw, and ampalaya, then cover.", estimatedTime: "12 minutes" },
      { instruction: "Serve the vegetables beside the grilled bangus.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Adobong Kangkong with Tokwa",
    tags: ["vegetarian", "budget", "low-carb"],
    cookTime: "20 minutes",
    baseCalories: 300,
    baseProtein: 20,
    ingredients: [
      { item: "1 bundle kangkong, chopped", estimatedPrice: 12 },
      { item: "150g tokwa (firm tofu), cubed", estimatedPrice: 20 },
      { item: "4 cloves garlic, minced", estimatedPrice: 4 },
      { item: "2 tbsp soy sauce", estimatedPrice: 3 },
      { item: "1 tbsp vinegar", estimatedPrice: 2 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Pan-fry the tokwa until golden, then set aside.", estimatedTime: "7 minutes" },
      { instruction: "Saute garlic, then add soy sauce and vinegar.", estimatedTime: "3 minutes" },
      { instruction: "Add kangkong stems first, then the leaves.", estimatedTime: "5 minutes" },
      { instruction: "Return the tokwa and toss for one minute.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Sinigang na Bangus with Gabi",
    tags: ["light", "heart"],
    cookTime: "35 minutes",
    baseCalories: 340,
    baseProtein: 27,
    ingredients: [
      { item: "1 bangus slice (about 120g)", estimatedPrice: 42 },
      { item: "1 small gabi, peeled and quartered", estimatedPrice: 8 },
      { item: "1 bundle kangkong", estimatedPrice: 12 },
      { item: "1 medium tomato, quartered", estimatedPrice: 5 },
      { item: "5 pieces sitaw", estimatedPrice: 8 },
      { item: "1 pack sinigang mix", estimatedPrice: 8 },
    ],
    steps: [
      { instruction: "Boil 3 cups water with tomato and gabi.", estimatedTime: "12 minutes" },
      { instruction: "Add sinigang mix and the bangus slice.", estimatedTime: "10 minutes" },
      { instruction: "Add sitaw, then kangkong at the very end.", estimatedTime: "6 minutes" },
    ],
  },
  {
    name: "Chicken Afritada with Carrot and Potato",
    tags: ["high-protein", "budget"],
    cookTime: "40 minutes",
    baseCalories: 400,
    baseProtein: 29,
    ingredients: [
      { item: "150g chicken, cut into pieces", estimatedPrice: 38 },
      { item: "1 small potato, cubed", estimatedPrice: 8 },
      { item: "1 small carrot, sliced", estimatedPrice: 8 },
      { item: "1/2 red bell pepper, sliced", estimatedPrice: 10 },
      { item: "1/4 cup tomato sauce", estimatedPrice: 8 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
    ],
    steps: [
      { instruction: "Saute garlic, then brown the chicken pieces.", estimatedTime: "8 minutes" },
      { instruction: "Add tomato sauce and 1 cup water, then simmer.", estimatedTime: "18 minutes" },
      { instruction: "Add potato and carrot until fork-tender.", estimatedTime: "10 minutes" },
      { instruction: "Add bell pepper and season with salt.", estimatedTime: "3 minutes" },
    ],
  },
];

const DINNER = [
  {
    name: "Grilled Tilapia with Ensaladang Talong",
    tags: ["light", "heart", "low-carb"],
    cookTime: "30 minutes",
    baseCalories: 320,
    baseProtein: 30,
    ingredients: [
      { item: "1 medium tilapia (about 200g)", estimatedPrice: 45 },
      { item: "1 medium talong (eggplant)", estimatedPrice: 15 },
      { item: "1 small tomato, diced", estimatedPrice: 5 },
      { item: "1/4 onion, diced", estimatedPrice: 3 },
      { item: "1 tbsp vinegar", estimatedPrice: 2 },
      { item: "1 pinch salt and pepper", estimatedPrice: 1 },
    ],
    steps: [
      { instruction: "Season the tilapia with salt and grill both sides.", estimatedTime: "16 minutes" },
      { instruction: "Grill the talong until soft, then peel and slice.", estimatedTime: "8 minutes" },
      { instruction: "Toss talong with tomato, onion, and vinegar.", estimatedTime: "4 minutes" },
    ],
  },
  {
    name: "Ginisang Munggo with Kalabasa",
    tags: ["vegetarian", "budget", "heart"],
    cookTime: "35 minutes",
    baseCalories: 330,
    baseProtein: 19,
    ingredients: [
      { item: "1/2 cup dried monggo (mung beans)", estimatedPrice: 12 },
      { item: "1 cup cubed kalabasa", estimatedPrice: 10 },
      { item: "1 cup chopped pechay", estimatedPrice: 8 },
      { item: "1 small tomato, chopped", estimatedPrice: 5 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Boil the monggo in 3 cups water until soft.", estimatedTime: "20 minutes" },
      { instruction: "Saute garlic and tomato, then add the monggo.", estimatedTime: "5 minutes" },
      { instruction: "Add kalabasa and simmer until tender.", estimatedTime: "8 minutes" },
      { instruction: "Stir in pechay and season with salt.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Nilagang Manok with Pechay and Kamote",
    tags: ["high-protein", "light"],
    cookTime: "40 minutes",
    baseCalories: 380,
    baseProtein: 31,
    ingredients: [
      { item: "150g chicken, bone-in", estimatedPrice: 38 },
      { item: "1 small kamote, cubed", estimatedPrice: 10 },
      { item: "1 cup chopped pechay", estimatedPrice: 8 },
      { item: "1/2 onion, quartered", estimatedPrice: 4 },
      { item: "1 corn on the cob, halved", estimatedPrice: 15 },
      { item: "1 tbsp fish sauce", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Boil the chicken and onion in 4 cups water.", estimatedTime: "22 minutes" },
      { instruction: "Add corn and kamote until tender.", estimatedTime: "12 minutes" },
      { instruction: "Add pechay and season with fish sauce.", estimatedTime: "4 minutes" },
    ],
    filler: "kamote",
  },
  {
    name: "Tortang Giniling with Sayote",
    tags: ["budget", "high-protein"],
    cookTime: "25 minutes",
    baseCalories: 360,
    baseProtein: 25,
    ingredients: [
      { item: "100g ground pork or chicken", estimatedPrice: 32 },
      { item: "2 eggs", estimatedPrice: 18 },
      { item: "1 small sayote, grated", estimatedPrice: 12 },
      { item: "1 small carrot, grated", estimatedPrice: 8 },
      { item: "1/4 onion, chopped", estimatedPrice: 3 },
      { item: "1 tsp cooking oil", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Cook the ground meat with onion until dry.", estimatedTime: "8 minutes" },
      { instruction: "Mix the meat with grated sayote, carrot, and eggs.", estimatedTime: "4 minutes" },
      { instruction: "Pan-fry in small portions until golden on both sides.", estimatedTime: "10 minutes" },
    ],
  },
  {
    name: "Inihaw na Galunggong with Ensaladang Kamatis",
    tags: ["budget", "light", "heart"],
    cookTime: "25 minutes",
    baseCalories: 310,
    baseProtein: 28,
    ingredients: [
      { item: "2 pieces galunggong (about 180g)", estimatedPrice: 35 },
      { item: "2 medium tomatoes, sliced", estimatedPrice: 10 },
      { item: "1/2 onion, sliced thin", estimatedPrice: 4 },
      { item: "1 tbsp vinegar", estimatedPrice: 2 },
      { item: "1 pinch rock salt", estimatedPrice: 1 },
    ],
    steps: [
      { instruction: "Rub the galunggong with rock salt.", estimatedTime: "3 minutes" },
      { instruction: "Grill each side until the skin is crisp.", estimatedTime: "14 minutes" },
      { instruction: "Toss tomato and onion with vinegar for the salad.", estimatedTime: "4 minutes" },
    ],
  },
  {
    name: "Chicken Curry with Kalabasa and Sitaw",
    tags: ["high-protein"],
    cookTime: "40 minutes",
    baseCalories: 420,
    baseProtein: 30,
    ingredients: [
      { item: "150g chicken, cut into pieces", estimatedPrice: 38 },
      { item: "1 cup cubed kalabasa", estimatedPrice: 10 },
      { item: "6 pieces sitaw, cut into 2-inch pieces", estimatedPrice: 8 },
      { item: "1/4 cup coconut milk", estimatedPrice: 12 },
      { item: "1 tsp curry powder", estimatedPrice: 5 },
      { item: "3 cloves garlic, minced", estimatedPrice: 3 },
    ],
    steps: [
      { instruction: "Saute garlic, then brown the chicken pieces.", estimatedTime: "8 minutes" },
      { instruction: "Add curry powder and 1/2 cup water, then simmer.", estimatedTime: "16 minutes" },
      { instruction: "Add kalabasa and sitaw until tender.", estimatedTime: "10 minutes" },
      { instruction: "Pour in coconut milk and simmer briefly.", estimatedTime: "4 minutes" },
    ],
  },
];

const SNACK = [
  {
    name: "Saba Banana with Peanut Butter",
    tags: ["budget", "light"],
    cookTime: "5 minutes",
    baseCalories: 180,
    baseProtein: 6,
    ingredients: [
      { item: "1 medium saba banana", estimatedPrice: 12 },
      { item: "1 tbsp natural peanut butter", estimatedPrice: 8 },
    ],
    steps: [
      { instruction: "Peel the saba banana and slice into rounds.", estimatedTime: "2 minutes" },
      { instruction: "Spread peanut butter on each slice and serve.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Boiled Egg with Cucumber Slices",
    tags: ["high-protein", "light"],
    cookTime: "12 minutes",
    baseCalories: 140,
    baseProtein: 12,
    ingredients: [
      { item: "1 boiled egg", estimatedPrice: 9 },
      { item: "1/2 medium cucumber, sliced", estimatedPrice: 8 },
      { item: "1 pinch rock salt", estimatedPrice: 1 },
    ],
    steps: [
      { instruction: "Boil the egg for 8–10 minutes, then peel.", estimatedTime: "10 minutes" },
      { instruction: "Slice the egg and cucumber, sprinkle with salt.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Fresh Papaya and Calamansi Cup",
    tags: ["vegetarian", "light", "heart"],
    cookTime: "8 minutes",
    baseCalories: 120,
    baseProtein: 2,
    ingredients: [
      { item: "1 cup ripe papaya, cubed", estimatedPrice: 15 },
      { item: "1 tsp calamansi juice", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Cube the papaya and place in a bowl.", estimatedTime: "5 minutes" },
      { instruction: "Drizzle calamansi juice and toss gently.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Boiled Mais (Corn Cob)",
    tags: ["vegetarian", "budget"],
    cookTime: "15 minutes",
    baseCalories: 150,
    baseProtein: 4,
    ingredients: [
      { item: "1 small corn cob (mais)", estimatedPrice: 15 },
      { item: "1 pinch salt", estimatedPrice: 1 },
    ],
    steps: [
      { instruction: "Boil the corn in salted water until tender.", estimatedTime: "12 minutes" },
      { instruction: "Drain and serve warm.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Kamote Bites with Yogurt Dip",
    tags: ["vegetarian", "budget"],
    cookTime: "20 minutes",
    baseCalories: 170,
    baseProtein: 5,
    ingredients: [
      { item: "1 small kamote, cubed", estimatedPrice: 12 },
      { item: "3 tbsp plain yogurt", estimatedPrice: 10 },
      { item: "1 pinch cinnamon (optional)", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Steam or boil kamote cubes until soft.", estimatedTime: "15 minutes" },
      { instruction: "Serve with plain yogurt and a pinch of cinnamon.", estimatedTime: "3 minutes" },
    ],
  },
  {
    name: "Fresh Mango with Roasted Peanuts",
    tags: ["budget", "light"],
    cookTime: "5 minutes",
    baseCalories: 160,
    baseProtein: 4,
    ingredients: [
      { item: "1/2 cup ripe mango, sliced", estimatedPrice: 18 },
      { item: "1 tbsp roasted peanuts, crushed", estimatedPrice: 6 },
    ],
    steps: [
      { instruction: "Slice the ripe mango into bite-size pieces.", estimatedTime: "3 minutes" },
      { instruction: "Top with crushed peanuts and serve.", estimatedTime: "1 minute" },
    ],
  },
  {
    name: "Tokwa Cubes with Toyomansi Dip",
    tags: ["vegetarian", "high-protein"],
    cookTime: "12 minutes",
    baseCalories: 130,
    baseProtein: 14,
    ingredients: [
      { item: "80g tokwa (firm tofu), cubed", estimatedPrice: 12 },
      { item: "1 tbsp soy sauce", estimatedPrice: 3 },
      { item: "1 tsp calamansi juice", estimatedPrice: 2 },
    ],
    steps: [
      { instruction: "Pan-fry tokwa cubes until lightly golden.", estimatedTime: "8 minutes" },
      { instruction: "Mix soy sauce and calamansi for dipping.", estimatedTime: "2 minutes" },
    ],
  },
  {
    name: "Malunggay Smoothie with Banana",
    tags: ["vegetarian", "heart"],
    cookTime: "8 minutes",
    baseCalories: 150,
    baseProtein: 4,
    ingredients: [
      { item: "1/2 cup malunggay leaves", estimatedPrice: 8 },
      { item: "1/2 saba banana", estimatedPrice: 8 },
      { item: "1/2 cup water or low-fat milk", estimatedPrice: 6 },
    ],
    steps: [
      { instruction: "Blend malunggay, banana, and liquid until smooth.", estimatedTime: "5 minutes" },
      { instruction: "Serve chilled in a glass.", estimatedTime: "2 minutes" },
    ],
  },
];

const POOLS = { Breakfast: BREAKFAST, Lunch: LUNCH, Dinner: DINNER, Snack: SNACK };

function getRequiredTag(categoryTitle) {
  const category = String(categoryTitle || "").toLowerCase();
  if (category.includes("vegetarian")) return "vegetarian";
  if (category.includes("high-protein") || category.includes("muscle")) {
    return "high-protein";
  }
  if (category.includes("low-carb")) return "low-carb";
  if (category.includes("budget") || category.includes("student")) return "budget";
  if (category.includes("heart") || category.includes("diabetic")) return "heart";
  if (category.includes("weight loss") || category.includes("weight-loss")) {
    return "light";
  }
  return "";
}

function normalizeAllergyTerm(allergy) {
  return String(allergy || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function textMatchesAllergy(text, allergy) {
  const term = normalizeAllergyTerm(allergy);
  if (!term) return false;
  if (text.includes(term)) return true;

  if (term.endsWith("s") && text.includes(term.slice(0, -1))) return true;
  if (!term.endsWith("s") && text.includes(`${term}s`)) return true;

  if (term.includes("peanut") || term === "mani") {
    return /peanut|mani\b/.test(text);
  }
  if (term.includes("nut")) {
    return /\bnuts?\b|mani\b|peanut/.test(text);
  }
  if (term.includes("egg")) {
    return /\begg/.test(text);
  }
  if (term.includes("milk") || term.includes("dairy")) {
    return /\bmilk\b|dairy|yogurt|cheese|gatas/.test(text);
  }
  if (term.includes("soy")) {
    return /\bsoy|tofu|tokwa|toyo\b/.test(text);
  }
  if (term.includes("seafood") || term.includes("fish")) {
    return /\bfish|seafood|hipon|isda|tinapa|galunggong|bangus|tilapia|shrimp|crab/.test(text);
  }

  return false;
}

function hasAllergen(recipe, allergies) {
  const list = (Array.isArray(allergies) ? allergies : [])
    .map(normalizeAllergyTerm)
    .filter(Boolean);
  if (!list.length) return false;

  const text = [recipe.name, ...recipe.ingredients.map((i) => i.item)]
    .join(" ")
    .toLowerCase();

  return list.some((allergy) => textMatchesAllergy(text, allergy));
}

/**
 * @returns {{name: string, ingredients: {item: string, estimatedPrice: number}[],
 *   estimatedTotal: number, estimatedCookTime: string, estimatedCalories: number,
 *   estimatedProteinGrams: number, steps: {instruction: string, estimatedTime: string}[]}}
 */
export function buildLocalRecipe({
  meal,
  categoryTitle,
  dayIndex = 0,
  variant = 0,
  targetCalories = 0,
  allergies = [],
}) {
  const pool = POOLS[meal] || LUNCH;
  const requiredTag = getRequiredTag(categoryTitle);

  const byTag = requiredTag
    ? pool.filter((recipe) => recipe.tags.includes(requiredTag))
    : pool;
  const safePool = pool.filter((recipe) => !hasAllergen(recipe, allergies));
  const allowed = byTag.filter((recipe) => !hasAllergen(recipe, allergies));
  const candidates = allowed.length
    ? allowed
    : safePool;
  const finalPool = candidates.length ? candidates : safePool;
  if (!finalPool.length) {
    return {
      name: "Fresh Seasonal Fruit",
      ingredients: [{ item: "1 cup seasonal fruit (papaya or banana)", estimatedPrice: 20 }],
      estimatedTotal: 20,
      estimatedCookTime: "5 min",
      estimatedCalories: 120,
      estimatedProteinGrams: 2,
      steps: [{ instruction: "Wash, peel if needed, and serve fresh.", estimatedTime: "5 min" }],
    };
  }

  const recipe = finalPool[(dayIndex + variant) % finalPool.length];
  const ingredients = recipe.ingredients.map((ingredient) => ({ ...ingredient }));

  let calories = recipe.baseCalories;
  let protein = recipe.baseProtein;

  const target = Number(targetCalories);
  const filler = FILLERS[recipe.filler || "rice"];
  if (Number.isFinite(target) && target > calories + 60) {
    const rawUnits = (target - calories) / filler.kcalPerUnit;
    const units = Math.min(
      filler.max,
      Math.max(
        filler.step,
        Math.round(rawUnits / filler.step) * filler.step,
      ),
    );

    ingredients.push({
      item: filler.label(units),
      estimatedPrice: Math.round(units * filler.pricePerUnit),
    });
    calories += Math.round(units * filler.kcalPerUnit);
    protein += Math.round(units * filler.proteinPerUnit);
  }

  return {
    name: recipe.name,
    ingredients,
    estimatedTotal: ingredients.reduce(
      (sum, ingredient) => sum + (Number(ingredient.estimatedPrice) || 0),
      0,
    ),
    estimatedCookTime: recipe.cookTime,
    estimatedCalories: calories,
    estimatedProteinGrams: protein,
    steps: recipe.steps.map((step) => ({ ...step })),
  };
}
