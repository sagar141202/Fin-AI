import axios from "axios"

const API_BASE = "http://127.0.0.1:8000"

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("fin_ai_token")}`
})

export const getPredictedSpending = async () => {
  const res = await axios.get(`${API_BASE}/ai/predict-spending`, { headers: getAuthHeader() })
  return res.data
}

export const getSpendingTrend = async () => {
  const res = await axios.get(`${API_BASE}/ai/spending-trend`, { headers: getAuthHeader() })
  return res.data
}

export const trainAnomalyModel = async () => {
  const res = await axios.post(`${API_BASE}/ai/train-anomaly-model`, {}, { headers: getAuthHeader() })
  return res.data
}

export const getAnomalies = async () => {
  const res = await axios.get(`${API_BASE}/ai/detect-anomalies`, { headers: getAuthHeader() })
  return res.data
}

export const getBudgetInsights = async () => {
  const res = await axios.get(`${API_BASE}/ai/budget-insights`, { headers: getAuthHeader() })
  return res.data
}
