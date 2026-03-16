import React, { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

const statusColors = {
  ABERTO: 'success',
  FECHADO: 'default',
}

const initialCaixa = {
  status: 'ABERTO',
  operador: 'Alex Sander',
  dataAbertura: '2026-03-16 18:00',
  dataFechamento: null,
  fundoInicial: 150,
  entradas: 2350,
  saidas: 180,
  saldoEsperado: 2320,
  saldoInformado: 0,
  diferenca: 0,
}

const initialMovimentacoes = [
  {
    id: 1,
    dataHora: '2026-03-16 18:15',
    tipo: 'VENDA',
    categoria: 'Mesa 03',
    descricao: 'Pedido mesa 03',
    formaPagamento: 'PIX',
    valor: 120,
    usuario: 'Alex',
  },
  {
    id: 2,
    dataHora: '2026-03-16 18:40',
    tipo: 'VENDA',
    categoria: 'Mesa 08',
    descricao: 'Pedido mesa 08',
    formaPagamento: 'DINHEIRO',
    valor: 86,
    usuario: 'Alex',
  },
  {
    id: 3,
    dataHora: '2026-03-16 19:05',
    tipo: 'DESPESA',
    categoria: 'Compra emergencial',
    descricao: 'Compra de gelo',
    formaPagamento: 'DINHEIRO',
    valor: 30,
    usuario: 'Alex',
  },
  {
    id: 4,
    dataHora: '2026-03-16 20:10',
    tipo: 'SANGRIA',
    categoria: 'Retirada',
    descricao: 'Retirada parcial do caixa',
    formaPagamento: 'DINHEIRO',
    valor: 150,
    usuario: 'Alex',
  },
]

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getTipoTag(tipo) {
  const map = {
    VENDA: 'green',
    DESPESA: 'red',
    SANGRIA: 'orange',
    SUPRIMENTO: 'blue',
    ENTRADA: 'cyan',
  }

  return <Tag color={map[tipo] || 'default'}>{tipo}</Tag>
}

export default function CaixaPage() {
  const [caixa, setCaixa] = useState(initialCaixa)
  const [movimentacoes, setMovimentacoes] = useState(initialMovimentacoes)

  const [openAbertura, setOpenAbertura] = useState(false)
  const [openFechamento, setOpenFechamento] = useState(false)
  const [openLancamento, setOpenLancamento] = useState(false)

  const [formAbertura] = Form.useForm()
  const [formFechamento] = Form.useForm()
  const [formLancamento] = Form.useForm()

  const resumoFormas = useMemo(() => {
    const totals = {
      DINHEIRO: 0,
      PIX: 0,
      DEBITO: 0,
      CREDITO: 0,
    }

    movimentacoes.forEach((item) => {
      if (item.tipo === 'VENDA') {
        if (totals[item.formaPagamento] !== undefined) {
          totals[item.formaPagamento] += Number(item.valor || 0)
        }
      }
    })

    return totals
  }, [movimentacoes])

  const columns = [
    {
      title: 'Data/Hora',
      dataIndex: 'dataHora',
      key: 'dataHora',
      width: 160,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
      render: (_, record) => getTipoTag(record.tipo),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
      width: 180,
    },
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao',
    },
    {
      title: 'Pagamento',
      dataIndex: 'formaPagamento',
      key: 'formaPagamento',
      width: 140,
      render: (value) => value || '-',
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      width: 140,
      align: 'right',
      render: (value) => moeda(value),
    },
    {
      title: 'Usuário',
      dataIndex: 'usuario',
      key: 'usuario',
      width: 140,
    },
  ]

  const handleAbrirCaixa = async () => {
    try {
      const values = await formAbertura.validateFields()

      setCaixa({
        ...caixa,
        status: 'ABERTO',
        operador: values.operador,
        dataAbertura: dayjs().format('YYYY-MM-DD HH:mm'),
        dataFechamento: null,
        fundoInicial: Number(values.fundoInicial || 0),
        entradas: 0,
        saidas: 0,
        saldoEsperado: Number(values.fundoInicial || 0),
        saldoInformado: 0,
        diferenca: 0,
      })

      setMovimentacoes([])
      setOpenAbertura(false)
      formAbertura.resetFields()
      message.success('Caixa aberto com sucesso!')
    } catch (error) {
      message.error('Preencha os dados da abertura.')
    }
  }

  const handleSalvarLancamento = async () => {
    try {
      const values = await formLancamento.validateFields()

      const novo = {
        id: Date.now(),
        dataHora: dayjs().format('YYYY-MM-DD HH:mm'),
        tipo: values.tipo,
        categoria: values.categoria,
        descricao: values.descricao,
        formaPagamento: values.formaPagamento || null,
        valor: Number(values.valor || 0),
        usuario: caixa.operador,
      }

      const isSaida = ['DESPESA', 'SANGRIA'].includes(values.tipo)
      const isEntrada = ['SUPRIMENTO', 'ENTRADA'].includes(values.tipo)

      setMovimentacoes((prev) => [novo, ...prev])

      setCaixa((prev) => {
        const novasEntradas = isEntrada ? prev.entradas + novo.valor : prev.entradas
        const novasSaidas = isSaida ? prev.saidas + novo.valor : prev.saidas
        const novoSaldoEsperado =
          prev.fundoInicial + novasEntradas + getVendasTotalApenasDinheiro(movimentacoes, novo) - novasSaidas

        return {
          ...prev,
          entradas: novasEntradas,
          saidas: novasSaidas,
          saldoEsperado: novoSaldoEsperado,
        }
      })

      setOpenLancamento(false)
      formLancamento.resetFields()
      message.success('Lançamento registrado com sucesso!')
    } catch (error) {
      message.error('Preencha os dados do lançamento.')
    }
  }

  const handleFecharCaixa = async () => {
    try {
      const values = await formFechamento.validateFields()
      const saldoInformado = Number(values.saldoInformado || 0)
      const diferenca = saldoInformado - Number(caixa.saldoEsperado || 0)

      setCaixa((prev) => ({
        ...prev,
        status: 'FECHADO',
        dataFechamento: dayjs().format('YYYY-MM-DD HH:mm'),
        saldoInformado,
        diferenca,
      }))

      setOpenFechamento(false)
      formFechamento.resetFields()
      message.success('Caixa fechado com sucesso!')
    } catch (error) {
      message.error('Informe os dados para fechamento.')
    }
  }

  const totalVendas = useMemo(() => {
    return movimentacoes
      .filter((item) => item.tipo === 'VENDA')
      .reduce((acc, item) => acc + Number(item.valor || 0), 0)
  }, [movimentacoes])

  const totalDespesasSaidas = useMemo(() => {
    return movimentacoes
      .filter((item) => ['DESPESA', 'SANGRIA'].includes(item.tipo))
      .reduce((acc, item) => acc + Number(item.valor || 0), 0)
  }, [movimentacoes])

  const tabs = [
    {
      key: 'resumo',
      label: 'Resumo',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Statistic
                  title="Fundo inicial"
                  value={caixa.fundoInicial}
                  precision={2}
                  prefix={<InboxOutlined />}
                  formatter={(value) => moeda(value)}
                />
              </Card>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Statistic
                  title="Total de vendas"
                  value={totalVendas}
                  precision={2}
                  prefix={<DollarOutlined />}
                  formatter={(value) => moeda(value)}
                />
              </Card>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Statistic
                  title="Saídas"
                  value={totalDespesasSaidas}
                  precision={2}
                  prefix={<MinusCircleOutlined />}
                  formatter={(value) => moeda(value)}
                />
              </Card>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Statistic
                  title="Saldo esperado"
                  value={caixa.saldoEsperado}
                  precision={2}
                  prefix={<SafetyOutlined />}
                  formatter={(value) => moeda(value)}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Operador</Text>
                  <Text strong>{caixa.operador}</Text>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Data de abertura</Text>
                  <Text strong>{caixa.dataAbertura || '-'}</Text>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Data de fechamento</Text>
                  <Text strong>{caixa.dataFechamento || '-'}</Text>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Status</Text>
                  <Badge
                    status={statusColors[caixa.status]}
                    text={<Text strong>{caixa.status}</Text>}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          <Card title="Resumo por forma de pagamento" style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Statistic title="Dinheiro" value={resumoFormas.DINHEIRO} formatter={(v) => moeda(v)} />
              </Col>
              <Col xs={24} md={6}>
                <Statistic title="PIX" value={resumoFormas.PIX} formatter={(v) => moeda(v)} />
              </Col>
              <Col xs={24} md={6}>
                <Statistic title="Débito" value={resumoFormas.DEBITO} formatter={(v) => moeda(v)} />
              </Col>
              <Col xs={24} md={6}>
                <Statistic title="Crédito" value={resumoFormas.CREDITO} formatter={(v) => moeda(v)} />
              </Col>
            </Row>
          </Card>
        </Space>
      ),
    },
    {
      key: 'movimentacoes',
      label: 'Movimentações',
      children: (
        <Card style={{ borderRadius: 16 }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={movimentacoes}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      ),
    },
    {
      key: 'fechamento',
      label: 'Fechamento',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Statistic title="Saldo esperado" value={caixa.saldoEsperado} formatter={(v) => moeda(v)} />
              </Col>
              <Col xs={24} md={8}>
                <Statistic title="Saldo informado" value={caixa.saldoInformado} formatter={(v) => moeda(v)} />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Diferença"
                  value={caixa.diferenca}
                  formatter={(v) => moeda(v)}
                  valueStyle={{
                    color:
                      Number(caixa.diferenca || 0) === 0
                        ? undefined
                        : Number(caixa.diferenca || 0) > 0
                        ? '#1677ff'
                        : '#cf1322',
                  }}
                />
              </Col>
            </Row>

            <Divider />

            <Space wrap>
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setOpenFechamento(true)}
                disabled={caixa.status !== 'ABERTO'}
              >
                Fechar caixa
              </Button>
            </Space>
          </Card>
        </Space>
      ),
    },
    {
      key: 'historico',
      label: 'Histórico',
      children: (
        <Card style={{ borderRadius: 16 }}>
          <Text type="secondary">
            Depois a gente pode ligar essa aba no backend para listar os caixas anteriores,
            com operador, abertura, fechamento, valor final e diferença.
          </Text>
        </Card>
      ),
    },
  ]

  return (
    <>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card style={{ borderRadius: 20 }}>
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={4}>
                <Title level={3} style={{ margin: 0 }}>
                  Caixa
                </Title>
                <Text type="secondary">
                  Controle de abertura, fechamento, despesas, sangrias e movimentações do dia.
                </Text>
              </Space>
            </Col>

            <Col xs={24} md="auto">
              <Space wrap>
                <Badge
                  status={statusColors[caixa.status]}
                  text={<Text strong>{caixa.status}</Text>}
                />

                <Button
                  icon={<CheckCircleOutlined />}
                  type="primary"
                  onClick={() => setOpenAbertura(true)}
                  disabled={caixa.status === 'ABERTO'}
                >
                  Abrir caixa
                </Button>

                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={() => setOpenLancamento(true)}
                  disabled={caixa.status !== 'ABERTO'}
                >
                  Novo lançamento
                </Button>

                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setOpenFechamento(true)}
                  disabled={caixa.status !== 'ABERTO'}
                >
                  Fechar caixa
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={6}>
            <Card style={{ borderRadius: 16 }}>
              <Statistic
                title="Entradas manuais"
                value={caixa.entradas}
                formatter={(v) => moeda(v)}
                prefix={<PlusCircleOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Card style={{ borderRadius: 16 }}>
              <Statistic
                title="Saídas"
                value={caixa.saidas}
                formatter={(v) => moeda(v)}
                prefix={<MinusCircleOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Card style={{ borderRadius: 16 }}>
              <Statistic
                title="Saldo esperado"
                value={caixa.saldoEsperado}
                formatter={(v) => moeda(v)}
                prefix={<SafetyOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Card style={{ borderRadius: 16 }}>
              <Statistic
                title="Diferença"
                value={caixa.diferenca}
                formatter={(v) => moeda(v)}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ borderRadius: 20 }}>
          <Tabs items={tabs} />
        </Card>
      </Space>

      <Modal
        title="Abrir caixa"
        open={openAbertura}
        onCancel={() => setOpenAbertura(false)}
        onOk={handleAbrirCaixa}
        okText="Abrir caixa"
        cancelText="Cancelar"
      >
        <Form
          form={formAbertura}
          layout="vertical"
          initialValues={{
            operador: 'Alex Sander',
            fundoInicial: 150,
            observacao: '',
          }}
        >
          <Form.Item
            name="operador"
            label="Operador"
            rules={[{ required: true, message: 'Informe o operador' }]}
          >
            <Input placeholder="Nome do operador" />
          </Form.Item>

          <Form.Item
            name="fundoInicial"
            label="Fundo inicial"
            rules={[{ required: true, message: 'Informe o valor inicial' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0,00"
            />
          </Form.Item>

          <Form.Item name="observacao" label="Observação">
            <TextArea rows={3} placeholder="Ex.: troco inicial da noite" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Novo lançamento no caixa"
        open={openLancamento}
        onCancel={() => setOpenLancamento(false)}
        onOk={handleSalvarLancamento}
        okText="Salvar lançamento"
        cancelText="Cancelar"
      >
        <Form form={formLancamento} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="tipo"
                label="Tipo"
                rules={[{ required: true, message: 'Selecione o tipo' }]}
              >
                <Select
                  options={[
                    { value: 'DESPESA', label: 'Despesa' },
                    { value: 'SANGRIA', label: 'Sangria' },
                    { value: 'SUPRIMENTO', label: 'Suprimento' },
                    { value: 'ENTRADA', label: 'Entrada avulsa' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="formaPagamento"
                label="Forma de pagamento"
                rules={[{ required: true, message: 'Selecione a forma de pagamento' }]}
              >
                <Select
                  options={[
                    { value: 'DINHEIRO', label: 'Dinheiro' },
                    { value: 'PIX', label: 'PIX' },
                    { value: 'DEBITO', label: 'Débito' },
                    { value: 'CREDITO', label: 'Crédito' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="categoria"
            label="Categoria"
            rules={[{ required: true, message: 'Informe a categoria' }]}
          >
            <Input placeholder="Ex.: Compra emergencial, retirada, troco..." />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Informe a descrição' }]}
          >
            <Input placeholder="Descreva o lançamento" />
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor"
            rules={[{ required: true, message: 'Informe o valor' }]}
          >
            <InputNumber
              min={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0,00"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Fechar caixa"
        open={openFechamento}
        onCancel={() => setOpenFechamento(false)}
        onOk={handleFecharCaixa}
        okText="Confirmar fechamento"
        cancelText="Cancelar"
      >
        <Form form={formFechamento} layout="vertical">
          <Form.Item label="Saldo esperado">
            <Input value={moeda(caixa.saldoEsperado)} disabled />
          </Form.Item>

          <Form.Item
            name="saldoInformado"
            label="Saldo informado"
            rules={[{ required: true, message: 'Informe o saldo contado' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0,00"
            />
          </Form.Item>

          <Form.Item name="observacao" label="Observação">
            <TextArea rows={3} placeholder="Observações do fechamento" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function getVendasTotalApenasDinheiro(movimentacoes, novoLancamento) {
  const lista = [...movimentacoes]

  if (novoLancamento) {
    lista.push(novoLancamento)
  }

  return lista
    .filter((item) => item.tipo === 'VENDA' && item.formaPagamento === 'DINHEIRO')
    .reduce((acc, item) => acc + Number(item.valor || 0), 0)
}