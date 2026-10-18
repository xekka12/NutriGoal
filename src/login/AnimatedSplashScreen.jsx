import { useEffect, useId, useRef, useState } from "react";
import "./AnimatedSplashScreen.css";

const LOADING_LINES = [
  "Preparing your healthy experience...",
  "Loading healthy ideas...",
  "Personalizing your meal planner...",
  "Almost ready...",
];

const LEFT_LEAVES = [
  { t: "-4%", l: "-18%", w: 240, rot: -42, s: 1.15, type: "monstera", d: 0 },
  { t: "6%", l: "-22%", w: 210, rot: -18, s: 1.05, type: "fern", d: 0.2 },
  { t: "18%", l: "-16%", w: 190, rot: -32, s: 1, type: "leaf", d: 0.5 },
  { t: "32%", l: "-24%", w: 230, rot: -8, s: 1.12, type: "monstera", d: 0.1 },
  { t: "46%", l: "-14%", w: 175, rot: -28, s: 0.95, type: "fern", d: 0.7 },
  { t: "58%", l: "-20%", w: 205, rot: -16, s: 1.08, type: "leaf", d: 0.3 },
  { t: "72%", l: "-18%", w: 220, rot: -36, s: 1.1, type: "monstera", d: 0.6 },
  { t: "84%", l: "-12%", w: 170, rot: -12, s: 0.92, type: "fern", d: 0.4 },
];

const RIGHT_LEAVES = [
  { t: "-2%", r: "-18%", w: 235, rot: 40, s: 1.12, type: "monstera", d: 0.15 },
  { t: "10%", r: "-20%", w: 200, rot: 16, s: 1.02, type: "fern", d: 0.35 },
  { t: "22%", r: "-14%", w: 185, rot: 30, s: 0.98, type: "leaf", d: 0.55 },
  { t: "36%", r: "-24%", w: 228, rot: 10, s: 1.14, type: "monstera", d: 0.05 },
  { t: "50%", r: "-16%", w: 172, rot: 26, s: 0.96, type: "fern", d: 0.75 },
  { t: "62%", r: "-22%", w: 210, rot: 14, s: 1.06, type: "leaf", d: 0.25 },
  { t: "76%", r: "-18%", w: 218, rot: 34, s: 1.08, type: "monstera", d: 0.5 },
  { t: "88%", r: "-10%", w: 168, rot: 12, s: 0.9, type: "fern", d: 0.4 },
];

const TOP_LEAVES = [
  { l: "8%", t: "-16%", w: 180, rot: -8, s: 1, type: "monstera", d: 0.2 },
  { l: "28%", t: "-20%", w: 150, rot: 12, s: 0.95, type: "fern", d: 0.45 },
  { l: "48%", t: "-18%", w: 165, rot: 0, s: 1.05, type: "leaf", d: 0.1 },
  { l: "68%", t: "-20%", w: 148, rot: -14, s: 0.92, type: "fern", d: 0.6 },
  { l: "82%", t: "-14%", w: 170, rot: 18, s: 1, type: "monstera", d: 0.3 },
];

const BOTTOM_LEAVES = [
  { l: "6%", b: "-18%", w: 190, rot: 10, s: 1.02, type: "monstera", d: 0.25 },
  { l: "30%", b: "-16%", w: 155, rot: -16, s: 0.94, type: "fern", d: 0.5 },
  { l: "52%", b: "-20%", w: 175, rot: 6, s: 1.06, type: "leaf", d: 0.15 },
  { l: "74%", b: "-16%", w: 160, rot: 20, s: 0.96, type: "fern", d: 0.4 },
];

const FLOATERS = [
  { l: "18%", t: "22%", d: 0, s: 0.55 },
  { l: "78%", t: "26%", d: 1.1, s: 0.48 },
  { l: "22%", t: "70%", d: 2, s: 0.5 },
  { l: "74%", t: "66%", d: 0.7, s: 0.52 },
  { l: "46%", t: "16%", d: 1.5, s: 0.42 },
  { l: "52%", t: "78%", d: 0.9, s: 0.46 },
];

function LeafSvg({ width = 120, type = "leaf", flip = false }) {
  const uid = useId().replace(/:/g, "");

  if (type === "monstera") {
    return (
      <svg
        className="splashLeafSvg"
        width={width}
        height={width * 1.28}
        viewBox="0 0 80 108"
        aria-hidden="true"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <defs>
          <linearGradient id={`m-${uid}`} x1="12%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#m-${uid})`}
          d="M40 6C26 10 12 22 8 40C5 54 10 66 18 74C14 62 22 52 30 56C22 68 18 82 28 96C34 102 40 104 40 104C40 104 46 102 52 96C62 82 58 68 50 56C58 52 66 62 62 74C70 66 75 54 72 40C68 22 54 10 40 6Z"
        />
        <path
          d="M40 14V98"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
    );
  }

  if (type === "fern") {
    return (
      <svg
        className="splashLeafSvg"
        width={width}
        height={width * 1.28}
        viewBox="0 0 80 108"
        aria-hidden="true"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <defs>
          <linearGradient id={`f-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#f-${uid})`}
          d="M40 4C38 20 20 28 12 36C22 34 34 28 40 22C40 34 24 44 14 54C26 50 36 40 40 34C40 48 26 60 16 70C28 64 36 52 40 46C40 62 28 74 20 84C30 76 38 64 40 58C40 74 32 88 28 98C36 88 40 74 40 68C40 74 44 88 52 98C48 88 40 74 40 58C42 64 50 76 60 84C52 74 40 62 40 46C44 52 52 64 64 70C54 60 40 48 40 34C46 40 56 50 68 54C58 44 40 34 40 22C46 28 58 34 68 36C60 28 42 20 40 4Z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="splashLeafSvg"
      width={width}
      height={width * 1.28}
      viewBox="0 0 80 108"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id={`l-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#l-${uid})`}
        d="M40 4C40 4 8 26 6 56C4 76 18 96 40 104C62 96 76 76 74 56C72 26 40 4 40 4Z"
      />
      <path
        d="M40 12L40 98M40 30C28 38 18 50 14 64M40 34C52 42 62 54 66 68"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeafCluster({ items, side }) {
  return (
    <div className={`splashScreen__leafLayer splashScreen__leafLayer--${side}`}>
      {items.map((leaf, i) => (
        <div
          key={`${side}-${i}`}
          className="splashScreen__leaf"
          style={{
            top: leaf.t,
            bottom: leaf.b,
            left: leaf.l,
            right: leaf.r,
            animationDelay: `${leaf.d}s`,
          }}
        >
          <div
            className="splashScreen__leafInner"
            style={{
              width: leaf.w,
              transform: `rotate(${leaf.rot}deg) scale(${leaf.s})`,
            }}
          >
            <LeafSvg width={leaf.w} type={leaf.type} flip={side === "right"} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnimatedSplashScreen({ onOpening, onComplete }) {
  const [phase, setPhase] = useState("intro");
  const [progress, setProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const completedRef = useRef(false);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const fast = reducedMotion.current;
    const logoDelay = fast ? 200 : 700;
    const loadingDelay = fast ? 400 : 1400;
    const loadDuration = fast ? 900 : 2400;
    const loadStart = loadingDelay;
    const completeHold = fast ? 180 : 420;
    const openDuration = fast ? 700 : 1400;
    const exitDelay = fast ? 220 : 500;

    const logoTimer = window.setTimeout(() => setLogoVisible(true), logoDelay);
    const loadingTimer = window.setTimeout(() => setPhase("loading"), loadingDelay);

    let raf = 0;
    let startTime = 0;

    const tick = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      if (elapsed < loadStart) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const loadElapsed = elapsed - loadStart;
      const pct = Math.min(100, (loadElapsed / loadDuration) * 100);
      setProgress(pct);

      const stage = Math.min(
        LOADING_LINES.length - 1,
        Math.floor((pct / 100) * LOADING_LINES.length),
      );
      setLineIndex(stage);

      if (pct < 100) {
        raf = requestAnimationFrame(tick);
        return;
      }

      setPhase("complete");

      window.setTimeout(() => {
        setPhase("opening");
        onOpening?.();
      }, completeHold);

      window.setTimeout(() => {
        setPhase("exit");
      }, completeHold + openDuration);

      window.setTimeout(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        onComplete?.();
      }, completeHold + openDuration + exitDelay);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(logoTimer);
      window.clearTimeout(loadingTimer);
      cancelAnimationFrame(raf);
    };
  }, [onComplete, onOpening]);

  const opening = phase === "opening" || phase === "exit";
  const exiting = phase === "exit";
  const complete = phase === "complete" || opening;
  const showLoading = (phase === "loading" || progress > 0) && !complete;

  return (
    <div
      className={`splashScreen${complete ? " splashScreen--complete" : ""}${opening ? " splashScreen--opening" : ""}${exiting ? " splashScreen--exit" : ""}`}
      aria-hidden="true"
    >
      <div className="splashScreen__bg" />
      <div className="splashScreen__light" />
      <div className="splashScreen__vignette" />

      <div className="splashScreen__particles">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={`p-${i}`}
            className="splashScreen__particle"
            style={{
              left: `${6 + ((i * 19) % 88)}%`,
              top: `${4 + ((i * 27) % 90)}%`,
              animationDelay: `${(i % 6) * 0.55}s`,
            }}
          />
        ))}
      </div>

      {FLOATERS.map((f, i) => (
        <div
          key={`f-${i}`}
          className="splashScreen__floater"
          style={{
            left: f.l,
            top: f.t,
            animationDelay: `${f.d}s`,
          }}
        >
          <div style={{ transform: `scale(${f.s})` }}>
            <LeafSvg width={42} type="leaf" />
          </div>
        </div>
      ))}

      <LeafCluster items={LEFT_LEAVES} side="left" />
      <LeafCluster items={RIGHT_LEAVES} side="right" />
      <LeafCluster items={TOP_LEAVES} side="top" />
      <LeafCluster items={BOTTOM_LEAVES} side="bottom" />

      <div
        className={`splashScreen__content${logoVisible ? " splashScreen__content--visible" : ""}${opening ? " splashScreen__content--opening" : ""}${exiting ? " splashScreen__content--hide" : ""}`}
      >
        <div className="splashScreen__logoGlow" />
        <div className="splashScreen__logo">
          <img
            className="splashScreen__logoImg"
            src="/nutrigoal-logo.png"
            alt=""
          />
        </div>
        <h1 className="splashScreen__title">Smart Meal Planner</h1>
        {!showLoading && !complete ? (
          <p className="splashScreen__tagline">
            Fuel your body.
            <br />
            Plan your healthy future.
          </p>
        ) : null}

        {showLoading ? (
          <div className="splashScreen__loading">
            <p className="splashScreen__loadingText">{LOADING_LINES[lineIndex]}</p>
            <div className="splashScreen__barRow">
              <div className="splashScreen__barTrack">
                <div
                  className="splashScreen__barFill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="splashScreen__percent">{Math.round(progress)}%</span>
            </div>
          </div>
        ) : null}

        {complete ? (
          <div className="splashScreen__ringWrap">
            <svg className="splashScreen__ring" viewBox="0 0 120 120">
              <circle className="splashScreen__ringTrack" cx="60" cy="60" r="42" />
              <circle className="splashScreen__ringFill" cx="60" cy="60" r="42" />
            </svg>
            <strong>100%</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
}
