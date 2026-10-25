import React, { useEffect, useState } from 'react';
import {
  getThemeMode,
  subscribeThemeMode,
  toggleThemeMode,
} from 'src/modules/layout/themeMode';

function ThemeToggle(props: { className?: string }) {
  const [mode, setMode] = useState(getThemeMode());

  useEffect(() => subscribeThemeMode(setMode), []);

  const label =
    mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={`theme-toggle ${props.className || ''}`}
      onClick={toggleThemeMode}
      title={label}
      aria-label={label}
    >
      <i className={mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />
    </button>
  );
}

export default ThemeToggle;
