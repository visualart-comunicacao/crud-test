import { Layout, Space, Input, Badge, Avatar, Typography } from 'antd'
import { BellOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'

const { Header } = Layout
const { Text } = Typography

function formatRole(role) {
  const map = {
    ADMIN: 'Administrador',
    CAIXA: 'Caixa',
    GARCOM: 'Garçom',
    ATENDENTE: 'Atendente',
  }

  return map[role] || role || ''
}

export default function AppHeader() {
  const auth = useAuth()
  const user = auth?.user

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #262626',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
        ESPETARIA SABOR & BRASA
      </Text>

      <Space size="middle">
        <Input.Search
          placeholder="Buscar comanda, pedido ou cliente"
          style={{ width: 320 }}
        />

        <Badge count={3}>
          <BellOutlined style={{ color: '#fff', fontSize: 18 }} />
        </Badge>

        <Space>
          <Avatar icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text style={{ color: '#fff', lineHeight: 1 }}>
              {user?.name || 'Usuário'}
            </Text>
            <Text style={{ color: '#aaa', fontSize: 12, lineHeight: 1 }}>
              {formatRole(user?.role)}
            </Text>
          </Space>
        </Space>
      </Space>
    </Header>
  )
}