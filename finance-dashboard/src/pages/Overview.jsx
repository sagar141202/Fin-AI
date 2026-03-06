import { useState, useEffect } from "react"
import { getSummary, getMonthly, getCategories, getBalanceTimeline } from "../api/analytics"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle, Calendar, Brain, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { getPredictedSpending, getSpendingTrend } from "../api/ai"

const COLORS = ["#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"]

const formatCurrency = (val) => `₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`

// ─── Preset ranges ────────────────────────────────────────
const PRESETS = [
  { label: "Last 30 days", days: 30 },
  { label: "Last 3 months", days: 90 },
  { label: "Last 6 months", days: 180 },
  { label: "Last 12 months", days: 365 },
  { label: "All time", days: null },
]

function SummaryCard({ title, value, subtitle, icon: Icon, color, prefix = "₹" }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>
            {prefix}{typeof value === "number"
              ? Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : value}
          </p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-gray-800">
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
      <p className="text-gray-300 font-medium mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function Overview() {
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [categories, setCategories] = useState([])
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiPrediction, setAiPrediction] = useState(null)
  const [spendingTrend, setSpendingTrend] = useState([])

  // Date range state
  const [activePreset, setActivePreset] = useState("Last 12 months")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showCustom, setShowCustom] = useState(false)

  const getDateParams = () => {
    const params = {}
    if (dateFrom) params.date_from = new Date(dateFrom).toISOString()
    if (dateTo) params.date_to = new Date(dateTo).toISOString()
    return params
  }

  const applyPreset = (preset) => {
    setActivePreset(preset.label)
    setShowCustom(false)
    if (!preset.days) {
      setDateFrom("")
      setDateTo("")
    } else {
      const from = new Date()
      from.setDate(from.getDate() - preset.days)
      setDateFrom(from.toISOString().split("T")[0])
      setDateTo(new Date().toISOString().split("T")[0])
    }
  }

  useEffect(() => {
    const fromOk = !dateFrom || dateFrom.length === 10
    const toOk = !dateTo || dateTo.length === 10
    if (!fromOk || !toOk) return

    const fetchAll = async () => {
      setLoading(true)
      try {
        const params = getDateParams()
        const [s, m, c, t] = await Promise.all([
          getSummary(params), getMonthly(params),
          getCategories(params), getBalanceTimeline(params)
        ])
        setSummary(s); setMonthly(m); setCategories(c); setTimeline(t)
        try {
          const [pred, trend] = await Promise.all([getPredictedSpending(), getSpendingTrend()])
          setAiPrediction(pred)
          setSpendingTrend(trend)
        } catch (aiErr) {
          console.error("AI fetch error:", aiErr)
        }
      } catch (err) {
        console.error("Analytics fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchAll, 400)
    return () => clearTimeout(timer)
  }, [dateFrom, dateTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm p-12">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header + Date Range Selector */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Your financial summary at a glance</p>
        </div>

        {/* Date range controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={16} className="text-gray-400" />

          {/* Preset buttons */}
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activePreset === preset.label
                  ? "bg-sky-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {preset.label}
            </button>
          ))}

          {/* Custom range toggle */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showCustom
                ? "bg-sky-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <span className="text-gray-400 text-sm">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); if (e.target.value.length === 10) setActivePreset("Custom") }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
          />
          <span className="text-gray-400 text-sm">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); if (e.target.value.length === 10) setActivePreset("Custom") }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); setActivePreset("All time"); setShowCustom(false) }}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 border border-gray-700 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Balance" value={summary?.balance} subtitle="Net for period"
          icon={Wallet} color={summary?.balance >= 0 ? "text-emerald-400" : "text-red-400"} />
        <SummaryCard title="Monthly Income" value={summary?.monthly_income} subtitle="This month"
          icon={TrendingUp} color="text-emerald-400" />
        <SummaryCard title="Monthly Spend" value={summary?.monthly_expense} subtitle="This month"
          icon={TrendingDown} color="text-red-400" />
        <SummaryCard title="Savings Rate" value={summary?.savings_rate} subtitle="This month"
          icon={PiggyBank} color="text-sky-400" prefix="" />
      </div>

      {/* Anomaly alert */}
      {summary?.anomaly_count > 0 && (
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-4">
          <AlertTriangle size={18} className="text-orange-400 shrink-0" />
          <p className="text-orange-300 text-sm">
            <span className="font-semibold">{summary.anomaly_count} anomalous transactions</span> detected by AI.
          </p>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-semibold mb-1">Income vs Expenses</h2>
          <p className="text-gray-500 text-xs mb-4">Monthly comparison</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => v.split(" ")[0]} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-semibold mb-1">Spending by Category</h2>
          <p className="text-gray-500 text-xs mb-4">Breakdown for period</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={260}>
              <PieChart>
                <Pie data={categories.slice(0,8)} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100} dataKey="total" paddingAngle={3}>
                  {categories.slice(0,8).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {categories.slice(0,8).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400 text-xs truncate">{cat.category}</span>
                  <span className="text-gray-300 text-xs ml-auto font-medium">₹{cat.total.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-1">Balance Over Time</h2>
        <p className="text-gray-500 text-xs mb-4">Running balance for selected period</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => v.split(" ")[0]} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="balance" name="Balance" stroke="#0ea5e9"
              strokeWidth={2.5} dot={{ fill: "#0ea5e9", r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Savings chart */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-1">Monthly Savings</h2>
        <p className="text-gray-500 text-xs mb-4">Income minus expenses per month</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => v.split(" ")[0]} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="savings" name="Savings" radius={[4,4,0,0]}>
              {monthly.map((entry, i) => (
                <Cell key={i} fill={entry.savings >= 0 ? "#10b981" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>


      {/* AI Forecast Section */}
      {aiPrediction && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-sky-400" />
            <h2 className="text-white font-semibold text-lg">AI Spending Forecast</h2>
            <span className="bg-sky-500/20 text-sky-400 text-xs px-2 py-0.5 rounded-full">Next Month</span>
          </div>

          <div className="bg-gradient-to-r from-sky-500/10 to-purple-500/10 border border-sky-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm">Predicted Total Spend Next Month</p>
            <p className="text-3xl font-bold text-white mt-1">
              ₹{aiPrediction.total_predicted_spend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-500 text-xs mt-2">Based on {aiPrediction.trained_on} · {aiPrediction.model}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiPrediction.top_categories.map((cat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm font-medium">{cat.category}</span>
                  <span className={`flex items-center gap-1 text-xs ${
                    cat.trend === "increasing" ? "text-red-400" :
                    cat.trend === "decreasing" ? "text-emerald-400" : "text-gray-400"
                  }`}>
                    {cat.trend === "increasing" ? <ArrowUp size={12} /> :
                     cat.trend === "decreasing" ? <ArrowDown size={12} /> :
                     <Minus size={12} />}
                    {cat.trend}
                  </span>
                </div>
                <p className="text-white font-bold text-xl">
                  ₹{cat.predicted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-semibold mb-1">Spending Trend + Forecast</h3>
            <p className="text-gray-500 text-xs mb-4">Actual spending history + AI predicted next month</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => v.split(" ")[0]} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
                <Line type="monotone" dataKey="actual" name="Actual Spend"
                  stroke="#ef4444" strokeWidth={2.5}
                  dot={{ fill: "#ef4444", r: 4 }} connectNulls={false} />
                <Line type="monotone" dataKey="predicted" name="AI Forecast"
                  stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="6 3"
                  dot={{ fill: "#0ea5e9", r: 5 }} connectNulls={false} />
                <Line type="monotone" dataKey="upper" name="Upper Bound"
                  stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3 3"
                  dot={false} connectNulls={false} strokeOpacity={0.4} />
                <Line type="monotone" dataKey="lower" name="Lower Bound"
                  stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3 3"
                  dot={false} connectNulls={false} strokeOpacity={0.4} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  )
}