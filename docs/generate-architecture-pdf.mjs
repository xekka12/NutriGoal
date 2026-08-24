import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "..", "NutriGoal_System_Architecture.pdf");

const GREEN = [16, 122, 79];
const GREEN_DARK = [6, 46, 32];
const GREEN_SOFT = [232, 245, 236];
const LINE = [180, 198, 186];
const TEXT = [28, 39, 34];
const MUTED = [90, 108, 98];
const WHITE = [255, 255, 255];
const CARD = [248, 252, 248];

function hexFill(doc, rgb) {
  doc.setFillColor(...rgb);
  doc.setDrawColor(...rgb);
}

function pageHeader(doc, title) {
  hexFill(doc, GREEN_DARK);
  doc.rect(0, 0, 210, 22, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("NutriGoal  |  Smart Meal Planner", 14, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(title, 14, 16.5);
  doc.setTextColor(...TEXT);
}

function pageFooter(doc, page, total) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Updated System Flowchart / Architecture Diagram", 14, 287);
  doc.text(`Page ${page} of ${total}`, 196, 287, { align: "right" });
  doc.setTextColor(...TEXT);
}

function roundedBox(doc, x, y, w, h, title, lines = [], fill = GREEN_SOFT) {
  doc.setFillColor(...fill);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, h, 2.2, 2.2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.4);
  doc.setTextColor(...GREEN_DARK);
  doc.text(title, x + w / 2, y + 6.2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(...MUTED);
  lines.forEach((line, i) => {
    doc.text(line, x + w / 2, y + 11.2 + i * 3.6, { align: "center" });
  });
  doc.setTextColor(...TEXT);
}

function arrowDown(doc, x, y1, y2) {
  doc.setDrawColor(...GREEN);
  doc.setFillColor(...GREEN);
  doc.setLineWidth(0.7);
  doc.line(x, y1, x, y2 - 2.2);
  doc.triangle(x - 1.6, y2 - 2.4, x + 1.6, y2 - 2.4, x, y2, "F");
}

function arrowRight(doc, x1, x2, y) {
  doc.setDrawColor(...GREEN);
  doc.setFillColor(...GREEN);
  doc.setLineWidth(0.7);
  doc.line(x1, y, x2 - 2.2, y);
  doc.triangle(x2 - 2.4, y - 1.6, x2 - 2.4, y + 1.6, x2, y, "F");
}

function arrowLeft(doc, x1, x2, y) {
  doc.setDrawColor(...GREEN);
  doc.setFillColor(...GREEN);
  doc.setLineWidth(0.7);
  doc.line(x1 + 2.2, y, x2, y);
  doc.triangle(x1 + 2.4, y - 1.6, x1 + 2.4, y + 1.6, x1, y, "F");
}

function sectionTitle(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...GREEN_DARK);
  doc.text(text, 14, y);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(14, y + 2, 196, y + 2);
  doc.setTextColor(...TEXT);
}

function body(doc, text, y, maxWidth = 182) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 14, y);
  return y + lines.length * 5 + 2;
}

const doc = new jsPDF({ unit: "mm", format: "a4" });
const TOTAL = 5;

/* ---------------- PAGE 1 COVER ---------------- */
hexFill(doc, GREEN_DARK);
doc.rect(0, 0, 210, 297, "F");
doc.setFillColor(16, 122, 79);
doc.rect(0, 0, 8, 297, "F");
doc.setTextColor(...WHITE);
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("CAPSTONE / SYSTEM DOCUMENTATION", 24, 48);
doc.setFontSize(24);
doc.text("Updated System Flowchart", 24, 70);
doc.text("& Architecture Diagram", 24, 82);
doc.setFont("helvetica", "normal");
doc.setFontSize(13);
doc.text("NutriGoal  —  Smart Meal Planner", 24, 100);
doc.setFontSize(10);
doc.text("A web-based healthy meal recommender that uses user profile,", 24, 116);
doc.text("budget, and AI to generate 1-day or 7-day Filipino meal plans.", 24, 122);

const facts = [
  ["Frontend", "React 19 + Vite + React Router"],
  ["Database / Auth", "Supabase (PostgreSQL + Auth + RLS)"],
  ["AI Generator", "Groq API (openai/gpt-oss-20b)"],
  ["Email OTP", "Google Apps Script + Brevo"],
  ["Export", "jsPDF meal-plan download"],
];
facts.forEach((row, i) => {
  const y = 148 + i * 12;
  doc.setFillColor(12, 72, 50);
  doc.roundedRect(24, y - 6, 162, 10, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(row[0], 30, y);
  doc.setFont("helvetica", "normal");
  doc.text(row[1], 78, y);
});

doc.setFontSize(9);
doc.text(`Generated ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`, 24, 270);
doc.text("Based on the current NutriGoal source code.", 24, 276);

/* ---------------- PAGE 2 ARCHITECTURE ---------------- */
doc.addPage();
pageHeader(doc, "1. System Architecture");
let y = 32;
y = body(
  doc,
  "This diagram shows the main parts of NutriGoal and how they talk to each other. The browser never stores passwords in a custom table. Login is handled by Supabase Auth. Meal plans are saved as JSON in the saved_meal_plans table.",
  y,
);

roundedBox(doc, 62, 54, 86, 22, "User (Browser / Phone)", ["Chrome / mobile web", "React SPA on Vite"]);

arrowDown(doc, 105, 76, 86);
roundedBox(doc, 52, 86, 106, 28, "NutriGoal Web App", [
  "Login, Register, Splash, Dashboard",
  "Meal Plan, History, Saved Plans, PDF",
]);

arrowDown(doc, 70, 114, 128);
arrowDown(doc, 105, 114, 128);
arrowDown(doc, 140, 114, 128);

roundedBox(doc, 14, 128, 54, 32, "Supabase", [
  "Auth (email/password)",
  "saved_meal_plans table",
  "Row Level Security",
]);
roundedBox(doc, 78, 128, 54, 32, "Groq AI", [
  "Daily / weekly meal JSON",
  "Swap one meal/snack",
  "Budget + allergy rules",
]);
roundedBox(doc, 142, 128, 54, 32, "OTP Service", [
  "Apps Script endpoint",
  "Brevo email send",
  "Register / reset password",
]);

arrowDown(doc, 41, 160, 174);
arrowDown(doc, 169, 160, 174);

roundedBox(doc, 14, 174, 54, 26, "PostgreSQL", ["Plan JSON + is_saved flag"]);
roundedBox(doc, 142, 174, 54, 26, "User Email Inbox", ["OTP codes via Brevo"]);

doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(...GREEN_DARK);
doc.text("Request flow (simplified)", 14, 214);
doc.setFont("helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(...TEXT);
const archNotes = [
  "1. Guest opens /login → splash animation → login form.",
  "2. After login, ProtectedRoute allows Dashboard, Meal Plan, History, Saved Plans.",
  "3. Generate Meal Plan sends profile + budget + meals to Groq; fallback uses local recipes.",
  "4. Generated plans are inserted into saved_meal_plans (history). Save marks is_saved = true.",
  "5. Swap Meal calls Groq for one slot only, then updates that meal in the same plan row.",
  "6. Register / forgot password uses the OTP Apps Script; Groq is not used for auth.",
];
archNotes.forEach((line, i) => doc.text(line, 14, 222 + i * 6.2));
pageFooter(doc, 2, TOTAL);

/* ---------------- PAGE 3 USER FLOW ---------------- */
doc.addPage();
pageHeader(doc, "2. User System Flowchart");
y = 32;
y = body(
  doc,
  "This is the main user journey. Each box is a screen or decision in the current app.",
  y,
);

const col1 = 22;
roundedBox(doc, col1, 48, 70, 16, "Open App", ["localhost / hosted URL"]);
arrowDown(doc, 57, 64, 72);
roundedBox(doc, col1, 72, 70, 16, "Animated Splash", ["Leaves + loading 0–100%"]);
arrowDown(doc, 57, 88, 96);
roundedBox(doc, col1, 96, 70, 16, "Login or Register", ["Supabase Auth + OTP"]);
arrowDown(doc, 57, 112, 120);
roundedBox(doc, col1, 120, 70, 18, "Dashboard", ["Activity, goal, health,", "allergies, BMI"]);
arrowDown(doc, 57, 138, 146);
roundedBox(doc, col1, 146, 70, 18, "Meal Plan Setup", ["1 day / 7 days, meals,", "optional snack, budget"]);
arrowDown(doc, 57, 164, 172);
roundedBox(doc, col1, 172, 70, 16, "Generate Plan (AI)", ["Progress modal + Groq"]);
arrowDown(doc, 57, 188, 196);
roundedBox(doc, col1, 196, 70, 18, "View Plan", ["Daily kcal, protein,", "₱ total vs budget"]);
arrowDown(doc, 57, 214, 222);
roundedBox(doc, col1, 222, 70, 16, "Save / History / PDF", ["Supabase + jsPDF"]);

roundedBox(doc, 118, 96, 74, 22, "Already logged in?", ["Yes → skip login", "go to Dashboard"]);
roundedBox(doc, 118, 146, 74, 28, "Snack option", ["No snack (default)", "or Include snack", "+₱85/day suggested"]);
roundedBox(doc, 118, 196, 74, 32, "Swap Meal", ["If a recipe is unavailable", "AI replaces that slot", "then Save meal"]);
roundedBox(doc, 118, 236, 74, 22, "Logout / session", ["Supabase auth session"]);

doc.setDrawColor(...GREEN);
doc.setLineWidth(0.5);
doc.line(92, 104, 118, 104);
doc.line(92, 160, 118, 160);
doc.line(92, 205, 118, 212);
pageFooter(doc, 3, TOTAL);

/* ---------------- PAGE 4 GENERATION FLOW ---------------- */
doc.addPage();
pageHeader(doc, "3. Meal Generation Sequence");
y = 32;
y = body(
  doc,
  "When the user taps Generate, NutriGoal builds a plan from profile filters, calorie target, and budget. Weekly plans call Groq once per day so the JSON does not get cut off.",
  y,
);

const steps = [
  ["A", "Validate form", "Meals (1–3), snack optional, budget ≥ minimum, BMI inputs, restrictions."],
  ["B", "Compute targets", "Daily calories from BMI/activity/goal. Budget split per meal; snack ~14% of daily budget."],
  ["C", "Call Groq", "Daily: 1 request. Weekly: 7 sequential day requests with progress (Planning Day X of 7)."],
  ["D", "Normalize JSON", "Force Breakfast/Lunch/Dinner/Snack order. One recipe per meal. Realistic PHP prices."],
  ["E", "Allergy + budget rules", "Never use listed allergens. estimatedTotal must stay within each meal cap."],
  ["F", "Fallback", "If Groq fails/rate-limits, built-in Filipino recipes (localRecipes.js) are shown."],
  ["G", "Save to History", "Insert saved_meal_plans with is_saved = false. User can later Save to Saved Plans."],
  ["H", "Swap (optional)", "regenerateSingleMealWithGroq replaces one meal; updateMealPlan writes the same row."],
];

steps.forEach((step, i) => {
  const sy = 52 + i * 26;
  doc.setFillColor(...GREEN);
  doc.circle(22, sy + 6, 5.2, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(step[0], 22, sy + 7.4, { align: "center" });
  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(11);
  doc.text(step[1], 32, sy + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  const wrapped = doc.splitTextToSize(step[2], 160);
  doc.text(wrapped, 32, sy + 10.5);
});
pageFooter(doc, 4, TOTAL);

/* ---------------- PAGE 5 MODULES ---------------- */
doc.addPage();
pageHeader(doc, "4. Modules, Data, and Screens");
sectionTitle(doc, "Frontend screens", 34);
const screens = [
  ["/login", "Splash + Welcome back form"],
  ["/register", "Create account + OTP verify"],
  ["/dashboard", "Profile filters → recommended categories"],
  ["/meal-plan", "Generate 1-day or 7-day plan, snack, swap"],
  ["/history", "All generated plans"],
  ["/saved-plans", "Pinned plans + PDF download"],
  ["/about", "App information"],
];
screens.forEach((row, i) => {
  const sy = 40 + i * 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN_DARK);
  doc.text(row[0], 16, sy);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT);
  doc.text(row[1], 58, sy);
});

sectionTitle(doc, "Important source files", 102);
const files = [
  ["src/App.jsx", "Routes, Guest vs Protected"],
  ["src/login/LoginPage.jsx", "Splash overlay then Login"],
  ["src/mealfolder/Dashboard.jsx", "Profile + category recommend"],
  ["src/mealfolder/MealPlan.jsx", "Generate, budget, snack"],
  ["src/lib/groqMealPlan.js", "AI generate + swap one meal"],
  ["src/lib/mealPlanDb.js", "Supabase insert/update/fetch"],
  ["src/lib/budgetTier.js", "Suggested budget + snack share"],
  ["src/lib/otpClient.js", "Apps Script OTP calls"],
];
files.forEach((row, i) => {
  const sy = 110 + i * 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREEN_DARK);
  doc.text(row[0], 16, sy);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT);
  doc.text(row[1], 88, sy);
});

sectionTitle(doc, "Saved plan JSON (high level)", 180);
const jsonLines = [
  "{ id, categoryTitle, planType: daily|weekly, meals[], includeSnack,",
  "  budget, days[{ day, recommendations[{ meal, suggestedBudget, recipes[] }] }],",
  "  filters: { activity, goal, allergies, BMI, protein, carb, ... }, source }",
];
doc.setFillColor(...CARD);
doc.setDrawColor(...LINE);
doc.roundedRect(14, 186, 182, 28, 2, 2, "FD");
doc.setFont("courier", "normal");
doc.setFontSize(8);
doc.setTextColor(...GREEN_DARK);
jsonLines.forEach((line, i) => doc.text(line, 18, 196 + i * 6));

doc.setFont("helvetica", "italic");
doc.setFontSize(9);
doc.setTextColor(...MUTED);
doc.text(
  "This document reflects the current NutriGoal implementation, including splash, snack, daily price totals, and swap meal.",
  14,
  228,
);
pageFooter(doc, 5, TOTAL);

const buffer = Buffer.from(doc.output("arraybuffer"));
writeFileSync(OUTPUT, buffer);
console.log(`Wrote ${OUTPUT}`);
