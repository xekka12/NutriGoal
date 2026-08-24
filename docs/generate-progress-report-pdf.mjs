import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "..", "NutriGoal_Project_Progress_Report.pdf");

const BLACK = [0, 0, 0];
const GRAY = [70, 70, 70];

function pageFooter(doc, page, total) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Project Progress Report (Current Accomplishments)", 14, 287);
  doc.text(`Page ${page} of ${total}`, 196, 287, { align: "right" });
  doc.setTextColor(...BLACK);
}

function sectionTitle(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BLACK);
  doc.text(text, 14, y);
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.line(14, y + 1.8, 196, y + 1.8);
  return y + 9;
}

function paragraph(doc, text, y, maxWidth = 182) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 14, y);
  return y + lines.length * 5 + 3;
}

function bullet(doc, text, y, indent = 18) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text("•", indent - 5, y);
  const lines = doc.splitTextToSize(text, 196 - indent);
  doc.text(lines, indent, y);
  return y + lines.length * 5 + 1.5;
}

const doc = new jsPDF({ unit: "mm", format: "a4" });
const TOTAL = 3;
const today = new Date().toLocaleDateString("en-PH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/* ---------------- PAGE 1 ---------------- */
doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.text("PROJECT PROGRESS REPORT", 105, 28, { align: "center" });
doc.setFontSize(12);
doc.text("Current Accomplishments", 105, 36, { align: "center" });

doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.text("Project Title: NutriGoal (Smart Meal Planner)", 14, 52);
doc.text(`Date: ${today}`, 14, 59);
doc.text("Document Type: Project Progress Report", 14, 66);

let y = 80;
y = sectionTitle(doc, "1. Project Overview", y);
y = paragraph(
  doc,
  "NutriGoal is a web-based healthy meal recommender that generates personalized Filipino meal plans using the user's profile, budget, allergies, health information, and body goals. This report presents the current accomplishments of the system for project progress submission.",
  y,
);

y = sectionTitle(doc, "2. Completed Major Modules", y + 2);
const modules = [
  "User authentication (register, login, logout, protected routes)",
  "Email OTP support for registration and password reset",
  "Animated splash/opening screen before login",
  "Dashboard profile filters (activity, goal, health status, allergies, BMI)",
  "Meal category recommendation based on user profile",
  "AI meal plan generation for 1-day and 7-day plans",
  "Generation progress modal with live percentage and day status",
  "Budget system with suggested and minimum budget",
  "Optional healthy snack included in the daily budget",
  "Daily totals for calories, protein, and estimated cost",
  "Swap meal feature for unavailable breakfast/lunch/dinner/snack",
  "History and Saved Plans storage using Supabase",
  "PDF export of meal plans",
  "System architecture flowchart documentation",
  "Database ERD/schema documentation",
];
modules.forEach((item) => {
  y = bullet(doc, item, y);
});

pageFooter(doc, 1, TOTAL);

/* ---------------- PAGE 2 ---------------- */
doc.addPage();
y = 24;
y = sectionTitle(doc, "3. Detailed Current Accomplishments", y);

y = sectionTitle(doc, "3.1 User Access and Interface", y + 1);
y = bullet(doc, "Implemented guest and protected routes using Supabase Auth.", y);
y = bullet(doc, "Created login and register pages with responsive mobile layout.", y);
y = bullet(doc, "Added animated splash screen that reveals the login page after loading.", y);
y = bullet(doc, "Integrated OTP email flow for account verification and password reset.", y);

y = sectionTitle(doc, "3.2 Profile-Based Recommendation", y + 2);
y = bullet(doc, "Dashboard collects activity level, body goal, health status, and allergies.", y);
y = bullet(doc, "BMI calculator computes BMI and estimates daily calorie target.", y);
y = bullet(doc, "System recommends meal categories based on the user's profile.", y);

y = sectionTitle(doc, "3.3 AI Meal Plan Generation", y + 2);
y = bullet(doc, "Users can generate 1-day or 7-day Filipino meal plans through Groq AI.", y);
y = bullet(doc, "Weekly generation processes one day at a time with progress labels.", y);
y = bullet(doc, "Each recipe includes ingredients with PHP prices, cook time, calories, and protein.", y);
y = bullet(doc, "Local recipe fallback is used when AI is unavailable or rate-limited.", y);

y = sectionTitle(doc, "3.4 Budget, Snack, and Daily Totals", y + 2);
y = bullet(doc, "Budget is required on the Meal Plan page and auto-updates based on duration and meals.", y);
y = bullet(doc, "Optional snack increases suggested budget and adds one healthy snack per day.", y);
y = bullet(doc, "Snack cost is included in the total budget allocation, not treated as extra over-budget.", y);
y = bullet(doc, "Allergy filtering prevents recommending snacks/meals containing user allergens.", y);
y = bullet(doc, "Each day displays total calories, protein, and estimated peso cost versus budget.", y);

y = sectionTitle(doc, "3.5 Plan Management", y + 2);
y = bullet(doc, "Generated plans are stored in History.", y);
y = bullet(doc, "Users can save plans to Saved Plans.", y);
y = bullet(doc, "Swap Meal replaces one unavailable meal/snack while keeping profile and budget rules.", y);
y = bullet(doc, "Users can generate again or save the new meal suggestion.", y);
y = bullet(doc, "Saved plans can be downloaded as PDF.", y);

pageFooter(doc, 2, TOTAL);

/* ---------------- PAGE 3 ---------------- */
doc.addPage();
y = 24;
y = sectionTitle(doc, "4. Technical Implementation Status", y);
y = bullet(doc, "Frontend: React, Vite, React Router, responsive CSS.", y);
y = bullet(doc, "Authentication and database: Supabase Auth and PostgreSQL.", y);
y = bullet(doc, "Main plan storage table: saved_meal_plans (JSONB plan data, is_saved flag).", y);
y = bullet(doc, "Row Level Security restricts users to their own records.", y);
y = bullet(doc, "AI generation: Groq API.", y);
y = bullet(doc, "OTP email: Google Apps Script and Brevo.", y);
y = bullet(doc, "PDF generation: jsPDF.", y);

y = sectionTitle(doc, "5. Documentation Prepared", y + 2);
y = bullet(doc, "Updated System Flowchart / Architecture Diagram (PDF).", y);
y = bullet(doc, "Database Design / ERD or Schema (Supabase ERD).", y);
y = bullet(doc, "Project Progress Report / Current Accomplishments (this document).", y);

y = sectionTitle(doc, "6. Remaining / Ongoing Work", y + 2);
y = bullet(doc, "Continue mobile UI polish and consistency checks.", y);
y = bullet(doc, "Conduct more validation testing for allergies, budget limits, and weekly generation.", y);
y = bullet(doc, "Finalize remaining project documentation for final submission.", y);
y = bullet(doc, "Optional improvements: stronger over-budget checks and expanded snack options.", y);

y = sectionTitle(doc, "7. Progress Summary", y + 2);
y = paragraph(
  doc,
  "Overall, the core NutriGoal system is implemented. Users can register and log in, enter health and lifestyle details, generate AI-based daily or weekly meal plans, include optional snacks within budget, view daily cost totals, swap unavailable meals, save plans, and export PDFs. The project is ready for progress submission with architecture, database design, and this accomplishments report. Remaining work mainly covers polish, testing, and final documentation packaging.",
  y,
);

y = sectionTitle(doc, "8. Submission Checklist Alignment", y + 2);
y = bullet(doc, "Project Title and Description — covered in project overview.", y);
y = bullet(doc, "Project Objectives — personalized healthy meal planning with budget constraints.", y);
y = bullet(doc, "Scope and Limitations — AI estimates, market price variation, not medical advice.", y);
y = bullet(doc, "Updated System Flowchart / Architecture Diagram — prepared.", y);
y = bullet(doc, "Database Design (ERD or Schema) — prepared.", y);
y = bullet(doc, "Project Progress Report — this document.", y);

pageFooter(doc, 3, TOTAL);

const buffer = Buffer.from(doc.output("arraybuffer"));
writeFileSync(OUTPUT, buffer);
console.log(`Wrote ${OUTPUT}`);
