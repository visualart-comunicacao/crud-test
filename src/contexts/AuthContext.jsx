import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import http from '@/api/http'

const AuthContext = createContext(null)

const STORAGE_TOKEN = 'saborebrasa_token'
const STORAGE_USER = 'saborebrasa_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN)
    const storedUser = localStorage.getItem(STORAGE_USER)

    if (storedToken) {
      setToken(storedToken)
      http.defaults.headers.common.Authorization = `Bearer ${storedToken}`
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(STORAGE_USER)
      }
    }

    setLoading(false)
  }, [])

  async function login(credentials) {
    const { data } = await http.post('/auth/login', credentials)

    const newToken = data?.token || ''
    const loggedUser = data?.user || null

    setToken(newToken)
    setUser(loggedUser)

    localStorage.setItem(STORAGE_TOKEN, newToken)
    localStorage.setItem(STORAGE_USER, JSON.stringify(loggedUser))

    http.defaults.headers.common.Authorization = `Bearer ${newToken}`

    return data
  }

  function logout() {
    setToken('')
    setUser(null)

    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    delete http.defaults.headers.common.Authorization
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: !!token,
      login,
      logout,
      setUser,
    }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}