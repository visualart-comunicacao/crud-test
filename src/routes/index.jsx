import { Routes, Route, Navigate } from 'react-router-dom'
import { Grid } from 'antd'

import MainLayout from '../components/layout/MainLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Caixa from '../pages/Caixa'
import Comandas from '../pages/Comandas'
import ComandasMobile from '../pages/Comandas/mobile'
import Cozinha from '../pages/Cozinha'
import Delivery from '../pages/Delivery'
import Produtos from '../pages/Produtos'
import Configuracoes from '../pages/Configuracoes'

function ComandasRedirect() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  if (isMobile) {
    return <Navigate to="/comandas-mobile" replace />
  }

  return <Navigate to="/comandas-desktop" replace />
}

export default function RoutesApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* rota inteligente */}
      <Route path="/comandas" element={<ComandasRedirect />} />

      {/* mobile fora do layout */}
      <Route path="/comandas-mobile" element={<ComandasMobile />} />

      {/* desktop com layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="caixa" element={<Caixa />} />
        <Route path="comandas-desktop" element={<Comandas />} />
        <Route path="cozinha" element={<Cozinha />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  )
}