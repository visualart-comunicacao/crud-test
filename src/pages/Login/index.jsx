import { Card, Form, Input, Button, Typography } from 'antd'

const { Title, Text } = Typography

export default function Login() {
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
        <Title level={3} style={{ marginBottom: 8 }}>
          Entrar no sistema
        </Title>
        <Text type="secondary">Acesse a gestão da espetaria</Text>

        <Form layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="E-mail" name="email">
            <Input placeholder="Digite seu e-mail" />
          </Form.Item>

          <Form.Item label="Senha" name="senha">
            <Input.Password placeholder="Digite sua senha" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large">
            Entrar
          </Button>
        </Form>
      </Card>
    </div>
  )
}