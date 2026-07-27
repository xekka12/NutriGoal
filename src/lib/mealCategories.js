const imageSet = {
  vegetarian:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  balanced:
    "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80",
  highProtein:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
  lowBudget:
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
  lowCarb:
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80",
  diabetic:
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80",
  heartHealthy:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
  studentBudget:
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80",
  weightLoss:
    "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=900&q=80",
  muscleGain:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
};

export const MEAL_CATEGORIES = [
  {
    slug: "vegetarian",
    title: "Vegetarian Meals",
    badge: { label: "Fresh", variant: "fresh" },
    description:
      "Plant-based goodness focused on seasonal greens and whole grains.",
    image: imageSet.vegetarian,
    alt: "Overhead shot of a vibrant colorful salad with fresh greens, cherry tomatoes, and bell peppers in a ceramic bowl",
    tags: ["plant-based", "fiber", "healthy", "no-meat"],
  },
  {
    slug: "mixed",
    title: "Mixed Balanced Meals",
    badge: { label: "Balanced", variant: "balanced" },
    description:
      "The perfect balance of lean proteins, healthy fats, and complex carbs.",
    image: imageSet.balanced,
    alt: "Grilled chicken breast sliced served with roasted broccoli and carrots on a modern minimalist white plate",
    tags: ["balanced", "maintain", "general", "everyday"],
  },
  {
    slug: "high-protein",
    title: "High-Protein Meals",
    badge: { label: "Active", variant: "active" },
    description:
      "Fuel your muscles with premium protein sources and vital nutrients.",
    image: imageSet.highProtein,
    alt: "Seared steak with eggs and avocado served on a clean ceramic platter with herbs sprinkled on top",
    tags: ["protein", "gym", "athlete", "muscle", "bulking"],
  },
  {
    slug: "low-budget",
    title: "Low-Budget Meals",
    badge: { label: "Smart", variant: "smart" },
    description:
      "Delicious, healthy meals that don't break the bank. Nutritious and savvy.",
    image: imageSet.lowBudget,
    alt: "Simple bowl of rice and beans with corn and salsa, shot with natural soft morning light",
    tags: ["budget", "affordable", "student", "cheap"],
  },
  {
    slug: "low-carb",
    title: "Low-Carb Meals",
    badge: { label: "Lean", variant: "balanced" },
    description:
      "Lower-carb plates with vegetables and protein for lighter meal planning.",
    image: imageSet.lowCarb,
    alt: "Fresh vegetables prepared for a low-carb meal",
    tags: ["low-carb", "cutting", "lose-weight", "lean"],
  },
  {
    slug: "diabetic-friendly",
    title: "Diabetic-Friendly Meals",
    badge: { label: "Low Sugar", variant: "fresh" },
    description:
      "Balanced meals focused on lower sugar, fiber, and steady energy.",
    image: imageSet.diabetic,
    alt: "Balanced diabetic-friendly meal with vegetables and lean protein",
    tags: ["diabetic", "low-sugar", "steady-energy", "health"],
  },
  {
    slug: "heart-healthy",
    title: "Heart-Healthy Meals",
    badge: { label: "Heart", variant: "active" },
    description:
      "Meals with lean protein, vegetables, and lower sodium choices.",
    image: imageSet.heartHealthy,
    alt: "Heart-healthy meal with lean protein and vegetables",
    tags: ["heart", "low-sodium", "healthy", "lean"],
  },
  {
    slug: "student-budget",
    title: "Student Budget Meals",
    badge: { label: "Student", variant: "smart" },
    description:
      "Affordable, simple meals for students with limited time and budget.",
    image: imageSet.studentBudget,
    alt: "Affordable student meal in a bowl",
    tags: ["budget", "student", "affordable", "simple"],
  },
  {
    slug: "weight-loss",
    title: "Weight Loss Meals",
    badge: { label: "Light", variant: "fresh" },
    description: "Lower-calorie meals that still feel filling and practical.",
    image: imageSet.weightLoss,
    alt: "Light meal with vegetables for weight management",
    tags: ["lose-weight", "cutting", "calorie-deficit", "light"],
  },
  {
    slug: "muscle-gain",
    title: "Muscle Gain Meals",
    badge: { label: "Bulk", variant: "active" },
    description:
      "Protein-rich meals with enough carbs to support training and recovery.",
    image: imageSet.muscleGain,
    alt: "Protein-rich meal for muscle gain",
    tags: ["bulking", "muscle", "gain-weight", "gym", "athlete"],
  },
];

export function getCategoryBySlug(slug) {
  return MEAL_CATEGORIES.find((category) => category.slug === slug) || null;
}
