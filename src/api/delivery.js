import http from '@/api/http'

export async function getDeliveryDashboard() {
  const { data } = await http.get('/delivery/dashboard')
  return data
}

export async function getDeliveryOrders(params = {}) {
  const { data } = await http.get('/delivery/orders', { params })
  return data
}

export async function createDeliveryOrder(payload) {
  const { data } = await http.post('/delivery/orders', payload)
  return data
}

export async function updateDeliveryStatus(id, status) {
  const { data } = await http.patch(`/delivery/orders/${id}/status`, { status })
  return data
}

export async function dispatchDeliveryOrder(id, driverId) {
  const { data } = await http.patch(`/delivery/orders/${id}/dispatch`, { driverId })
  return data
}

export async function deliverDeliveryOrder(id) {
  const { data } = await http.patch(`/delivery/orders/${id}/deliver`)
  return data
}

export async function getCustomers(params = {}) {
  const { data } = await http.get('/customers', { params })
  return data
}

export async function createCustomer(payload) {
  const { data } = await http.post('/customers', payload)
  return data
}

export async function getDrivers(params = {}) {
  const { data } = await http.get('/drivers', { params })
  return data
}

export async function createDriver(payload) {
  const { data } = await http.post('/drivers', payload)
  return data
}