import { useState, useEffect } from "react"
import { getAnomalies, trainAnomalyModel } from "../api/ai"
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react"

export default function Anomalies() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)

  const fetchAnomalies = async () => {
    setLoading(true)
    try {
      const result = await getAnomalies()
      setData(result)
    } catch (err) {
      console.error("Failed to fetch anomalies", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetrain = async () => {
    setTraining(true)
    try {
      await trainAnomalyModel()
      await fetchAnomalies()
    } catch (err) {
      console.error("Training failed", err)
    } finally {
      setTraining(false)
    }
  }

  useEffect(() => { fetchAnomalies() }, [])

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={24} className="text-orange-400" />
            Anomaly Detection
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-powered suspicious transaction detection using Isolation Forest
          </p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={training}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={training ? "animate-spin" : ""} />
          {training ? "Training..." : "Retrain Model"}
        </button>
      </div>

      {/* How it works */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <TrendingUp size={16} className="text-sky-400" />
          How it works
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Isolation Forest is an unsupervised ML algorithm that detects anomalies by isolating
          outliers in your spending patterns. It analyses transaction amount, category,
          time of day, and day of week to flag unusual activity — similar to how banks
          detect fraud in real-time.
        </p>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{data.total_anomalies}</p>
            <p className="text-gray-400 text-sm mt-1">Flagged Transactions</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">
              ₹{data.anomalies.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-gray-400 text-sm mt-1">Total Flagged Amount</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-sky-400">
              {data.anomalies.length > 0
                ? [...new Set(data.anomalies.map(t => t.category))].length
                : 0}
            </p>
            <p className="text-gray-400 text-sm mt-1">Categories Affected</p>
          </div>
        </div>
      )}

      {/* Flagged transactions */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Analysing transactions...</div>
      ) : data?.anomalies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No anomalies detected — your spending looks normal! ✅
        </div>
      ) : (
        <div className="space-y-3">
          {data.anomalies.map(tx => (
            <div
              key={tx.id}
              className="bg-gray-900 border border-orange-500/30 rounded-xl p-5 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-500/10 rounded-lg mt-0.5">
                    <AlertTriangle size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{tx.merchant || tx.category}</p>
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                        Anomaly
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-0.5">{formatDate(tx.date)}</p>
                    <p className="text-sky-400 text-sm mt-2 flex items-center gap-1">
                      🤖 {tx.explanation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold text-lg">
                    -₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                    {tx.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
