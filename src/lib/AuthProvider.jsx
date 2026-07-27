import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const SESSION_TIMEOUT_MS = 3000;

const AuthContext = createContext({
  session: null,
  loading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const finish = (currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setLoading(false);
    };

    const timeoutId = window.setTimeout(() => {
      finish(null);
    }, SESSION_TIMEOUT_MS);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      window.clearTimeout(timeoutId);
      finish(currentSession);
    });

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAuthenticated: Boolean(session),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthContext);
}
