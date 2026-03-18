import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useIsMobile from '@/hooks/useIsMobile'

export default function ResponsiveRedirect() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const path = location.pathname

    // só controla rotas de comandas
    if (path.includes('/comandas')) {
      if (isMobile && path !== '/comandas-mobile') {
        navigate('/comandas-mobile', { replace: true })
      }

      if (!isMobile && path === '/comandas-mobile') {
        navigate('/comandas-desktop', { replace: true })
      }
    }
  }, [isMobile, location.pathname])

  return null
}