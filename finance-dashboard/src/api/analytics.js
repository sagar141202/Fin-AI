import axios from "axios"

import { API_BASE } from "./config"

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("fin_ai_token")}`
})

export const getSummary = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/analytics/summary`, { headers: getAuthHeader(), params })
  return res.data
}

export const getMonthly = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/analytics/monthly`, { headers: getAuthHeader(), params })
  return res.data
}

export const getCategories = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/analytics/categories`, { headers: getAuthHeader(), params })
  return res.data
}

export const getBalanceTimeline = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/analytics/balance-timeline`, { headers: getAuthHeader(), params })
  return res.data
}
