import axios from "axios"

const API_BASE = "http://127.0.0.1:8000"

export const registerUser = async (email, username, password) => {
  const response = await axios.post(`${API_BASE}/auth/register`, {
    email, username, password,
  })
  return response.data
}

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email, password,
  })
  return response.data
}
