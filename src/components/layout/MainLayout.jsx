import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'

const { Content } = Layout

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar />

      <Layout>
        <AppHeader />

        <Content
          style={{
            margin: 0,
            padding: 16,
            background: '#101010',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}