import { useForm } from "react-hook-form"
import { useState } from "react"
import { X } from "lucide-react"
import { createTransaction } from "../../api/transactions"

const CATEGORIES = [
  "Food", "Transport", "Housing", "Entertainment",
  "Shopping", "Health", "Education", "Utilities",
  "Salary", "Freelance", "Investment", "Other"
]

export default function AddTransactionModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [txType, setTxType] = useState("expense")

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0]
    }
  })

  const onSubmit = async (data) => {
    setApiError("")
    setLoading(true)
    try {
      await createTransaction({
        amount: parseFloat(data.amount),
        category: data.category,
        merchant: data.merchant || null,
        description: data.description || null,
        type: txType,
        date: new Date(data.date).toISOString()
      })
      onSuccess()
      onClose()
    } catch (err) {
      setApiError(err.response?.data?.detail || "Failed to add transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {/* Type toggle */}
          <div className="flex bg-gray-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setTxType("expense")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                txType === "expense" ? "bg-red-500/20 text-red-400" : "text-gray-400 hover:text-white"
              }`}
            >
              💸 Expense
            </button>
            <button
              type="button"
              onClick={() => setTxType("income")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                txType === "income" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:text-white"
              }`}
            >
              💰 Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Amount (£)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Must be greater than 0" }
              })}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 ${errors.amount ? "border-red-500" : "border-gray-700"}`}
            />
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Category</label>
            <select
              {...register("category", { required: "Category is required" })}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 ${errors.category ? "border-red-500" : "border-gray-700"}`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Merchant */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Merchant <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Tesco, Netflix, Uber"
              {...register("merchant")}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Description <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly groceries"
              {...register("description")}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Date</label>
            <input
              type="date"
              {...register("date", { required: "Date is required" })}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 ${errors.date ? "border-red-500" : "border-gray-700"}`}
            />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? "Adding..." : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  )
}
