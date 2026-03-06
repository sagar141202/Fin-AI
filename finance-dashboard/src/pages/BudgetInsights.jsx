import { useState, useEffect } from "react"
import { getBudgetInsights } from "../api/ai"
import { Lightbulb, TrendingUp, TrendingDown, Target } from "lucide-react"

const INSIGHT_STYLES = {
  warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-300" },
  danger:  { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-300" },
  success: { bg: "bg-emerald-500/10",border: "border-emerald-500/30",text: "text-emerald-300" },
  info:    { bg: "bg-sky-500/10",    border: "border-sky-500/30",    text: "text-sky-300" },
}

export default function BudgetInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBudgetInsights()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full text-gray-400 p-12">
      Analysing your budget...
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lightbulb size={24} className="text-yellow-400" />
          AI Budget Insights
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Personalised recommendations based on your spending patterns
        </p>
      </div>

      {/* 50/30/20 Rule Overview */}
      {data && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">50/30/20 Rule Analysis</h2>
          <p className="text-gray-500 text-xs mb-5">
            Monthly income: ₹{data.income.toLocaleString("en-IN")}
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Needs", key: "needs", color: "sky", desc: "Housing, Food, Transport" },
              { label: "Wants", key: "wants", color: "purple", desc: "Entertainment, Shopping" },
              { label: "Savings", key: "savings", color: "emerald", desc: "What you keep" },
            ].map(({ label, key, color, desc }) => {
              const rule = data.rule_5030_20[key]
              const isOk = rule.status === "ok"
              return (
                <div key={key} className={`rounded-xl p-4 border ${
                  isOk ? "border-gray-700 bg-gray-800/50" : "border-red-500/30 bg-red-500/5"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 text-sm font-medium">{label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isOk ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {isOk ? "On track" : "Off track"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{rule.actual}%</p>
                  <p className="text-gray-500 text-xs mt-1">Target: {rule.target}%</p>
                  <p className="text-gray-600 text-xs mt-0.5">{desc}</p>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOk ? `bg-${color}-400` : "bg-red-400"
                      }`}
                      style={{ width: `${Math.min(rule.actual / rule.target * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {data?.insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-white font-semibold">Personalised Insights</h2>
          {data.insights.map((insight, i) => {
            const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.info
            return (
              <div key={i} className={`${style.bg} border ${style.border} rounded-xl p-5`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{insight.icon}</span>
                  <div>
                    <p className={`font-semibold text-sm ${style.text}`}>{insight.title}</p>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Budget Progress Bars */}
      {data?.budget_progress && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Budget Progress</h2>
          <p className="text-gray-500 text-xs mb-5">Monthly spending vs recommended limits</p>

          <div className="space-y-4">
            {data.budget_progress.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-300 text-sm">{item.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">
                      ₹{item.spent.toLocaleString("en-IN")} / ₹{item.budget.toLocaleString("en-IN")}
                    </span>
                    <span className={`text-xs font-medium ${
                      item.over_budget ? "text-red-400" : "text-emerald-400"
                    }`}>
                      {item.over_budget
                        ? `Over by ₹${(item.spent - item.budget).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        : `₹${item.remaining.toLocaleString("en-IN", { maximumFractionDigits: 0 })} left`
                      }
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.over_budget ? "bg-red-500" :
                      item.used_percent > 80 ? "bg-yellow-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${item.used_percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              ₹{data.income.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-gray-400 text-sm mt-1">Monthly Income</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              ₹{data.total_spend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-gray-400 text-sm mt-1">Total Spent</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${data.savings >= 0 ? "text-sky-400" : "text-red-400"}`}>
              ₹{Math.abs(data.savings).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {data.savings >= 0 ? "Saved" : "Over Budget"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
