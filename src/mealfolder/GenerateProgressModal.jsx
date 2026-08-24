import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ORBIT_DURATION_S = 16;

const PHASES = [
  {
    step: 1,
    title: "Collecting Ingredients...",
    caption: "Gathering fresh and healthy ingredients",
    icon: "eco",
    min: 0,
    scene: "orbit",
  },
  {
    step: 2,
    title: "AI Analyzing Nutrition...",
    caption: "Analyzing calories, macros, and nutrients",
    icon: "psychology",
    min: 12,
    scene: "brain",
  },
  {
    step: 3,
    title: "Crafting the Perfect Meal...",
    caption: "Balancing taste, health, and variety",
    icon: "restaurant",
    min: 30,
    scene: "vortex",
  },
  {
    step: 4,
    title: "Generating Healthy Options...",
    caption: "Finding the best meals for you",
    icon: "sync",
    min: 50,
    scene: "cards",
  },
  {
    step: 5,
    title: "Almost Done...",
    caption: "Personalizing just for you",
    icon: "favorite",
    min: 72,
    scene: "orbit",
  },
  {
    step: 6,
    title: "Your Healthy Meal is Ready!",
    caption: "Eat healthy, live better!",
    icon: "check_circle",
    min: 96,
    scene: "done",
  },
];

/** 8 evenly spaced ingredients for the main orbit ring. */
const MEAL_ORBIT_FOODS = ["🥦", "🫑", "🥕", "🍅", "🥬", "🍗", "🐟", "🥑"];

const LOADING_LINES = [
  "Analyzing your nutritional needs...",
  "Finding the best ingredients...",
  "Balancing calories and nutrients...",
  "Creating your personalized meal plan...",
  "Almost ready...",
];

function getPhase(percent) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  for (let index = PHASES.length - 1; index >= 0; index -= 1) {
    if (value >= PHASES[index].min) return PHASES[index];
  }
  return PHASES[0];
}

function ProgressRing({ percent, centered = false }) {
  const radius = centered ? 38 : 52;
  const circumference = 2 * Math.PI * radius;
  const smoothRef = useRef(0);
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const from = smoothRef.current;
    const to = Math.max(0, Math.min(100, Number(percent) || 0));
    let raf = 0;
    let startTime = 0;
    const duration = 650;

    const step = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min(1, (time - startTime) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const value = from + (to - from) * eased;
      smoothRef.current = value;
      setDisplayPercent(value);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  const offset = circumference * (1 - displayPercent / 100);
  const wrapClass = centered
    ? "genModal__ringWrap genModal__ringWrap--center"
    : "genModal__ringWrap";

  return (
    <div className={wrapClass}>
      <div className="genModal__ringGlow genModal__ringGlow--center" aria-hidden="true" />
      <svg className="genModal__ring" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="genRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle className="genModal__ringTrack" cx="60" cy="60" r={radius} fill="none" />
        <circle
          className="genModal__ringFill"
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#genRingGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <g className="genModal__ringShimmerGroup">
          <circle className="genModal__ringShimmer" cx="60" cy="60" r={radius} fill="none" />
        </g>
      </svg>
      <div className="genModal__ringCenter">
        <strong>{Math.round(displayPercent)}%</strong>
      </div>
    </div>
  );
}

function MealOrbitStage({ percent, scene }) {
  const showFoodOrbit = scene !== "done";
  const angleStep = 360 / MEAL_ORBIT_FOODS.length;

  return (
    <div
      className="genModal__orbitStage"
      style={{ "--orbit-duration": `${ORBIT_DURATION_S}s` }}
    >
      <div className="genModal__orbitGuide genModal__orbitGuide--outer" aria-hidden="true" />
      <div className="genModal__orbitGuide genModal__orbitGuide--inner" aria-hidden="true" />
      <div className="genModal__orbitGuideDot genModal__orbitGuideDot--a" aria-hidden="true" />
      <div className="genModal__orbitGuideDot genModal__orbitGuideDot--b" aria-hidden="true" />
      <div className="genModal__orbitCenterGlow" aria-hidden="true" />

      {showFoodOrbit ? (
        <div className="genModal__mealOrbit">
          {MEAL_ORBIT_FOODS.map((emoji, index) => (
            <div
              key={`${emoji}-${index}`}
              className="genModal__orbitSlot"
              style={{ "--angle": `${angleStep * index}deg` }}
            >
              <span className="genModal__orbitFood">{emoji}</span>
            </div>
          ))}
        </div>
      ) : null}

      {scene === "done" ? (
        <span className="material-symbols-outlined genModal__orbitDoneIcon" aria-hidden="true">
          check_circle
        </span>
      ) : null}

      <div className="genModal__orbitCenter">
        <ProgressRing percent={percent} centered />
      </div>
    </div>
  );
}

function AnimatedStatusText({ label }) {
  const lines = useMemo(() => {
    if (label) return [label, ...LOADING_LINES];
    return LOADING_LINES;
  }, [label]);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [label]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % lines.length);
        setVisible(true);
      }, 320);
    }, 3600);
    return () => clearInterval(timer);
  }, [lines.length]);

  return (
    <p
      className={`genModal__status ${visible ? "genModal__status--visible" : "genModal__status--hidden"}`}
      aria-live="polite"
    >
      {lines[index]}
    </p>
  );
}

function ModalPortal({ children }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function GenerateProgressModal({ open, percent = 0, label = "" }) {
  const phase = useMemo(() => getPhase(percent), [percent]);
  const [smoothBar, setSmoothBar] = useState(0);
  const barRef = useRef(0);

  useEffect(() => {
    const from = barRef.current;
    const to = Math.max(0, Math.min(100, Number(percent) || 0));
    let raf = 0;
    let startTime = 0;
    const duration = 650;

    const step = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min(1, (time - startTime) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const value = from + (to - from) * eased;
      barRef.current = value;
      setSmoothBar(value);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div
        className="genModalOverlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="genModalTitle"
        aria-describedby="genModalCaption"
      >
        <div className="genModal">
          <div className="genModal__header">
            <div className="genModal__stepBadge">{phase.step}</div>
            <h3 id="genModalTitle" className="genModal__title">
              {phase.title}
            </h3>
          </div>

          <MealOrbitStage percent={percent} scene={phase.scene} />

          <AnimatedStatusText label={label} />

          <div className="genModal__barTrack" aria-hidden="true">
            <div className="genModal__barFill" style={{ width: `${smoothBar}%` }} />
          </div>

          <p id="genModalCaption" className="genModal__caption">
            <span className="material-symbols-outlined" aria-hidden="true">
              {phase.icon}
            </span>
            {phase.caption}
          </p>
        </div>
      </div>
    </ModalPortal>
  );
}
