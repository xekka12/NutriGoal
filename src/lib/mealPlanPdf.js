import {
  getPlanDays,
  getPlanFilters,
  getRecipeTotal,
  isWeeklyPlan,
  normalizeIngredient,
  normalizeStep,
} from "./mealPlanView";

const PDF_MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

function safeFileName(value) {
  return String(value || "meal-plan")
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function findMeal(day, mealName) {
  return (day?.recommendations || []).find(
    (item) =>
      String(item?.meal || "").trim().toLowerCase() === mealName.toLowerCase(),
  );
}

function mealSummary(recommendation) {
  if (!recommendation) return "—";

  const recipes = (recommendation.recipes || [])
    .map((recipe) => recipe?.name)
    .filter(Boolean);
  const budget = Number(recommendation.suggestedBudget || 0);
  const budgetText = budget > 0 ? `\nPHP ${budget.toLocaleString()}` : "";

  return `${recipes.join("\n") || "No recipe"}${budgetText}`;
}

function recipeIngredients(recipe) {
  return (recipe?.ingredients || [])
    .map(normalizeIngredient)
    .map((ingredient) => {
      const price =
        ingredient.estimatedPrice > 0
          ? ` (PHP ${ingredient.estimatedPrice.toLocaleString()})`
          : "";
      return `${ingredient.item}${price}`;
    })
    .join("\n");
}

function recipeSteps(recipe) {
  return (recipe?.steps || [])
    .map(normalizeStep)
    .map((step, index) => {
      const time = step.estimatedTime ? ` (${step.estimatedTime})` : "";
      return `${index + 1}. ${step.instruction}${time}`;
    })
    .join("\n");
}

function formatSavedDate(ms) {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/** Draws the cover band and info strip, returning the Y where content starts. */
function addHeader(doc, plan, weekly) {
  const filters = getPlanFilters(plan);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const bandHeight = weekly ? 40 : 44;

  doc.setFillColor(0, 108, 73);
  doc.rect(0, 0, pageWidth, bandHeight, "F");
  doc.setFillColor(16, 185, 129);
  doc.rect(0, bandHeight, pageWidth, 1.6, "F");

  doc.setTextColor(196, 232, 216);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("NUTRIGOAL  |  HEALTHY MEAL PLANNER", margin, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(weekly ? 22 : 20);
  doc.text(String(plan.categoryTitle || "Saved Meal Plan"), margin, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(214, 240, 228);
  doc.text(
    `${weekly ? "1 Week Plan (7 Days)" : "1 Day Plan"}   •   Breakfast · Lunch · Dinner`,
    margin,
    32,
  );

  const savedDate = formatSavedDate(plan.createdAt);
  if (savedDate) {
    doc.setFontSize(9);
    doc.text(`Generated: ${savedDate}`, pageWidth - margin, 12, {
      align: "right",
    });
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `Budget: PHP ${Number(plan.budget || 0).toLocaleString()}`,
    pageWidth - margin,
    24,
    { align: "right" },
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(214, 240, 228);
  doc.text("For 1 person", pageWidth - margin, 32, {
    align: "right",
  });

  const stripTop = bandHeight + 7;
  const stripHeight = 16;
  doc.setFillColor(242, 249, 246);
  doc.setDrawColor(206, 228, 218);
  doc.setLineWidth(0.3);
  doc.roundedRect(
    margin,
    stripTop,
    pageWidth - margin * 2,
    stripHeight,
    2.5,
    2.5,
    "FD",
  );

  const facts = [
    ["BODY GOAL", filters.bodyGoal],
    ["ACTIVITY", filters.activityLevel],
    [
      "BMI",
      plan.filters?.bmi
        ? `${plan.filters.bmi} (${plan.filters.bmiCategory || "Not set"})`
        : "Not provided",
    ],
    ["ALLERGIES", filters.allergiesText],
  ];

  const usable = pageWidth - margin * 2;
  const colWidth = usable / facts.length;

  facts.forEach(([label, value], index) => {
    const x = margin + colWidth * index + 5;

    if (index > 0) {
      doc.setDrawColor(214, 232, 224);
      doc.line(
        margin + colWidth * index,
        stripTop + 3,
        margin + colWidth * index,
        stripTop + stripHeight - 3,
      );
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(107, 138, 124);
    doc.text(label, x, stripTop + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.6);
    doc.setTextColor(11, 28, 48);
    doc.text(
      doc.splitTextToSize(String(value || "—"), colWidth - 9)[0] || "—",
      x,
      stripTop + 12,
    );
  });

  return stripTop + stripHeight + 8;
}

function addFooter(doc, note) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(214, 232, 224);
  doc.setLineWidth(0.3);
  doc.line(12, pageHeight - 12, pageWidth - 12, pageHeight - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 138, 130);
  doc.text(note, 12, pageHeight - 7);
  doc.text("NutriGoal", pageWidth - 12, pageHeight - 7, { align: "right" });
}

function buildDetailRows(plan) {
  return getPlanDays(plan).flatMap((day, dayIndex) => {
    const matched = PDF_MEALS.map((mealName) => ({
      mealName,
      recommendation: findMeal(day, mealName),
    })).filter((entry) => entry.recommendation);

    const entries = matched.length
      ? matched
      : (day.recommendations || []).map((recommendation) => ({
          mealName: recommendation?.meal || "Meal",
          recommendation,
        }));

    return entries.flatMap(({ mealName, recommendation }) =>
      (recommendation.recipes || []).map((recipe) => {
        const total = getRecipeTotal(recipe);
        return [
          day.day || `Day ${dayIndex + 1}`,
          mealName,
          String(recipe?.name || "Suggested meal"),
          recipeIngredients(recipe) || "—",
          recipeSteps(recipe) || "—",
          total > 0 ? `PHP ${total.toLocaleString()}` : "—",
        ];
      }),
    );
  });
}

/**
 * Creates a client-side PDF. No upload is needed, so it works in modern
 * Android, iOS, and desktop browsers.
 */
export async function downloadMealPlanPdf(plan) {
  const weekly = isWeeklyPlan(plan);
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.autoTable || autoTableModule.default;
  const doc = new jsPDF({
    orientation: weekly ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const contentTop = addHeader(doc, plan, weekly);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const usableWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(11, 28, 48);
  doc.text(
    weekly ? "Weekly Meal Schedule" : "Daily Meal Schedule",
    margin,
    contentTop,
  );

  const tableTop = contentTop + 4;

  if (weekly) {
    const overviewRows = getPlanDays(plan)
      .slice(0, 7)
      .map((day, index) => [
        day.day || `Day ${index + 1}`,
        ...PDF_MEALS.map((meal) => mealSummary(findMeal(day, meal))),
      ]);

    // Stretch rows so the schedule fills the page instead of leaving blank space.
    const headHeight = 12;
    const rowHeight = Math.max(
      13,
      Math.min(
        26,
        (bottomLimit - tableTop - headHeight) / Math.max(overviewRows.length, 1),
      ),
    );
    const dayWidth = 26;
    const mealWidth = (usableWidth - dayWidth) / PDF_MEALS.length;

    autoTable(doc, {
      startY: tableTop,
      head: [["DAY", ...PDF_MEALS.map((meal) => meal.toUpperCase())]],
      body: overviewRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.6,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        valign: "middle",
        textColor: [30, 45, 38],
        lineColor: [206, 228, 218],
        lineWidth: 0.2,
        minCellHeight: rowHeight,
      },
      headStyles: {
        fillColor: [0, 108, 73],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
        minCellHeight: headHeight,
      },
      columnStyles: {
        0: {
          cellWidth: dayWidth,
          fillColor: [237, 246, 242],
          textColor: [0, 108, 73],
          fontStyle: "bold",
          halign: "center",
        },
        1: { cellWidth: mealWidth },
        2: { cellWidth: mealWidth },
        3: { cellWidth: mealWidth },
      },
      alternateRowStyles: { fillColor: [249, 252, 251] },
      margin: { left: margin, right: margin },
    });
  } else {
    const day = getPlanDays(plan)[0];
    const rows = PDF_MEALS.map((meal) => {
      const recommendation = findMeal(day, meal);
      return [
        meal.toUpperCase(),
        mealSummary(recommendation),
        recommendation?.suggestedBudget
          ? `PHP ${Number(recommendation.suggestedBudget).toLocaleString()}`
          : "—",
      ];
    });

    const headHeight = 12;
    const rowHeight = Math.max(
      16,
      Math.min(
        34,
        (bottomLimit - tableTop - headHeight) / Math.max(rows.length, 1),
      ),
    );

    autoTable(doc, {
      startY: tableTop,
      head: [["MEAL", "RECIPE", "SUGGESTED BUDGET"]],
      body: rows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9.4,
        cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
        valign: "middle",
        textColor: [30, 45, 38],
        lineColor: [206, 228, 218],
        lineWidth: 0.2,
        minCellHeight: rowHeight,
      },
      headStyles: {
        fillColor: [0, 108, 73],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        minCellHeight: headHeight,
      },
      columnStyles: {
        0: {
          cellWidth: 34,
          fontStyle: "bold",
          fillColor: [237, 246, 242],
          textColor: [0, 108, 73],
        },
        2: { cellWidth: 42, halign: "right" },
      },
      alternateRowStyles: { fillColor: [249, 252, 251] },
      margin: { left: margin, right: margin },
    });
  }

  addFooter(
    doc,
    "Ingredient prices are estimates and may vary by store, season, and location.",
  );

  const detailRows = buildDetailRows(plan);
  if (detailRows.length) {
    doc.addPage("a4", weekly ? "landscape" : "portrait");

    autoTable(doc, {
      startY: 26,
      head: [
        ["DAY", "MEAL", "RECIPE", "INGREDIENTS", "HOW TO COOK", "EST. TOTAL"],
      ],
      body: detailRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: weekly ? 7 : 7.4,
        cellPadding: 2.6,
        valign: "top",
        textColor: [30, 45, 38],
        lineColor: [206, 228, 218],
        lineWidth: 0.2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [0, 108, 73],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [249, 252, 251] },
      columnStyles: weekly
        ? {
            0: {
              cellWidth: 16,
              fontStyle: "bold",
              textColor: [0, 108, 73],
              halign: "center",
            },
            1: { cellWidth: 20, fontStyle: "bold" },
            2: { cellWidth: 38, fontStyle: "bold" },
            3: { cellWidth: 70 },
            4: { cellWidth: 105 },
            5: { cellWidth: 24, halign: "right" },
          }
        : {
            0: {
              cellWidth: 15,
              fontStyle: "bold",
              textColor: [0, 108, 73],
              halign: "center",
            },
            1: { cellWidth: 19, fontStyle: "bold" },
            2: { cellWidth: 30, fontStyle: "bold" },
            3: { cellWidth: 49 },
            4: { cellWidth: 59 },
            5: { cellWidth: 24, halign: "right" },
          },
      margin: { left: margin, right: margin, top: 26, bottom: 18 },
      didDrawPage: () => {
        doc.setFillColor(0, 108, 73);
        doc.rect(0, 0, pageWidth, 18, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text("Ingredients & How to Cook", margin, 11.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(206, 235, 222);
        doc.text(
          String(plan.categoryTitle || "Saved Meal Plan"),
          pageWidth - margin,
          11.5,
          { align: "right" },
        );

        addFooter(doc, "Cooking times and prices are estimates.");
      },
    });
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 138, 130);
    doc.text(
      `Page ${page} of ${totalPages}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 7,
      { align: "center" },
    );
  }

  const filename = `${safeFileName(plan.categoryTitle)}-${
    weekly ? "weekly" : "daily"
  }-meal-plan.pdf`;
  doc.save(filename);
}
