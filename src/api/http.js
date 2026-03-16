import axios from 'axios'
import { env, assertEnv } from '@/config/env'

assertEnv()

function getToken() {
  return localStorage.getItem('access_token')
}

const http = axios.create({
  baseURL: env.API_URL,
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  const isAuthLogin = config.url?.includes('/auth/login')

  if (token && !isAuthLogin) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
    }

    return Promise.reject(error)
  },
)

export default http