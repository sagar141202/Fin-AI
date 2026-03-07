import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { registerUser, loginUser } from "../api/auth"

export default function Register() {
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch("password")

  const onSubmit = async (data) => {
    setApiError("")
    setLoading(true)
    try {
      await registerUser(data.email, data.username, data.password)
      const res = await loginUser(data.email, data.password)
      login(res.access_token)
      navigate("/dashboard")
    } catch (err) {
      setApiError(err.response?.data?.detail || "Registration failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-2 text-white">Create account</h1>
        <p className="text-gray-400 mb-6 text-sm">Start tracking your finances with AI</p>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {apiError}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Only letters, numbers and underscores",
                },
              })}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 ${
                errors.username ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)/,
                  message: "Must contain at least one uppercase letter and one number",
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

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
