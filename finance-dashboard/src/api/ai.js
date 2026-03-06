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
