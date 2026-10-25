import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import storage, { storageKeys } from "src/security/storage";

const ThemeContext = createContext({ light: false, toggle: () => {} });

const apply = (light: boolean) => {
  document.documentElement.dataset.theme = light ? "light" : "dark";
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [light, setLight] = useState(() => storage.get(storageKeys.theme) === "light");

  useEffect(() => apply(light), [light]);

  const toggle = () => {
    const next = !light;
    setLight(next);
    storage.set(storageKeys.theme, next ? "light" : "dark");
  };

  return <ThemeContext.Provider value={{ light, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
