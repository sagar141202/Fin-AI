import { useState, useEffect } from "react"
import { getSummary, getMonthly, getCategories, getBalanceTimeline } from "../api/analytics"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle } from "lucide-react"

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

const formatCurrency = (val) => `₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
// ─── Summary Card ─────────────────────────────────────────
function SummaryCard({ title, value, subtitle, icon: Icon, color, prefix = "₹" }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>
            {prefix}{typeof value === "number" ? Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : value}
          </p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gray-800`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, m, c, t] = await Promise.all([
          getSummary(), getMonthly(), getCategories(), getBalanceTimeline()
        ])
        setSummary(s)
        setMonthly(m)
        setCategories(c)
        setTimeline(t)
      } catch (err) {
        console.error("Analytics fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Your financial summary at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Balance"
          value={summary?.balance}
          subtitle="All time net"
          icon={Wallet}
          color={summary?.balance >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <SummaryCard
          title="Monthly Income"
          value={summary?.monthly_income}
          subtitle="This month"
          icon={TrendingUp}
          color="text-emerald-400"
        />
        <SummaryCard
          title="Monthly Spend"
          value={summary?.monthly_expense}
          subtitle="This month"
          icon={TrendingDown}
          color="text-red-400"
        />
        <SummaryCard
          title="Savings Rate"
          value={summary?.savings_rate}
          subtitle="This month"
          icon={PiggyBank}
          color="text-sky-400"
          prefix=""
        />
      </div>

      {/* Anomaly alert */}
      {summary?.anomaly_count > 0 && (
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-4">
          <AlertTriangle size={18} className="text-orange-400 shrink-0" />
          <p className="text-orange-300 text-sm">
            <span className="font-semibold">{summary.anomaly_count} anomalous transactions</span> detected by AI. Check your Transactions page.
          </p>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar chart — income vs expense */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-semibold mb-1">Income vs Expenses</h2>
          <p className="text-gray-500 text-xs mb-4">Last 12 months</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => v.split(" ")[0]} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart — spending by category */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-semibold mb-1">Spending by Category</h2>
          <p className="text-gray-500 text-xs mb-4">All time breakdown</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={260}>
              <PieChart>
                <Pie
                  data={categories.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="total"
                  paddingAngle={3}
                >
                  {categories.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {categories.slice(0, 8).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400 text-xs truncate">{cat.category}</span>
                  <span className="text-gray-300 text-xs ml-auto font-medium">£{cat.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line chart — balance over time */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-1">Balance Over Time</h2>
        <p className="text-gray-500 text-xs mb-4">Running balance — last 12 months</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => v.split(" ")[0]} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ fill: "#0ea5e9", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Savings bar */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-white font-semibold mb-1">Monthly Savings</h2>
        <p className="text-gray-500 text-xs mb-4">Income minus expenses per month</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => v.split(" ")[0]} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="savings" name="Savings" radius={[4, 4, 0, 0]}>
              {monthly.map((entry, i) => (
                <Cell key={i} fill={entry.savings >= 0 ? "#10b981" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
