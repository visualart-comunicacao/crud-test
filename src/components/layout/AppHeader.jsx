import { Layout, Space, Input, Badge, Avatar, Typography } from 'antd'
import { BellOutlined, UserOutlined } from '@ant-design/icons'

const { Header } = Layout
const { Text } = Typography

export default function AppHeader() {
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
          <Text style={{ color: '#fff' }}>Administrador</Text>
        </Space>
      </Space>
    </Header>
  )
}