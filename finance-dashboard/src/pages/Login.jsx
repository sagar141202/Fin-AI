import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { loginUser } from "../api/auth"

export default function Login() {
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setApiError("")
    setLoading(true)
    try {
      const res = await loginUser(data.email, data.password)
      login(res.access_token)
      navigate("/dashboard")
    } catch (err) {
      setApiError(err.response?.data?.detail || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-2 text-white">Welcome back</h1>
        <p className="text-gray-400 mb-6 text-sm">Sign in to your finance dashboard</p>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {apiError}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 ${
                errors.email ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 ${
                errors.password ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
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
