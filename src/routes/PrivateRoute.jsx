import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function PrivateRoute() {
  const token = localStorage.getItem('access_token')
  const rawUser = localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user?.mustChangePassword && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}