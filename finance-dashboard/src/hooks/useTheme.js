import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState(
    localStorage.getItem("fin_ai_theme") || "dark"
  )

  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") {
      root.classList.remove("dark")
      root.classList.add("light")
    } else {
      root.classList.remove("light")
      root.classList.add("dark")
    }
    localStorage.setItem("fin_ai_theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark")

  return { theme, toggleTheme }
}
