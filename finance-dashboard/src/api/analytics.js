import axios from "axios"

const API_BASE = "http://127.0.0.1:8000"

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("fin_ai_token")}`
})

export const getSummary = async () => {
  const res = await axios.get(`${API_BASE}/analytics/summary`, { headers: getAuthHeader() })
  return res.data
}

export const getMonthly = async () => {
  const res = await axios.get(`${API_BASE}/analytics/monthly`, { headers: getAuthHeader() })
  return res.data
}

export const getCategories = async () => {
  const res = await axios.get(`${API_BASE}/analytics/categories`, { headers: getAuthHeader() })
  return res.data
}

export const getBalanceTimeline = async () => {
  const res = await axios.get(`${API_BASE}/analytics/balance-timeline`, { headers: getAuthHeader() })
  return res.data
}
