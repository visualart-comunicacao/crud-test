import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Modal,
  Alert,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { login, changePassword } from '@/api/auth'

const { Title, Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [mustChangePasswordModalOpen, setMustChangePasswordModalOpen] =
    useState(false)

  const [loginUser, setLoginUser] = useState(null)
  const [loginToken, setLoginToken] = useState('')
  const [changePasswordForm] = Form.useForm()

  const navigate = useNavigate()

  async function handleLogin(values) {
    try {
      setLoading(true)

      const data = await login({
        username: values.usuario,
        password: values.senha,
      })

      const token = data?.token || ''
      const user = data?.user || null

      localStorage.setItem('access_token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user?.mustChangePassword) {
        setLoginUser(user)
        setLoginToken(token)
        setMustChangePasswordModalOpen(true)
        message.warning('Você precisa alterar sua senha para continuar.')
        return
      }

      message.success('Login realizado com sucesso')
      navigate('/dashboard')
    } catch (error) {
      message.error(
        error?.response?.data?.message || 'Usuário ou senha inválidos',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(values) {
    try {
      setChangePasswordLoading(true)

      if (!loginToken) {
        message.error('Sessão inválida. Faça login novamente.')
        setMustChangePasswordModalOpen(false)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        return
      }

      await changePassword(
        {
          currentPassword: values.senhaAtual,
          newPassword: values.novaSenha,
          confirmPassword: values.confirmarNovaSenha,
        },
        loginToken,
      )

      const updatedUser = loginUser
        ? { ...loginUser, mustChangePassword: false }
        : null

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      setLoginUser(updatedUser)
      setMustChangePasswordModalOpen(false)
      changePasswordForm.resetFields()

      message.success('Senha alterada com sucesso')
      navigate('/dashboard')
    } catch (error) {
      message.error(
        error?.response?.data?.message || 'Não foi possível alterar a senha',
      )
    } finally {
      setChangePasswordLoading(false)
    }
  }

  return (
    <>
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

      <Modal
        title="Alteração obrigatória de senha"
        open={mustChangePasswordModalOpen}
        closable={false}
        maskClosable={false}
        keyboard={false}
        footer={null}
        destroyOnHidden
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Primeiro acesso detectado"
          description="Por segurança, você precisa definir uma nova senha antes de continuar."
        />

        <Form
          form={changePasswordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Senha atual"
            name="senhaAtual"
            rules={[{ required: true, message: 'Digite sua senha atual' }]}
          >
            <Input.Password placeholder="Digite sua senha atual" />
          </Form.Item>

          <Form.Item
            label="Nova senha"
            name="novaSenha"
            rules={[
              { required: true, message: 'Digite a nova senha' },
              { min: 6, message: 'A nova senha deve ter pelo menos 6 caracteres' },
            ]}
          >
            <Input.Password placeholder="Digite a nova senha" />
          </Form.Item>

          <Form.Item
            label="Confirmar nova senha"
            name="confirmarNovaSenha"
            dependencies={['novaSenha']}
            rules={[
              { required: true, message: 'Confirme a nova senha' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('novaSenha') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('As senhas não conferem'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirme a nova senha" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={changePasswordLoading}
          >
            Alterar senha e continuar
          </Button>
        </Form>
      </Modal>
    </>
  )
}