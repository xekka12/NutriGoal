import { useEffect, useState } from "react";

export const SPECIFY_OPTION = "Specify other...";

export const ACTIVITY_OPTIONS = [
  "Sedentary (mostly sitting)",
  "Lightly Active (light walking/chores)",
  "Moderately Active (3-4x exercise per week)",
  "Gym / Workout (5-6x per week)",
  "Athlete (daily intense training)",
  "Physically Demanding Work (construction/warehouse)",
  "Senior / Low Mobility",
];

export const ACTIVITY_CARDS = [
  {
    value: "Sedentary (mostly sitting)",
    label: "Sedentary",
    desc: "Desk job or mostly sitting at home with little movement.",
    icon: "chair",
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Lightly Active (light walking/chores)",
    label: "Lightly Active",
    desc: "Light walking, house chores, or short easy movement daily.",
    icon: "directions_walk",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Moderately Active (3-4x exercise per week)",
    label: "Moderately Active",
    desc: "Exercise about 3–4 times a week, not too intense.",
    icon: "fitness_center",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Gym / Workout (5-6x per week)",
    label: "Gym / Workout",
    desc: "Regular gym training about 5–6 days a week.",
    icon: "exercise",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Athlete (daily intense training)",
    label: "Athlete",
    desc: "Daily hard training for sports or competition.",
    icon: "sports_martial_arts",
    img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Physically Demanding Work (construction/warehouse)",
    label: "Heavy Work",
    desc: "Hard physical job like construction, warehouse, or delivery.",
    icon: "construction",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Senior / Low Mobility",
    label: "Senior / Low Mobility",
    desc: "Gentle movement with limited mobility or slower pace.",
    icon: "elderly",
    img: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=600&q=80",
  },
];

export const GOAL_OPTIONS = [
  "Maintain Weight",
  "Lose Weight (Cutting)",
  "Gain Weight",
  "Build Muscle (Bulking)",
  "Body Recomposition",
  "Improve Energy / Stamina",
  "Tone Body",
  "Stay Healthy",
];

export const GOAL_CARDS = [
  {
    value: "Maintain Weight",
    label: "Maintain Weight",
    desc: "Keep your current body weight with balanced meals.",
    icon: "balance",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Lose Weight (Cutting)",
    label: "Lose Weight",
    desc: "Reduce body fat with lighter, calorie-controlled meals.",
    icon: "trending_down",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Gain Weight",
    label: "Gain Weight",
    desc: "Increase weight with higher-calorie nutritious meals.",
    icon: "trending_up",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Build Muscle (Bulking)",
    label: "Build Muscle",
    desc: "Support muscle growth with higher protein meals.",
    icon: "fitness_center",
    img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Body Recomposition",
    label: "Body Recomp",
    desc: "Lose fat and build muscle at the same time.",
    icon: "swap_horiz",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Improve Energy / Stamina",
    label: "More Energy",
    desc: "Boost daily energy and stamina with steady meals.",
    icon: "bolt",
    img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Tone Body",
    label: "Tone Body",
    desc: "Look leaner and more defined with balanced portions.",
    icon: "accessibility_new",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Stay Healthy",
    label: "Stay Healthy",
    desc: "Focus on overall wellness and balanced nutrition.",
    icon: "favorite",
    img: "https://images.unsplash.com/photo-1547592166-23acba133eac?auto=format&fit=crop&w=600&q=80",
  },
];

export const HEALTH_STATUS_OPTIONS = [
  "No current illness",
  "Has illness / medical condition",
];

export const HEALTH_STATUS_CARDS = [
  {
    value: "No current illness",
    label: "No Illness",
    desc: "No current sickness or medical condition.",
    icon: "check_circle",
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Has illness / medical condition",
    label: "Has Illness",
    desc: "You currently have an illness or medical condition.",
    icon: "medical_services",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
  },
];

export const ILLNESS_STATUS_VALUE = "Has illness / medical condition";

export const HEALTH_CONDITION_OPTIONS = [
  "Heart disease",
  "High blood pressure (Hypertension)",
  "Diabetes",
  "Kidney disease",
  "Liver disease",
  "Gout",
  "Asthma",
  "PCOS",
];

export const HEALTH_CONDITION_CARDS = [
  {
    value: "Heart disease",
    label: "Heart Disease",
    desc: "Heart or cardiovascular condition that needs careful meals.",
    icon: "cardiology",
    img: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "High blood pressure (Hypertension)",
    label: "Hypertension",
    desc: "High blood pressure; usually needs lower-sodium meals.",
    icon: "bloodtype",
    img: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Diabetes",
    label: "Diabetes",
    desc: "Blood sugar condition; prefer balanced, lower-sugar meals.",
    icon: "water_drop",
    img: "https://images.unsplash.com/photo-1593491034932-840e3aad1408?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Kidney disease",
    label: "Kidney Disease",
    desc: "Kidney condition that may need lighter, careful meals.",
    icon: "nephrology",
    img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Liver disease",
    label: "Liver Disease",
    desc: "Liver condition that may need gentler food choices.",
    icon: "gastroenterology",
    img: "https://images.unsplash.com/photo-1505576399279-0d06b8400382?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Gout",
    label: "Gout",
    desc: "Joint pain from uric acid; avoid high-purine foods.",
    icon: "accessibility_new",
    img: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Asthma",
    label: "Asthma",
    desc: "Breathing condition; choose meals that are easy and mild.",
    icon: "pulmonology",
    img: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "PCOS",
    label: "PCOS",
    desc: "Hormonal condition; balanced meals can help management.",
    icon: "female",
    img: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80",
  },
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

export const ALLERGY_CARDS = [
  {
    value: "Dairy",
    label: "Dairy",
    desc: "Milk, cheese, yogurt, and other dairy products.",
    icon: "water_drop",
    img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Gluten",
    label: "Gluten",
    desc: "Found in wheat, barley, rye, and many breads.",
    icon: "bakery_dining",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Peanuts",
    label: "Peanuts",
    desc: "Peanuts and foods made with peanut products.",
    icon: "nutrition",
    img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Tree Nuts",
    label: "Tree Nuts",
    desc: "Almonds, cashews, walnuts, and similar nuts.",
    icon: "spa",
    img: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Egg",
    label: "Egg",
    desc: "Chicken eggs and foods prepared with egg.",
    icon: "egg",
    img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Fish",
    label: "Fish",
    desc: "Fish like bangus, tilapia, tuna, and salmon.",
    icon: "set_meal",
    img: "https://images.unsplash.com/photo-1519708227418-c69fae50eb40?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Shellfish",
    label: "Shellfish",
    desc: "Crabs, mussels, clams, oysters, and similar.",
    icon: "ramen_dining",
    img: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Soy",
    label: "Soy",
    desc: "Tofu, soy sauce, soy milk, and soy products.",
    icon: "eco",
    img: "https://images.unsplash.com/photo-1588165171080-c89acfa5ee69?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Shrimp",
    label: "Shrimp",
    desc: "Shrimp and dishes that include shrimp.",
    icon: "restaurant",
    img: "https://images.unsplash.com/photo-1565680018434-141374d91e52?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Wheat",
    label: "Wheat",
    desc: "Bread, pasta, flour, and wheat-based foods.",
    icon: "breakfast_dining",
    img: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Sesame",
    label: "Sesame",
    desc: "Sesame seeds, sesame oil, and tahini.",
    icon: "grain",
    img: "https://images.unsplash.com/photo-1478144592103-25e218a04893?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Corn",
    label: "Corn",
    desc: "Corn, cornmeal, and corn-based snacks.",
    icon: "agriculture",
    img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Pork",
    label: "Pork",
    desc: "Pork meat and dishes made with pork.",
    icon: "kebab_dining",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Beef",
    label: "Beef",
    desc: "Beef, steak, and dishes made with beef.",
    icon: "lunch_dining",
    img: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80",
  },
  {
    value: "Chicken",
    label: "Chicken",
    desc: "Chicken meat and chicken-based meals.",
    icon: "outdoor_grill",
    img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80",
  },
];

export function ImageCardPicker({
  id,
  label,
  value,
  onChange,
  cards,
  locked = false,
  helper = "",
  allowSpecify = true,
}) {
  const [open, setOpen] = useState(false);
  const [specifying, setSpecifying] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const selectedCard = cards.find((c) => c.value === value);
  const displayLabel = selectedCard
    ? selectedCard.label
    : value || "Tap to choose...";

  const handleSelect = (card) => {
    setSpecifying(false);
    setCustomValue("");
    onChange(card.value);
    setOpen(false);
  };

  const handleSpecifySubmit = () => {
    const cleaned = customValue.trim();
    if (!cleaned) return;
    onChange(cleaned);
    setSpecifying(false);
    setCustomValue("");
    setOpen(false);
  };

  if (locked) {
    return (
      <div className="field">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        <div className="icpTrigger icpTrigger--locked">
          {selectedCard ? (
            <>
              <span
                className="material-symbols-outlined icpTrigger__icon"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {selectedCard.icon}
              </span>
              <span className="icpTrigger__label">{selectedCard.label}</span>
            </>
          ) : (
            <span className="icpTrigger__label">{value || "—"}</span>
          )}
        </div>
        {helper ? <div className="helper">{helper}</div> : null}
      </div>
    );
  }

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <button
        type="button"
        className={`icpTrigger${selectedCard ? " icpTrigger--selected" : ""}`}
        onClick={() => setOpen(true)}
        id={id}
      >
        {selectedCard ? (
          <>
            <img
              className="icpTrigger__thumb"
              src={selectedCard.img}
              alt={selectedCard.label}
            />
            <div className="icpTrigger__info">
              <span className="icpTrigger__label">{selectedCard.label}</span>
              <span className="icpTrigger__desc">{selectedCard.desc}</span>
            </div>
          </>
        ) : value ? (
          <div className="icpTrigger__info">
            <span className="icpTrigger__label">{value}</span>
            <span className="icpTrigger__desc">Custom</span>
          </div>
        ) : (
          <span className="icpTrigger__placeholder">{displayLabel}</span>
        )}
        <span className="icpTrigger__chevron material-symbols-outlined">
          expand_more
        </span>
      </button>
      {helper ? <div className="helper">{helper}</div> : null}

      {open ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-modal-title`}
        >
          <div className="glass icpModal modalScroll">
            <div className="icpModal__head">
              <h3 id={`${id}-modal-title`} className="confirmModal__title">
                {label}
              </h3>
              <button
                type="button"
                className="iconbtn"
                onClick={() => {
                  setOpen(false);
                  setSpecifying(false);
                }}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="confirmModal__text">
              Pick one below, or specify your own.
            </p>

            <div className="icpGrid">
              {cards.map((card) => {
                const active = card.value === value;
                return (
                  <button
                    key={card.value}
                    type="button"
                    className={`icpCard${active ? " icpCard--active" : ""}`}
                    onClick={() => handleSelect(card)}
                  >
                    <div className="icpCard__media">
                      <img
                        className="icpCard__img"
                        src={card.img}
                        alt={card.label}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <span
                        className="material-symbols-outlined icpCard__icon"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {card.icon}
                      </span>
                      {active ? (
                        <span className="icpCard__check material-symbols-outlined">
                          check_circle
                        </span>
                      ) : null}
                    </div>
                    <div className="icpCard__body">
                      <span className="icpCard__label">{card.label}</span>
                      <span className="icpCard__desc">{card.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {allowSpecify ? (
              specifying ? (
                <div className="field" style={{ marginTop: 14 }}>
                  <label className="label" htmlFor={`${id}-custom`}>
                    Specify your own
                  </label>
                  <div className="allergyCustomRow">
                    <input
                      id={`${id}-custom`}
                      className="input"
                      type="text"
                      placeholder="Type your own answer..."
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSpecifySubmit();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="softbtn softbtn--light"
                      onClick={handleSpecifySubmit}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="softbtn"
                  style={{ marginTop: 14, width: "100%" }}
                  onClick={() => setSpecifying(true)}
                >
                  Specify other...
                </button>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
  cards = ALLERGY_CARDS,
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

  const removeAllergy = (allergy) => {
    onChange(allergies.filter((item) => item !== allergy));
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
            Tap to choose allergies...
          </span>
        )}
        <span className="allergyField__hint">Edit</span>
      </div>
      <div className="helper">
        {allergies.length
          ? `We will avoid: ${allergies.join(", ")}.`
          : "Tap to open allergy cards. You can select multiple and specify your own."}
      </div>

      {open ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="allergyModalTitle"
        >
          <div className="glass icpModal modalScroll">
            <div className="icpModal__head">
              <h3 id="allergyModalTitle" className="confirmModal__title">
                Select Allergies
              </h3>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="confirmModal__text">
              Tap all that apply. Selected cards will be avoided in your meal
              plan.
            </p>

            <div className="icpGrid">
              {cards.map((card) => {
                const active = draft.includes(card.value);
                return (
                  <button
                    key={card.value}
                    type="button"
                    className={`icpCard${active ? " icpCard--active" : ""}`}
                    onClick={() => toggleDraft(card.value)}
                    aria-pressed={active}
                  >
                    <div className="icpCard__media">
                      <img
                        className="icpCard__img"
                        src={card.img}
                        alt={card.label}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <span
                        className="material-symbols-outlined icpCard__icon"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {card.icon}
                      </span>
                      {active ? (
                        <span className="icpCard__check material-symbols-outlined">
                          check_circle
                        </span>
                      ) : null}
                    </div>
                    <div className="icpCard__body">
                      <span className="icpCard__label">{card.label}</span>
                      <span className="icpCard__desc">{card.desc}</span>
                    </div>
                  </button>
                );
              })}

              {draft
                .filter((item) => !cards.some((card) => card.value === item))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    className="icpCard icpCard--active"
                    onClick={() => toggleDraft(custom)}
                    aria-pressed
                  >
                    <div className="icpCard__media icpCard__media--custom">
                      <span
                        className="material-symbols-outlined icpCard__icon"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        add_circle
                      </span>
                      <span className="icpCard__check material-symbols-outlined">
                        check_circle
                      </span>
                    </div>
                    <div className="icpCard__body">
                      <span className="icpCard__label">{custom}</span>
                      <span className="icpCard__desc">Custom allergy</span>
                    </div>
                  </button>
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
