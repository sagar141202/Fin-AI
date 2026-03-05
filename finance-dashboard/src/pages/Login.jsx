import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO Week 2: call POST /api/auth/login
    console.log("Login:", email, password)
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-2 text-white">Welcome back</h1>
        <p className="text-gray-400 mb-6 text-sm">Sign in to your finance dashboard</p>

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
            className="bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          No account?{" "}
          <a href="/register" className="text-sky-400 hover:underline">Register</a>
        </p>
      </div>
    </div>
  )
}