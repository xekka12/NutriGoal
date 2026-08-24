import { useCallback, useEffect, useState } from "react";
import AnimatedSplashScreen from "./AnimatedSplashScreen";
import Login from "./Login";

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [loginRevealed, setLoginRevealed] = useState(false);

  const handleOpening = useCallback(() => {
    setLoginRevealed(true);
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setLoginRevealed(true);
  }, []);

  useEffect(() => {
    if (!showSplash) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showSplash]);

  return (
    <div className="loginPageWrap">
      <div className="loginFoodDecor" aria-hidden="true">
        <span className="loginFoodDecor__item loginFoodDecor__item--avocado">🥑</span>
        <span className="loginFoodDecor__item loginFoodDecor__item--broccoli">🥦</span>
        <span className="loginFoodDecor__item loginFoodDecor__item--strawberry">🍓</span>
        <span className="loginFoodDecor__item loginFoodDecor__item--salad">🥗</span>
        <span className="loginFoodDecor__item loginFoodDecor__item--leaf loginFoodDecor__item--leafA">🌿</span>
        <span className="loginFoodDecor__item loginFoodDecor__item--leaf loginFoodDecor__item--leafB">🍃</span>
      </div>
      <div
        className={`loginPageWrap__login${loginRevealed ? " loginPageWrap__login--revealed" : ""}`}
      >
        <Login />
      </div>

      {showSplash ? (
        <AnimatedSplashScreen
          onOpening={handleOpening}
          onComplete={handleSplashComplete}
        />
      ) : null}
    </div>
  );
}
