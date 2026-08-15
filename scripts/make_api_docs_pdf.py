from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    Preformatted,
)
from reportlab.lib.enums import TA_CENTER

out = r"C:\NutriGoal\NutriGoal_API_Integration_Documentation.pdf"
doc = SimpleDocTemplate(
    out,
    pagesize=A4,
    leftMargin=0.7 * inch,
    rightMargin=0.7 * inch,
    topMargin=0.65 * inch,
    bottomMargin=0.65 * inch,
)

styles = getSampleStyleSheet()
title = ParagraphStyle(
    "T",
    parent=styles["Heading1"],
    fontSize=16,
    textColor=HexColor("#006C49"),
    spaceAfter=4,
    leading=20,
)
h2 = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontSize=12,
    textColor=HexColor("#047857"),
    spaceBefore=12,
    spaceAfter=5,
    leading=15,
)
body = ParagraphStyle(
    "B",
    parent=styles["BodyText"],
    fontSize=9.5,
    leading=13,
    textColor=HexColor("#1e293b"),
    spaceAfter=3,
)
bullet = ParagraphStyle("Bu", parent=body, leftIndent=12, spaceAfter=2)
code = ParagraphStyle(
    "Code",
    parent=body,
    fontName="Courier",
    fontSize=7.5,
    leading=10,
    textColor=HexColor("#334155"),
    backColor=HexColor("#F8FAFC"),
    spaceBefore=4,
    spaceAfter=6,
)
center = ParagraphStyle(
    "C",
    parent=body,
    alignment=TA_CENTER,
    textColor=HexColor("#64748b"),
    fontSize=9,
)
header_style = ParagraphStyle(
    "TH",
    parent=body,
    fontSize=8,
    textColor=white,
    leading=11,
    fontName="Helvetica-Bold",
)
cell_style = ParagraphStyle("TD", parent=body, fontSize=8, leading=10)


def P(text, style=body):
    return Paragraph(text, style)


def cell(text, style=cell_style):
    return Paragraph(text, style)


story = []
story.append(P("NutriGoal", title))
story.append(P("API Integration Documentation", h2))
story.append(
    HRFlowable(width="100%", thickness=1.5, color=HexColor("#10B981"), spaceAfter=8)
)
story.append(
    P(
        "This document explains how NutriGoal integrates external APIs using HTTP requests to retrieve, send, parse, and display dynamic data.",
        body,
    )
)

story.append(P("1. Primary External API: Groq API", h2))
story.append(
    P("<b>API Name:</b> Groq API (OpenAI-compatible Chat Completions)", body)
)
story.append(
    P(
        "<b>Purpose:</b> AI-generated meal recommendations and meal plans based on user profile (activity, goal, health, allergies, budget).",
        body,
    )
)
story.append(
    P(
        "<b>Endpoint:</b> POST https://api.groq.com/openai/v1/chat/completions",
        body,
    )
)
story.append(P("<b>Method:</b> HTTP POST", body))
story.append(
    P(
        "<b>Implemented in:</b> src/lib/groqMealPlan.js, src/lib/recommendCategories.js",
        body,
    )
)
story.append(P("<b>Features added:</b>", body))
story.append(P("• AI meal plan generation (1-day / 7-day)", bullet))
story.append(P("• Category matching with explanations", bullet))
story.append(P("• Dynamic recipes (ingredients, steps, prices, calories)", bullet))
story.append(P("• Local fallback if API fails", bullet))
story.append(P("<b>Sample JSON response (simplified):</b>", body))
story.append(
    Preformatted(
        '{\n  "choices": [{\n    "message": {\n      "content": "{\\"nutritionTip\\":\\"Drink water.\\",\\"recommendations\\":[{\\"meal\\":\\"Lunch\\"}]}"\n    }\n  }]\n}',
        code,
    )
)

story.append(P("2. Backend / Database API: Supabase", h2))
story.append(P("<b>API Name:</b> Supabase API (Auth + Database + Storage)", body))
story.append(
    P(
        "<b>Purpose:</b> User authentication, meal plan CRUD storage, and profile avatar uploads.",
        body,
    )
)
story.append(
    P(
        "<b>Endpoints:</b> Project URL from VITE_SUPABASE_URL; Auth; table saved_meal_plans; Storage bucket",
        body,
    )
)
story.append(
    P(
        "<b>Methods:</b> HTTP GET (retrieve meal plans), write/POST-like ops (insert/update/auth), storage upload",
        body,
    )
)
story.append(
    P(
        "<b>Implemented in:</b> supabaseClient.js, mealPlanDb.js, Login/Register, MealLayout",
        body,
    )
)
story.append(
    P(
        "<b>Features added:</b> Login/register, save/read/update/delete meal plans, profile photo upload",
        body,
    )
)
story.append(P("<b>Sample retrieved data:</b>", body))
story.append(
    Preformatted(
        '[{\n  "id": "uuid-row-id",\n  "created_at": "2026-08-10T08:00:00.000Z",\n  "is_saved": true,\n  "plan": {"categoryTitle": "High Protein", "budget": 500, "people": 2}\n}]',
        code,
    )
)

story.append(P("3. Supporting API: OTP (Google Apps Script)", h2))
story.append(P("<b>API Name:</b> Custom OTP Backend (Apps Script Web App)", body))
story.append(P("<b>Purpose:</b> Send/verify OTP during registration/login.", body))
story.append(P("<b>Endpoint:</b> VITE_OTP_SCRIPT_URL", body))
story.append(P("<b>Method:</b> HTTP POST (sendOtp, verifyOtp)", body))
story.append(P("<b>Implemented in:</b> src/lib/otpClient.js", body))
story.append(
    P('<b>Sample response:</b> {"ok": true, "message": "OTP sent"}', body)
)

story.append(P("How Requirements Are Met", h2))
data = [
    [cell("Requirement", header_style), cell("How NutriGoal Meets It", header_style)],
    [cell("Integrate >= 1 API"), cell("Groq + Supabase + OTP")],
    [cell("HTTP GET"), cell("Supabase fetchMealPlans() retrieves plans")],
    [cell("HTTP POST"), cell("Groq generation; OTP; auth writes")],
    [cell("Parse JSON"), cell("response.json() + meal plan parsers")],
    [cell("Display in UI"), cell("Meal Plan, categories, History/Saved")],
    [cell("Loading/errors"), cell("Spinners, try/catch, fallback")],
    [cell("Hide API keys"), cell(".env via import.meta.env (not hard-coded)")],
]
table = Table(data, colWidths=[1.8 * inch, 4.7 * inch])
table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#006C49")),
            ("BACKGROUND", (0, 1), (-1, 1), HexColor("#ECFDF5")),
            ("BACKGROUND", (0, 3), (-1, 3), HexColor("#ECFDF5")),
            ("BACKGROUND", (0, 5), (-1, 5), HexColor("#ECFDF5")),
            ("BACKGROUND", (0, 7), (-1, 7), HexColor("#ECFDF5")),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
    )
)
story.append(table)

story.append(P("Security Notes", h2))
story.append(
    P(
        "API keys are not hard-coded. They are loaded from .env (VITE_GROQ_API_KEY, VITE_SUPABASE_*, VITE_OTP_SCRIPT_URL). .env is gitignored; submit .env.example only.",
        body,
    )
)

story.append(P("Screenshot Guide", h2))
story.append(
    P(
        "1. API request implementation — fetch() in groqMealPlan.js or otpClient.js",
        bullet,
    )
)
story.append(
    P(
        "2. Retrieved data displayed — generated meal plan / categories / History",
        bullet,
    )
)
story.append(
    P(
        "3. JSON response sample — DevTools Network tab (Groq or Supabase)",
        bullet,
    )
)

story.append(Spacer(1, 12))
story.append(
    HRFlowable(width="100%", thickness=1, color=HexColor("#CBD5E1"), spaceAfter=6)
)
story.append(P("NutriGoal API Integration Documentation", center))
doc.build(story)
print("Saved:", out)
