import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import App from './App'
import { AuthProvider } from '@/contexts/AuthContext'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#fa541c',
          borderRadius: 12,
          colorBgBase: '#101010',
          colorTextBase: '#f5f5f5',
        },
        components: {
          Layout: {
            bodyBg: '#101010',
            siderBg: '#171717',
            headerBg: '#171717',
            triggerBg: '#171717',
          },
          Card: {
            colorBgContainer: '#171717',
          },
          Table: {
            colorBgContainer: '#171717',
          },
          Modal: {
            contentBg: '#171717',
            headerBg: '#171717',
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
)