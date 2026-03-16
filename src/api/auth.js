import http from './http'

export async function login(payload) {
  const response = await http.post('/auth/login', payload)
  return response.data
}

export async function me() {
  const response = await http.get('/auth/me')
  return response.data
}

export async function changePassword(payload) {
  const response = await http.post('/auth/change-password', payload)
  return response.data
}