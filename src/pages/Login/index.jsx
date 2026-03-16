import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'

const { Title, Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(values) {
    try {
      setLoading(true)

      const data = await login({
        username: values.usuario,
        password: values.senha,
      })

      localStorage.setItem('access_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      message.success('Login realizado com sucesso')

      if (data.user?.mustChangePassword) {
        navigate('/alterar-senha')
        return
      }

      navigate('/dashboard')
    } catch (error) {
      message.error(
        error?.response?.data?.message || 'Usuário ou senha inválidos',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#101010',
        padding: 16,
      }}
    >
      <Card style={{ width: 380 }} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ height: 70, marginBottom: 12 }}
          />

          <Title level={3} style={{ marginBottom: 4 }}>
            Sabor & Brasa
          </Title>

          <Text type="secondary">Acesse a gestão da espetaria</Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Usuário"
            name="usuario"
            rules={[{ required: true, message: 'Digite seu usuário' }]}
          >
            <Input placeholder="Digite seu usuário" />
          </Form.Item>

          <Form.Item
            label="Senha"
            name="senha"
            rules={[{ required: true, message: 'Digite sua senha' }]}
          >
            <Input.Password placeholder="Digite sua senha" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Entrar
          </Button>
        </Form>
      </Card>
    </div>
  )
}