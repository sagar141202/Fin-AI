import axios from "axios"

import { API_BASE } from "./config"

const getAuthHeader = () => {
  const token = localStorage.getItem("fin_ai_token")
  return { Authorization: `Bearer ${token}` }
}

export const getTransactions = async (params = {}) => {
  const response = await axios.get(`${API_BASE}/transactions`, {
    headers: getAuthHeader(),
    params,
  })
  return response.data
}

export const createTransaction = async (data) => {
  const response = await axios.post(`${API_BASE}/transactions`, data, {
    headers: getAuthHeader(),
  })
  return response.data
}

export const updateTransaction = async (id, data) => {
  const response = await axios.put(`${API_BASE}/transactions/${id}`, data, {
    headers: getAuthHeader(),
  })
  return response.data
}

export const deleteTransaction = async (id) => {
  const response = await axios.delete(`${API_BASE}/transactions/${id}`, {
    headers: getAuthHeader(),
  })
  return response.data
}
