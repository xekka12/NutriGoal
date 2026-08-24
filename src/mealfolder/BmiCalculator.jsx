import { useMemo } from "react";
import {
  classifyBmi,
  computeBmi,
  estimateDailyCalories,
} from "./bmiUtils";

const BMI_MIN = 15;
const BMI_MAX = 40;

/** Map BMI to needle rotation: -90deg (left) → +90deg (right). */
function bmiToNeedleDeg(bmi) {
  if (!Number.isFinite(bmi)) return -90;
  const t = Math.min(1, Math.max(0, (bmi - BMI_MIN) / (BMI_MAX - BMI_MIN)));
  return -90 + t * 180;
}

export default function BmiCalculator({
  age,
  heightCm,
  weightKg,
  gender,
  activityLevel,
  bodyGoal,
  onChange,
  locked = false,
}) {
  const bmi = useMemo(
    () => computeBmi(heightCm, weightKg),
    [heightCm, weightKg]
  );
  const category = classifyBmi(bmi);
  const calorieEstimate = useMemo(
    () =>
      estimateDailyCalories({
        age,
        heightCm,
        weightKg,
        gender,
        activityLevel,
        bodyGoal,
      }),
    [age, heightCm, weightKg, gender, activityLevel, bodyGoal]
  );
  const displayBmi = bmi != null ? bmi.toFixed(1) : "0.0";
  const needleDeg = bmiToNeedleDeg(bmi ?? BMI_MIN);

  const setField = (field, value) => {
    if (locked || typeof onChange !== "function") return;
    onChange({ age, heightCm, weightKg, gender, [field]: value });
  };

  return (
    <div className={`bmiCalc${locked ? " bmiCalc--locked" : ""}`}>
      <div className="bmiCalc__head">
        <span
          className="material-symbols-outlined bmiCalc__headIcon"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          monitor_weight
        </span>
        <div>
          <div className="label" style={{ marginBottom: 2 }}>
            BMI Calculator <span className="bmiCalc__required">*</span>
          </div>
          <div className="helper" style={{ margin: 0 }}>
            {locked
              ? "Locked from your Dashboard. Used for meal matching."
              : "Required. Enter age, gender, height & weight so we can classify your BMI."}
          </div>
        </div>
      </div>

      <div className="formgrid formgrid--2">
        <div className="field">
          <label className="label" htmlFor="bmiAge">
            Age <span className="bmiCalc__required">*</span>
          </label>
          <input
            id="bmiAge"
            className="input"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            placeholder="e.g. 25"
            value={age}
            onChange={(e) => setField("age", e.target.value)}
            disabled={locked}
            required
          />
        </div>

        <div className="field">
          <span className="label">
            Gender <span className="bmiCalc__required">*</span>
          </span>
          <div className="bmiGender" role="group" aria-label="Gender">
            <button
              type="button"
              className={`bmiGender__btn${
                gender === "female" ? " bmiGender__btn--active" : ""
              }`}
              onClick={() => setField("gender", "female")}
              aria-pressed={gender === "female"}
              disabled={locked}
            >
              <span className="material-symbols-outlined">woman</span>
              Female
            </button>
            <button
              type="button"
              className={`bmiGender__btn${
                gender === "male" ? " bmiGender__btn--active" : ""
              }`}
              onClick={() => setField("gender", "male")}
              aria-pressed={gender === "male"}
              disabled={locked}
            >
              <span className="material-symbols-outlined">man</span>
              Male
            </button>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="bmiHeight">
            Height <span className="bmiCalc__required">*</span>
          </label>
          <div className="inputwrap inputwrap--suffix">
            <input
              id="bmiHeight"
              className="input"
              type="number"
              inputMode="decimal"
              min={50}
              max={250}
              step="0.1"
              placeholder="e.g. 165"
              value={heightCm}
              onChange={(e) => setField("heightCm", e.target.value)}
              disabled={locked}
              required
            />
            <span className="inputwrap__suffix" aria-hidden="true">
              cm
            </span>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="bmiWeight">
            Weight <span className="bmiCalc__required">*</span>
          </label>
          <div className="inputwrap inputwrap--suffix">
            <input
              id="bmiWeight"
              className="input"
              type="number"
              inputMode="decimal"
              min={1}
              max={400}
              step="0.1"
              placeholder="e.g. 60"
              value={weightKg}
              onChange={(e) => setField("weightKg", e.target.value)}
              disabled={locked}
              required
            />
            <span className="inputwrap__suffix" aria-hidden="true">
              kg
            </span>
          </div>
        </div>
      </div>

      <div
        className={`bmiGauge${category ? ` bmiGauge--${category.key}` : ""}`}
        aria-live="polite"
      >
        <div className="bmiGauge__dial" aria-hidden="true">
          <svg viewBox="0 0 240 140" className="bmiGauge__svg">
            <path
              className="bmiGauge__seg bmiGauge__seg--under"
              d="M 28 120 A 92 92 0 0 1 36.8 80.8"
              fill="none"
              strokeWidth="18"
              strokeLinecap="butt"
            />
            <path
              className="bmiGauge__seg bmiGauge__seg--normal"
              d="M 36.8 80.8 A 92 92 0 0 1 91.6 32.5"
              fill="none"
              strokeWidth="18"
              strokeLinecap="butt"
            />
            <path
              className="bmiGauge__seg bmiGauge__seg--over"
              d="M 91.6 32.5 A 92 92 0 0 1 148.4 32.5"
              fill="none"
              strokeWidth="18"
              strokeLinecap="butt"
            />
            <path
              className="bmiGauge__seg bmiGauge__seg--obese"
              d="M 148.4 32.5 A 92 92 0 0 1 212 120"
              fill="none"
              strokeWidth="18"
              strokeLinecap="butt"
            />
            <g
              className="bmiGauge__needle"
              style={{ transform: `rotate(${needleDeg}deg)` }}
            >
              <line x1="120" y1="120" x2="120" y2="42" />
              <circle cx="120" cy="120" r="6" />
            </g>
          </svg>
          <div className="bmiGauge__ticks">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
        </div>

        <ul className="bmiLegend" aria-label="BMI color legend">
          <li>
            <span className="bmiLegend__swatch bmiLegend__swatch--under" />
            Underweight (&lt;18.5)
          </li>
          <li>
            <span className="bmiLegend__swatch bmiLegend__swatch--normal" />
            Normal (18.5–24.9)
          </li>
          <li>
            <span className="bmiLegend__swatch bmiLegend__swatch--over" />
            Overweight (25–29.9)
          </li>
          <li>
            <span className="bmiLegend__swatch bmiLegend__swatch--obese" />
            Obese (30+)
          </li>
        </ul>

        <div className="bmiGauge__value">
          <span className="bmiGauge__caption">BMI</span>
          <strong className="bmiGauge__number">{displayBmi}</strong>
          {category ? (
            <span className={`bmiGauge__badge bmiGauge__badge--${category.key}`}>
              {category.label}
            </span>
          ) : (
            <span className="bmiGauge__badge bmiGauge__badge--idle">
              Fill all required fields
            </span>
          )}
        </div>

        {category ? (
          <p className="bmiGauge__hint">{category.hint}</p>
        ) : null}
      </div>

      {calorieEstimate ? (
        <section className="calorieEstimate" aria-live="polite">
          <div className="calorieEstimate__head">
            <div>
              <span className="calorieEstimate__eyebrow">
                Daily calorie estimate
              </span>
              <h4>{bodyGoal || "Maintain Weight"}</h4>
            </div>
            <span className="material-symbols-outlined">local_fire_department</span>
          </div>

          <div className="calorieEstimate__result">
            <div>
              <span>Your goal</span>
              <strong>{calorieEstimate.target.toLocaleString()}</strong>
              <small>Calories/day to follow your selected goal</small>
            </div>
            <div>
              <span>Maintenance</span>
              <strong>{calorieEstimate.maintenance.toLocaleString()}</strong>
              <small>Calories/day to keep current weight</small>
            </div>
          </div>

          <p className="calorieEstimate__note">
            Maintenance = calories to stay the same weight. Your goal = adjusted
            calories based on Lose / Maintain / Gain. Estimate uses Mifflin-St
            Jeor + your activity. General guide only, not medical advice.
          </p>
        </section>
      ) : null}
    </div>
  );
}
