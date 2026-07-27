import { useEffect, useState } from "react";

export const SPECIFY_OPTION = "Specify other...";

export const ACTIVITY_OPTIONS = [
  "Sedentary (mostly sitting)",
  "Lightly Active (light walking/chores)",
  "Moderately Active (3-4x exercise per week)",
  "Gym / Workout (5-6x per week)",
  "Athlete (daily intense training)",
];

export const GOAL_OPTIONS = [
  "Maintain Weight",
  "Lose Weight (Cutting)",
  "Gain Weight",
  "Build Muscle (Bulking)",
  "Stay Healthy",
];

export const ALLERGY_OPTIONS = [
  "Dairy",
  "Gluten",
  "Peanuts",
  "Tree Nuts",
  "Egg",
  "Fish",
  "Shellfish",
  "Soy",
  "Shrimp",
  "Wheat",
  "Sesame",
  "Corn",
  "Pork",
  "Beef",
  "Chicken",
];

export function SpecifiableSelect({
  id,
  label,
  value,
  onChange,
  options,
  locked = false,
  helper = "",
}) {
  const isPreset = options.includes(value);
  const [isSpecifying, setIsSpecifying] = useState(Boolean(value) && !isPreset);

  useEffect(() => {
    if (value && !options.includes(value)) {
      setIsSpecifying(true);
    }
  }, [value, options]);

  if (locked) {
    return (
      <div className="field">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        <input id={id} className="input" value={value || "—"} disabled readOnly />
        {helper ? <div className="helper">{helper}</div> : null}
      </div>
    );
  }

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="input"
        value={isSpecifying ? SPECIFY_OPTION : value || options[0]}
        onChange={(e) => {
          const next = e.target.value;
          if (next === SPECIFY_OPTION) {
            setIsSpecifying(true);
            onChange("");
            return;
          }
          setIsSpecifying(false);
          onChange(next);
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={SPECIFY_OPTION}>{SPECIFY_OPTION}</option>
      </select>

      {isSpecifying ? (
        <input
          className="input"
          type="text"
          placeholder="Type your own answer..."
          value={isPreset ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}

      {helper ? <div className="helper">{helper}</div> : null}
    </div>
  );
}

export function AllergyPicker({
  allergies,
  onChange,
  locked = false,
  options = ALLERGY_OPTIONS,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(allergies);
  const [customAllergy, setCustomAllergy] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(allergies);
      setCustomAllergy("");
    }
  }, [open, allergies]);

  const toggleDraft = (allergy) => {
    setDraft((prev) =>
      prev.includes(allergy)
        ? prev.filter((item) => item !== allergy)
        : [...prev, allergy],
    );
  };

  const addCustomAllergy = () => {
    const cleaned = customAllergy.trim();
    if (!cleaned) return;
    setDraft((prev) =>
      prev.some((item) => item.toLowerCase() === cleaned.toLowerCase())
        ? prev
        : [...prev, cleaned],
    );
    setCustomAllergy("");
  };

  const saveAllergies = () => {
    onChange(draft);
    setOpen(false);
  };

  if (locked) {
    return (
      <div className="field">
        <div className="label">Allergies</div>
        <div className="allergyField allergyField--locked">
          {allergies.length ? (
            <div className="allergyTags">
              {allergies.map((allergy) => (
                <span key={allergy} className="allergyTag">
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <span className="allergyField__placeholder">None</span>
          )}
        </div>
        <div className="helper">
          Locked from your Dashboard filters. Go back to Dashboard to change
          this.
        </div>
      </div>
    );
  }

  const removeAllergy = (allergy) => {
    onChange(allergies.filter((item) => item !== allergy));
  };

  return (
    <div className="field">
      <div className="label">Allergies (optional)</div>
      <div
        className="allergyField"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {allergies.length ? (
          <div className="allergyTags">
            {allergies.map((allergy) => (
              <span key={allergy} className="allergyTag">
                {allergy}
                <button
                  type="button"
                  className="allergyTag__remove"
                  aria-label={`Remove ${allergy}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAllergy(allergy);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="allergyField__placeholder">
            Click to select allergies...
          </span>
        )}
        <span className="allergyField__hint">Edit</span>
      </div>
      <div className="helper">
        {allergies.length
          ? `We will avoid: ${allergies.join(", ")}.`
          : "Click the field to open the allergy list. You can also specify your own."}
      </div>

      {open ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="allergyModalTitle"
        >
          <div className="glass allergyModal modalScroll">
            <h3 id="allergyModalTitle" className="confirmModal__title">
              Select Allergies
            </h3>
            <p className="confirmModal__text">
              Check all that apply. You can also type a custom allergy below.
            </p>

            <div className="allergyChecklist">
              {options.map((allergy) => {
                const checked = draft.includes(allergy);
                return (
                  <label key={allergy} className="allergyCheck">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDraft(allergy)}
                    />
                    <span>{allergy}</span>
                  </label>
                );
              })}

              {draft
                .filter((item) => !options.includes(item))
                .map((custom) => (
                  <label key={custom} className="allergyCheck">
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggleDraft(custom)}
                    />
                    <span>{custom}</span>
                  </label>
                ))}
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label className="label" htmlFor="customAllergy">
                Specify other allergy
              </label>
              <div className="allergyCustomRow">
                <input
                  id="customAllergy"
                  className="input"
                  type="text"
                  placeholder="e.g. Mango, MSG, Coconut"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomAllergy();
                    }
                  }}
                />
                <button
                  type="button"
                  className="softbtn softbtn--light"
                  onClick={addCustomAllergy}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="confirmModal__actions">
              <button
                type="button"
                className="softbtn"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="softbtn softbtn--light"
                onClick={saveAllergies}
              >
                Save Allergies
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
