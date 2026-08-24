export function classifyBmi(bmi) {
  if (!Number.isFinite(bmi) || bmi <= 0) return null;
  if (bmi < 18.5) {
    return {
      key: "underweight",
      label: "Underweight",
      hint: "This may indicate a nutrition risk. Consider nutrient-dense meals and professional advice.",
    };
  }
  if (bmi < 25) {
    return {
      key: "normal",
      label: "Normal",
      hint: "You're in a healthy BMI range. Keep balanced meals.",
    };
  }
  if (bmi < 30) {
    return {
      key: "overweight",
      label: "Overweight",
      hint: "Consider balanced meals that support gradual weight management.",
    };
  }
  return {
    key: "obese",
    label: "Obese",
    hint: "This range can carry added health risks. Consider gradual changes with professional guidance.",
  };
}

function getActivityFactor(activityLevel) {
  const activity = String(activityLevel || "").toLowerCase();
  if (activity.includes("athlete") || activity.includes("daily intense")) return 1.9;
  if (activity.includes("physically demanding")) return 1.725;
  if (activity.includes("gym") || activity.includes("5-6x")) return 1.725;
  if (activity.includes("moderately") || activity.includes("3-4x")) return 1.55;
  if (activity.includes("lightly") || activity.includes("walking/chores")) return 1.375;
  return 1.2;
}

function getGoalAdjustment(bodyGoal) {
  const goal = String(bodyGoal || "").toLowerCase();
  if (goal.includes("lose weight")) return -500;
  if (goal.includes("body recomposition")) return -200;
  if (goal.includes("tone body")) return -250;
  if (goal.includes("gain weight") || goal.includes("build muscle")) return 300;
  return 0;
}

export function estimateDailyCalories({
  age,
  heightCm,
  weightKg,
  gender,
  activityLevel,
  bodyGoal,
}) {
  const ageNum = Number(age);
  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);
  if (
    !Number.isFinite(ageNum) ||
    !Number.isFinite(heightNum) ||
    !Number.isFinite(weightNum) ||
    ageNum <= 0 ||
    heightNum <= 0 ||
    weightNum <= 0 ||
    !["female", "male"].includes(gender)
  ) {
    return null;
  }

  // Mifflin-St Jeor BMR, adjusted using the selected activity level.
  const sexConstant = gender === "male" ? 5 : -161;
  const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + sexConstant;
  const maintenance = Math.round(bmr * getActivityFactor(activityLevel));
  const rawTarget = maintenance + getGoalAdjustment(bodyGoal);
  const minimum = gender === "male" ? 1500 : 1200;

  return {
    maintenance,
    target: Math.max(minimum, Math.round(rawTarget)),
    adjustment: getGoalAdjustment(bodyGoal),
  };
}

export function computeBmi(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) {
    return null;
  }
  const meters = h / 100;
  return w / (meters * meters);
}

export function getBmiGoalCaution(bodyGoal, bmi, bmiCategory) {
  const goal = String(bodyGoal || "").toLowerCase();
  const categoryKey = String(bmiCategory?.key || bmiCategory || "").toLowerCase();
  const bmiText = Number.isFinite(bmi) ? bmi.toFixed(1) : "";

  if (categoryKey === "underweight" && goal.includes("lose weight")) {
    return {
      title: "Your goal may not match your BMI",
      message: `Your BMI is ${bmiText} (Underweight). Choosing Lose Weight may lower your weight further. A gradual Gain Weight or Stay Healthy goal may be safer. Are you sure you want to continue?`,
    };
  }

  if (categoryKey === "underweight" && goal.includes("maintain weight")) {
    return {
      title: "Maintain weight while underweight?",
      message: `Your BMI is ${bmiText} (Underweight). Maintaining your current weight may keep you below the healthy BMI range. A gradual Gain Weight goal may be more suitable. Are you sure you want to continue?`,
    };
  }

  if (
    ["overweight", "obese"].includes(categoryKey) &&
    goal.includes("gain weight")
  ) {
    return {
      title: "Gain weight while overweight?",
      message: `Your BMI is ${bmiText} (${categoryKey === "obese" ? "Obese" : "Overweight"}). Gaining more weight may increase health risks. A Lose Weight, Body Recomposition, or Stay Healthy goal may be more suitable. Are you sure you want to continue?`,
    };
  }

  if (
    ["overweight", "obese"].includes(categoryKey) &&
    goal.includes("maintain weight")
  ) {
    return {
      title: "Maintain weight while overweight?",
      message: `Your BMI is ${bmiText} (${categoryKey === "obese" ? "Obese" : "Overweight"}). Maintaining your current weight may keep you above the healthy BMI range. A Lose Weight, Body Recomposition, or Stay Healthy goal may be more suitable. Are you sure you want to continue?`,
    };
  }

  return null;
}

/** @returns {string|null} error message, or null if valid */
export function validateBmiInputs({ age, heightCm, weightKg, gender }) {
  const ageNum = Number(age);
  if (!String(age || "").trim() || !Number.isFinite(ageNum) || ageNum < 1) {
    return "Please enter your age.";
  }
  if (ageNum > 120) {
    return "Please enter a valid age (1–120).";
  }
  if (!gender || !["female", "male"].includes(gender)) {
    return "Please select your gender.";
  }
  const heightNum = Number(heightCm);
  if (
    !String(heightCm || "").trim() ||
    !Number.isFinite(heightNum) ||
    heightNum < 50
  ) {
    return "Please enter your height in cm.";
  }
  if (heightNum > 250) {
    return "Please enter a valid height (50–250 cm).";
  }
  const weightNum = Number(weightKg);
  if (
    !String(weightKg || "").trim() ||
    !Number.isFinite(weightNum) ||
    weightNum < 1
  ) {
    return "Please enter your weight in kg.";
  }
  if (weightNum > 400) {
    return "Please enter a valid weight (1–400 kg).";
  }
  if (computeBmi(heightCm, weightKg) == null) {
    return "Please enter valid height and weight for BMI.";
  }
  return null;
}
