import axios from "axios"
import { API_BASE } from "./config"

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
