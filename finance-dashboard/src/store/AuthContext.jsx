import { createContext, useState } from "react"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("fin_ai_token") || null
  )
  const [user, setUser] = useState(null)

  const login = (accessToken) => {
    setToken(accessToken)
    localStorage.setItem("fin_ai_token", accessToken)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("fin_ai_token")
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

