"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("verdict-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={`font-mono text-xs border border-current px-3 py-1.5 transition-colors hover:opacity-70 ${className}`}
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {dark ? "☀ daylight" : "☾ night ledger"}
    </button>
  );
}