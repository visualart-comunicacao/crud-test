import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function RoutesApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="comandas-mobile" element={<ComandasMobile />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="caixa" element={<Caixa />} />
        <Route path="comandas" element={<Comandas />} />
        <Route path="cozinha" element={<Cozinha />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  )
}