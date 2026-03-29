import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  FireOutlined,
  CarOutlined,
  ShoppingOutlined,
  SettingOutlined,
  AreaChartOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'

const { Sider } = Layout

export default function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    {
      key: '/dashboard',
      icon: <AreaChartOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/caixa',
      icon: <DashboardOutlined />,
      label: 'Caixa',
    },
    {
      key: '/comandas',
      icon: <AppstoreOutlined />,
      label: 'Comandas',
    },
    {
      key: '/cozinha',
      icon: <FireOutlined />,
      label: 'Cozinha',
    },
    {
      key: '/delivery',
      icon: <CarOutlined />,
      label: 'Delivery',
    },
    {
      key: '/produtos',
      icon: <ShoppingOutlined />,
      label: 'Produtos',
    },
    {
      key: '/configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
  ]

  return (
    <Sider breakpoint="lg" collapsedWidth="80" theme="dark">
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        <img src="/logo.jpeg" alt="" style={{ maxWidth: '80px' }} />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  )
}