import { CSSProperties, ReactNode, createContext, useCallback, useContext, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

const CinematicContext = createContext({ go: (_href: string, _duration?: number) => {} });

const prefersReducedMotion = () => {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

// Page-to-page transition overlay used between the landing, login and workspace.
export function CinematicProvider({ children }: { children: ReactNode }) {
  const history = useHistory();
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(600);
  const navTimer = useRef<ReturnType<typeof setTimeout>>();
  const endTimer = useRef<ReturnType<typeof setTimeout>>();

  const go = useCallback(
    (href: string, ms = 600) => {
      if (prefersReducedMotion()) {
        history.push(href);
        return;
      }
      clearTimeout(navTimer.current);
      clearTimeout(endTimer.current);
      setDuration(ms);
      setActive(true);
      navTimer.current = setTimeout(() => history.push(href), Math.round(0.46 * ms));
      endTimer.current = setTimeout(() => setActive(false), ms);
    },
    [history],
  );

  return (
    <CinematicContext.Provider value={{ go }}>
      {children}
      {active && (
        <div
          className="cinematic-overlay active"
          style={{ "--cine-duration": `${duration}ms` } as CSSProperties}
          aria-hidden="true"
        >
          <span className="cine-surface" />
          <span className="cine-line" />
        </div>
      )}
    </CinematicContext.Provider>
  );
}

export const useCinematicNav = () => useContext(CinematicContext);
