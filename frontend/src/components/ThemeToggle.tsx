import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    // Force light theme at all times
    localStorage.removeItem("theme");
    document.documentElement.classList.remove("dark");
  }, []);

  return null;
}
