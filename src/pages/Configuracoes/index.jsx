import React, { useMemo, useState } from 'react'
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd'
import {
  AppstoreOutlined,
  BellOutlined,
  DatabaseOutlined,
  PrinterOutlined,
  SaveOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

const initialValues = {
  empresa: {
    razaoSocial: 'Espetaria Sabor & Brasa',
    nomeFantasia: 'Sabor & Brasa',
    cnpj: '',
    telefone: '',
    whatsapp: '',
    email: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: 'Taquaritinga',
    uf: 'SP',
    cep: '',
    horarioFuncionamento: 'Terça a Domingo - 18:00 às 23:30',
    taxaServico: 10,
    couvert: 0,
    rodapeCupom: 'Obrigado pela preferência! Volte sempre.',
  },
  operacao: {
    usaMesa: true,
    usaComanda: true,
    comandaObrigatoria: false,
    qtdMesas: 30,
    separarPedidoPorSetor: true,
    bloquearVendaSemEstoque: true,
    exigirObservacaoCancelamento: true,
    permitirDescontoLivre: false,
  },
  impressao: {
    impressoraCozinha: '',
    impressoraBar: '',
    impressoraCaixa: '',
    tamanhoPapel: '80mm',
    imprimirAutomaticamente: true,
    imprimirDuasVias: false,
    imprimirNomeGarcom: true,
    imprimirHorario: true,
  },
  notificacoes: {
    somNovoPedido: true,
    alertaPedidoPronto: true,
    alertaMesaAbertaSemConsumo: false,
    tempoAlertaMesaSemConsumo: 30,
  },
  sistema: {
    tema: 'light',
    formatoData: 'DD/MM/YYYY',
    fusoHorario: 'America/Sao_Paulo',
    logoutAutomaticoMinutos: 30,
    forcarTrocaSenhaPadrao: true,
    exibirAtalhosInicio: true,
  },
  integracoes: {
    whatsappToken: '',
    webhookPedidos: '',
    ifoodHabilitado: false,
    apiEntregaHabilitada: false,
  },
}

function SectionCard({ title, subtitle, children }) {
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>

        {subtitle ? <Text type="secondary">{subtitle}</Text> : null}

        <Divider style={{ margin: '12px 0' }} />

        {children}
      </Space>
    </Card>
  )
}

export default function ConfiguracoesPage() {
  const [form] = Form.useForm()
  const [logoFileList, setLogoFileList] = useState([])
  const [saving, setSaving] = useState(false)

  const uploadProps = useMemo(
    () => ({
      beforeUpload: () => false,
      maxCount: 1,
      fileList: logoFileList,
      onChange: ({ fileList }) => setLogoFileList(fileList),
    }),
    [logoFileList],
  )

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      console.log('CONFIGURAÇÕES', values)
      console.log('LOGO', logoFileList)

      await new Promise((resolve) => setTimeout(resolve, 600))
      message.success('Configurações salvas com sucesso!')
    } catch (error) {
      message.error('Revise os campos obrigatórios antes de salvar.')
    } finally {
      setSaving(false)
    }
  }

  const items = [
    {
      key: 'empresa',
      label: (
        <Space>
          <ShopOutlined />
          Empresa
        </Space>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <SectionCard
            title="Identidade do restaurante"
            subtitle="Dados principais que aparecem no sistema, relatórios e impressões."
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Avatar
                    size={88}
                    icon={<ShopOutlined />}
                    shape="square"
                    style={{ borderRadius: 16 }}
                  />
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Enviar logo</Button>
                  </Upload>
                  <Text type="secondary">
                    PNG ou JPG. Ideal para cupom e tela inicial.
                  </Text>
                </Space>
              </Col>

              <Col xs={24} md={16}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name={['empresa', 'razaoSocial']}
                      label="Razão social"
                      rules={[{ required: true, message: 'Informe a razão social' }]}
                    >
                      <Input placeholder="Razão social" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name={['empresa', 'nomeFantasia']}
                      label="Nome fantasia"
                      rules={[{ required: true, message: 'Informe o nome fantasia' }]}
                    >
                      <Input placeholder="Nome fantasia" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name={['empresa', 'cnpj']} label="CNPJ">
                      <Input placeholder="00.000.000/0000-00" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name={['empresa', 'telefone']} label="Telefone">
                      <Input placeholder="(00) 0000-0000" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name={['empresa', 'whatsapp']} label="WhatsApp">
                      <Input placeholder="(00) 00000-0000" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item name={['empresa', 'email']} label="E-mail">
                      <Input placeholder="contato@restaurante.com" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </SectionCard>

          <SectionCard
            title="Endereço e atendimento"
            subtitle="Informações úteis para relatórios, cupom e contato com cliente."
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['empresa', 'endereco']} label="Endereço">
                  <Input placeholder="Rua / Avenida" />
                </Form.Item>
              </Col>

              <Col xs={24} md={4}>
                <Form.Item name={['empresa', 'numero']} label="Número">
                  <Input placeholder="123" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name={['empresa', 'bairro']} label="Bairro">
                  <Input placeholder="Centro" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name={['empresa', 'cidade']} label="Cidade">
                  <Input placeholder="Cidade" />
                </Form.Item>
              </Col>

              <Col xs={24} md={4}>
                <Form.Item name={['empresa', 'uf']} label="UF">
                  <Input placeholder="SP" maxLength={2} />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item name={['empresa', 'cep']} label="CEP">
                  <Input placeholder="00000-000" />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  name={['empresa', 'horarioFuncionamento']}
                  label="Horário de funcionamento"
                >
                  <Input placeholder="Ex.: Todos os dias - 18:00 às 23:00" />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>

          <SectionCard
            title="Valores e observações"
            subtitle="Configurações que impactam diretamente o atendimento."
          >
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Form.Item name={['empresa', 'taxaServico']} label="Taxa de serviço (%)">
                  <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item name={['empresa', 'couvert']} label="Couvert (R$)">
                  <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name={['empresa', 'rodapeCupom']}
                  label="Rodapé do cupom / comanda"
                >
                  <TextArea rows={4} placeholder="Mensagem exibida nas impressões" />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>
        </Space>
      ),
    },
    {
      key: 'operacao',
      label: (
        <Space>
          <AppstoreOutlined />
          Operação
        </Space>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <SectionCard
            title="Fluxo de atendimento"
            subtitle="Defina como o restaurante opera no dia a dia."
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['operacao', 'usaMesa']}
                  label="Controla mesas"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['operacao', 'usaComanda']}
                  label="Usa comanda"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['operacao', 'comandaObrigatoria']}
                  label="Comanda obrigatória"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name={['operacao', 'qtdMesas']} label="Quantidade de mesas">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>

          <SectionCard
            title="Regras do sistema"
            subtitle="Boas travas para evitar erro de operação."
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['operacao', 'separarPedidoPorSetor']}
                  label="Separar impressão por setor"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['operacao', 'bloquearVendaSemEstoque']}
                  label="Bloquear venda sem estoque"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['operacao', 'exigirObservacaoCancelamento']}
                  label="Exigir motivo no cancelamento"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['operacao', 'permitirDescontoLivre']}
                  label="Permitir desconto livre"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>
        </Space>
      ),
    },
    {
      key: 'impressao',
      label: (
        <Space>
          <PrinterOutlined />
          Impressão
        </Space>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <SectionCard
            title="Impressoras"
            subtitle="Defina por setor para agilizar a produção dos pedidos."
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['impressao', 'impressoraCozinha']}
                  label="Impressora da cozinha"
                >
                  <Input placeholder="Ex.: EPSON TM-T20" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['impressao', 'impressoraBar']}
                  label="Impressora do bar"
                >
                  <Input placeholder="Ex.: ELGIN i9" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['impressao', 'impressoraCaixa']}
                  label="Impressora do caixa"
                >
                  <Input placeholder="Ex.: Bematech" />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item name={['impressao', 'tamanhoPapel']} label="Tamanho do papel">
                  <Select
                    options={[
                      { value: '58mm', label: '58mm' },
                      { value: '80mm', label: '80mm' },
                      { value: 'A4', label: 'A4' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>

          <SectionCard
            title="Comportamento da impressão"
            subtitle="Escolha o que sai automaticamente nos pedidos."
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['impressao', 'imprimirAutomaticamente']}
                  label="Imprimir automaticamente ao lançar pedido"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['impressao', 'imprimirDuasVias']}
                  label="Imprimir duas vias"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['impressao', 'imprimirNomeGarcom']}
                  label="Imprimir nome do garçom"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['impressao', 'imprimirHorario']}
                  label="Imprimir horário"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>
        </Space>
      ),
    },
    {
      key: 'notificacoes',
      label: (
        <Space>
          <BellOutlined />
          Notificações
        </Space>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <SectionCard
            title="Alertas da operação"
            subtitle="Ajuda a equipe a não perder pedido e nem mesa parada."
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['notificacoes', 'somNovoPedido']}
                  label="Som ao entrar novo pedido"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['notificacoes', 'alertaPedidoPronto']}
                  label="Alerta de pedido pronto"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['notificacoes', 'alertaMesaAbertaSemConsumo']}
                  label="Alertar mesa aberta sem consumo"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['notificacoes', 'tempoAlertaMesaSemConsumo']}
                  label="Tempo para alerta (minutos)"
                >
                  <InputNumber min={5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>
        </Space>
      ),
    },
    {
      key: 'sistema',
      label: (
        <Space>
          <SettingOutlined />
          Sistema
        </Space>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <SectionCard
            title="Preferências gerais"
            subtitle="Configurações que impactam a experiência de uso do sistema."
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name={['sistema', 'tema']} label="Tema">
                  <Select
                    options={[
                      { value: 'light', label: 'Claro' },
                      { value: 'dark', label: 'Escuro' },
                      { value: 'system', label: 'Seguir sistema' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name={['sistema', 'formatoData']} label="Formato de data">
                  <Select
                    options={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name={['sistema', 'fusoHorario']} label="Fuso horário">
                  <Select
                    options={[
                      { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['sistema', 'logoutAutomaticoMinutos']}
                  label="Logout automático (minutos)"
                >
                  <InputNumber min={5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['sistema', 'forcarTrocaSenhaPadrao']}
                  label="Forçar troca de senha padrão"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['sistema', 'exibirAtalhosInicio']}
                  label="Exibir atalhos na tela inicial"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>
        </Space>
      ),
    },
    {
      key: 'usuarios',
      label: (
        <Space>
          <TeamOutlined />
          Usuários
        </Space>
      ),
      children: (
        <SectionCard
          title="Políticas de acesso"
          subtitle="Essas opções combinam com o fluxo que você já montou na tela de usuários."
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Tag color="blue" style={{ width: 'fit-content' }}>
              Dica
            </Tag>

            <Text>
              Aqui vale centralizar regras como: senha padrão inicial, obrigar troca de
              senha no primeiro acesso, permitir reset apenas para ADMIN e definir tempo
              de sessão.
            </Text>

            <Text type="secondary">
              Como você já criou o fluxo de reset de senha para ADMIN, essa aba pode
              ficar mais institucional e menos operacional.
            </Text>

            <Card size="small" style={{ borderRadius: 12, background: '#fafafa' }}>
              <Space>
                <UserOutlined />
                <Text strong>Senha padrão sugerida:</Text>
                <Tag>123456</Tag>
              </Space>
            </Card>
          </Space>
        </SectionCard>
      ),
    },
    {
      key: 'integracoes',
      label: (
        <Space>
          <DatabaseOutlined />
          Integrações
        </Space>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <SectionCard
            title="Conexões externas"
            subtitle="Deixe pronto para crescer depois sem mexer no layout da tela."
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name={['integracoes', 'whatsappToken']}
                  label="Token do WhatsApp"
                >
                  <Input.Password placeholder="Cole aqui o token da integração" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name={['integracoes', 'webhookPedidos']}
                  label="Webhook de pedidos"
                >
                  <Input placeholder="https://..." />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['integracoes', 'ifoodHabilitado']}
                  label="Integração iFood habilitada"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['integracoes', 'apiEntregaHabilitada']}
                  label="Integração entrega / motoboy"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card style={{ borderRadius: 20 }}>
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={4}>
                <Title level={3} style={{ margin: 0 }}>
                  Configurações do sistema
                </Title>
                <Text type="secondary">
                  Organize os dados da empresa, operação, impressão e regras internas do
                  restaurante.
                </Text>
              </Space>
            </Col>

            <Col xs={24} md="auto">
              <Space wrap>
                <Button onClick={() => form.resetFields()}>Restaurar padrão</Button>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                >
                  Salvar configurações
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Form form={form} layout="vertical" initialValues={initialValues}>
          <Card style={{ borderRadius: 20 }}>
            <Tabs items={items} tabPosition="top" />
          </Card>
        </Form>
      </Space>
    </div>
  )
}