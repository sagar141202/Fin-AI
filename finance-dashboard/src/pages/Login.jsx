import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../store/AuthContext"
import { loginUser } from "../api/auth"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await loginUser(email, password)
      login(data.access_token)   // store token in context + localStorage
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-2 text-white">Welcome back</h1>
        <p className="text-gray-400 mb-6 text-sm">Sign in to your finance dashboard</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          No account?{" "}
          <Link to="/register" className="text-sky-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}