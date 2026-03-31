import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
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
  DeleteOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import http from '@/api/http'

const { Title, Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

const statusColors = {
  ABERTO: 'success',
  FECHADO: 'default',
}

const emptyCaixa = {
  id: null,
  status: 'FECHADO',
  operador: '-',
  operadorId: null,
  dataAbertura: null,
  dataFechamento: null,
  fundoInicial: 0,
  entradas: 0,
  saidas: 0,
  totalVendas: 0,
  saldoEsperado: 0,
  saldoInformado: 0,
  diferenca: 0,
  observacaoAbertura: '',
  observacaoFechamento: '',
  resumoFormas: {
    DINHEIRO: 0,
    PIX: 0,
    DEBITO: 0,
    CREDITO: 0,
    OUTRO: 0,
  },
}

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
    AJUSTE: 'purple',
  }

  return <Tag color={map[tipo] || 'default'}>{tipo}</Tag>
}

function getApiError(error, fallback) {
  return error?.response?.data?.message || fallback
}

function normalizeProduct(product) {
  return {
    id: product?.id,
    nome: product?.nome || product?.name || 'Produto sem nome',
    categoria:
      product?.categoriaNome ||
      product?.categoryName ||
      product?.category?.name ||
      'Sem categoria',
    preco: Number(product?.preco || product?.price || 0),
    ativo: Boolean(product?.ativo ?? product?.isActive ?? true),
    disponivelBalcao: Boolean(
      product?.disponivelBalcao ??
        product?.availableCounter ??
        product?.availableInStore ??
        true
    ),
  }
}

export default function CaixaPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [loadingProdutos, setLoadingProdutos] = useState(false)

  const [caixa, setCaixa] = useState(emptyCaixa)
  const [movimentacoes, setMovimentacoes] = useState([])
  const [historico, setHistorico] = useState([])
  const [produtos, setProdutos] = useState([])
  const [buscaProduto, setBuscaProduto] = useState('')
  const [carrinhoVendaRapida, setCarrinhoVendaRapida] = useState([])

  const [openAbertura, setOpenAbertura] = useState(false)
  const [openFechamento, setOpenFechamento] = useState(false)
  const [openLancamento, setOpenLancamento] = useState(false)
  const [openVendaRapida, setOpenVendaRapida] = useState(false)

  const [filtroHistorico, setFiltroHistorico] = useState(null)

  const [formAbertura] = Form.useForm()
  const [formFechamento] = Form.useForm()
  const [formLancamento] = Form.useForm()
  const [formVendaRapida] = Form.useForm()

  useEffect(() => {
    loadCurrentCashRegister()
    loadHistorico()
  }, [])

  const resumoFormas = useMemo(() => {
    return {
      DINHEIRO: Number(caixa?.resumoFormas?.DINHEIRO || 0),
      PIX: Number(caixa?.resumoFormas?.PIX || 0),
      DEBITO: Number(caixa?.resumoFormas?.DEBITO || 0),
      CREDITO: Number(caixa?.resumoFormas?.CREDITO || 0),
      OUTRO: Number(caixa?.resumoFormas?.OUTRO || 0),
    }
  }, [caixa])

  const totalVendas = useMemo(() => Number(caixa?.totalVendas || 0), [caixa])
  const totalDespesasSaidas = useMemo(() => Number(caixa?.saidas || 0), [caixa])

  const produtosFiltrados = useMemo(() => {
    const termo = buscaProduto.trim().toLowerCase()

    const base = produtos.filter(
      (produto) => produto.ativo && produto.disponivelBalcao
    )

    if (!termo) return base

    return base.filter((produto) => {
      return (
        produto.nome.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo)
      )
    })
  }, [produtos, buscaProduto])

  const totalItensCarrinho = useMemo(() => {
    return carrinhoVendaRapida.reduce(
      (acc, item) => acc + Number(item.quantidade || 0),
      0
    )
  }, [carrinhoVendaRapida])

  const totalVendaRapida = useMemo(() => {
    return carrinhoVendaRapida.reduce((acc, item) => {
      return acc + Number(item.quantidade || 0) * Number(item.preco || 0)
    }, 0)
  }, [carrinhoVendaRapida])

  const formaPagamentoVendaRapida = Form.useWatch(
    'formaPagamento',
    formVendaRapida
  )
  const valorRecebidoVendaRapida = Form.useWatch(
    'valorRecebido',
    formVendaRapida
  )

  const trocoVendaRapida = useMemo(() => {
    const recebido = Number(valorRecebidoVendaRapida || 0)
    const total = Number(totalVendaRapida || 0)

    if (String(formaPagamentoVendaRapida || '') !== 'DINHEIRO') return 0
    if (recebido <= 0) return 0
    if (recebido < total) return 0

    return recebido - total
  }, [formaPagamentoVendaRapida, valorRecebidoVendaRapida, totalVendaRapida])

  const faltaReceberVendaRapida = useMemo(() => {
    const recebido = Number(valorRecebidoVendaRapida || 0)
    const total = Number(totalVendaRapida || 0)

    if (String(formaPagamentoVendaRapida || '') !== 'DINHEIRO') return 0
    if (recebido >= total) return 0

    return total - recebido
  }, [formaPagamentoVendaRapida, valorRecebidoVendaRapida, totalVendaRapida])

  async function loadCurrentCashRegister(showLoader = true) {
    try {
      if (showLoader) setLoading(true)

      const { data } = await http.get('/cash-register/current')

      if (!data || !data.caixa) {
        setCaixa(emptyCaixa)
        setMovimentacoes([])
        return
      }

      setCaixa({
        ...emptyCaixa,
        ...data.caixa,
        resumoFormas: {
          ...emptyCaixa.resumoFormas,
          ...(data.caixa.resumoFormas || {}),
        },
      })

      setMovimentacoes(Array.isArray(data.movimentacoes) ? data.movimentacoes : [])
    } catch (error) {
      message.error(getApiError(error, 'Erro ao carregar o caixa atual.'))
      setCaixa(emptyCaixa)
      setMovimentacoes([])
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  async function loadHistorico(periodo = filtroHistorico) {
    try {
      setLoadingHistorico(true)

      const params = {}

      if (periodo?.length === 2) {
        params.startDate = periodo[0].startOf('day').toISOString()
        params.endDate = periodo[1].endOf('day').toISOString()
      }

      const { data } = await http.get('/cash-register/history', { params })
      setHistorico(Array.isArray(data) ? data : [])
    } catch (error) {
      message.error(getApiError(error, 'Erro ao carregar histórico do caixa.'))
      setHistorico([])
    } finally {
      setLoadingHistorico(false)
    }
  }

  async function loadProdutos() {
    try {
      setLoadingProdutos(true)

      const { data } = await http.get('/products')

      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.products)
              ? data.products
              : []

      setProdutos(raw.map(normalizeProduct).filter((p) => p.id))
    } catch (error) {
      message.error(getApiError(error, 'Erro ao carregar produtos da venda rápida.'))
      setProdutos([])
    } finally {
      setLoadingProdutos(false)
    }
  }

  function abrirModalVendaRapida() {
    setOpenVendaRapida(true)
    setBuscaProduto('')
    setCarrinhoVendaRapida([])

    formVendaRapida.resetFields()
    formVendaRapida.setFieldsValue({
      customerName: '',
      formaPagamento: 'DINHEIRO',
      valorRecebido: null,
      observacao: '',
    })

    loadProdutos()
  }

  function fecharModalVendaRapida() {
    setOpenVendaRapida(false)
    setBuscaProduto('')
    setCarrinhoVendaRapida([])
    formVendaRapida.resetFields()
  }

  function adicionarProdutoVendaRapida(produto) {
    setCarrinhoVendaRapida((prev) => {
      const existente = prev.find((item) => item.id === produto.id)

      if (existente) {
        return prev.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: Number(item.quantidade || 0) + 1,
              }
            : item
        )
      }

      return [
        ...prev,
        {
          id: produto.id,
          nome: produto.nome,
          categoria: produto.categoria,
          preco: Number(produto.preco || 0),
          quantidade: 1,
        },
      ]
    })
  }

  function alterarQuantidadeCarrinho(produtoId, quantidade) {
    const qtd = Number(quantidade || 0)

    if (qtd <= 0) {
      setCarrinhoVendaRapida((prev) => prev.filter((item) => item.id !== produtoId))
      return
    }

    setCarrinhoVendaRapida((prev) =>
      prev.map((item) =>
        item.id === produtoId ? { ...item, quantidade: qtd } : item
      )
    )
  }

  function removerItemCarrinho(produtoId) {
    setCarrinhoVendaRapida((prev) => prev.filter((item) => item.id !== produtoId))
  }

  async function handleAbrirCaixa() {
    try {
      const values = await formAbertura.validateFields()
      setSubmitting(true)

      await http.post('/cash-register/open', {
        fundoInicial: Number(values.fundoInicial || 0),
        observacao: values.observacao || '',
      })

      setOpenAbertura(false)
      formAbertura.resetFields()
      await loadCurrentCashRegister(false)
      await loadHistorico()
      message.success('Caixa aberto com sucesso!')
    } catch (error) {
      if (error?.errorFields) return
      message.error(getApiError(error, 'Não foi possível abrir o caixa.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSalvarLancamento() {
    try {
      const values = await formLancamento.validateFields()
      setSubmitting(true)

      await http.post('/cash-register/movement', {
        tipo: values.tipo,
        formaPagamento: values.formaPagamento || null,
        categoria: values.categoria,
        descricao: values.descricao,
        valor: Number(values.valor || 0),
      })

      setOpenLancamento(false)
      formLancamento.resetFields()
      await loadCurrentCashRegister(false)
      await loadHistorico()
      message.success('Lançamento registrado com sucesso!')
    } catch (error) {
      if (error?.errorFields) return
      message.error(getApiError(error, 'Não foi possível registrar o lançamento.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFecharCaixa() {
    try {
      const values = await formFechamento.validateFields()
      setSubmitting(true)

      await http.post('/cash-register/close', {
        saldoInformado: Number(values.saldoInformado || 0),
        observacao: values.observacao || '',
      })

      setOpenFechamento(false)
      formFechamento.resetFields()
      await loadCurrentCashRegister(false)
      await loadHistorico()
      message.success('Caixa fechado com sucesso!')
    } catch (error) {
      if (error?.errorFields) return
      message.error(getApiError(error, 'Não foi possível fechar o caixa.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFinalizarVendaRapida() {
    try {
      const itensVenda = (carrinhoVendaRapida || []).filter(
        (item) => Number(item.quantidade || 0) > 0
      )

      if (!itensVenda.length) {
        message.warning('Adicione pelo menos um produto na venda rápida.')
        return
      }

      const values = await formVendaRapida.validateFields()

      const total = itensVenda.reduce((acc, item) => {
        return acc + Number(item.quantidade || 0) * Number(item.preco || 0)
      }, 0)

      if (
        values.formaPagamento === 'DINHEIRO' &&
        Number(values.valorRecebido || 0) < Number(total)
      ) {
        message.warning('O valor recebido não pode ser menor que o total da venda.')
        return
      }

      setSubmitting(true)

      await http.post('/orders/quick-sale', {
        customerName: values.customerName || null,
        items: itensVenda.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantidade || 0),
          unitPrice: Number(item.preco || 0),
        })),
        payment: {
          method: values.formaPagamento,
          amount: Number(total),
        },
        notes: values.observacao || null,
      })

      message.success('Venda rápida registrada com sucesso!')
      fecharModalVendaRapida()
      await loadCurrentCashRegister(false)
      await loadHistorico()
    } catch (error) {
      if (error?.errorFields) return
      console.error(error)
      message.error(getApiError(error, 'Não foi possível finalizar a venda rápida.'))
    } finally {
      setSubmitting(false)
    }
  }

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
      render: (value) => value || '-',
    },
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao',
      render: (value) => value || '-',
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
      render: (value) => value || '-',
    },
  ]

  const historicoColumns = [
    {
      title: 'Abertura',
      dataIndex: 'dataAbertura',
      key: 'dataAbertura',
      width: 170,
      render: (value) => value || '-',
    },
    {
      title: 'Fechamento',
      dataIndex: 'dataFechamento',
      key: 'dataFechamento',
      width: 170,
      render: (value) => value || '-',
    },
    {
      title: 'Operador',
      dataIndex: 'operador',
      key: 'operador',
      width: 180,
      render: (value) => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value) => (
        <Badge
          status={statusColors[value] || 'default'}
          text={<Text strong>{value}</Text>}
        />
      ),
    },
    {
      title: 'Fundo inicial',
      dataIndex: 'fundoInicial',
      key: 'fundoInicial',
      width: 140,
      align: 'right',
      render: (value) => moeda(value),
    },
    {
      title: 'Vendas',
      dataIndex: 'totalVendas',
      key: 'totalVendas',
      width: 140,
      align: 'right',
      render: (value) => moeda(value),
    },
    {
      title: 'Saídas',
      dataIndex: 'saidas',
      key: 'saidas',
      width: 140,
      align: 'right',
      render: (value) => moeda(value),
    },
    {
      title: 'Esperado',
      dataIndex: 'saldoEsperado',
      key: 'saldoEsperado',
      width: 140,
      align: 'right',
      render: (value) => moeda(value),
    },
    {
      title: 'Informado',
      dataIndex: 'saldoInformado',
      key: 'saldoInformado',
      width: 140,
      align: 'right',
      render: (value) => moeda(value),
    },
    {
      title: 'Diferença',
      dataIndex: 'diferenca',
      key: 'diferenca',
      width: 140,
      align: 'right',
      render: (value) => (
        <Text
          style={{
            color:
              Number(value || 0) === 0
                ? undefined
                : Number(value || 0) > 0
                  ? '#1677ff'
                  : '#cf1322',
          }}
        >
          {moeda(value)}
        </Text>
      ),
    },
  ]

  const tabs = [
    {
      key: 'resumo',
      label: 'Resumo',
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {!caixa?.id && (
            <Alert
              type="info"
              showIcon
              message="Nenhum caixa aberto no momento"
              description="Abra o caixa para começar a registrar pagamentos, sangrias, suprimentos e demais movimentações."
            />
          )}

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
                  <Text strong>{caixa.operador || '-'}</Text>
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
                    status={statusColors[caixa.status] || 'default'}
                    text={<Text strong>{caixa.status}</Text>}
                  />
                </Space>
              </Col>

              <Col xs={24}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Observação da abertura</Text>
                  <Text>{caixa.observacaoAbertura || '-'}</Text>
                </Space>
              </Col>

              {caixa.observacaoFechamento ? (
                <Col xs={24}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">Observação do fechamento</Text>
                    <Text>{caixa.observacaoFechamento || '-'}</Text>
                  </Space>
                </Col>
              ) : null}
            </Row>
          </Card>

          <Card title="Resumo por forma de pagamento" style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Statistic
                  title="Dinheiro"
                  value={resumoFormas.DINHEIRO}
                  formatter={(v) => moeda(v)}
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic
                  title="PIX"
                  value={resumoFormas.PIX}
                  formatter={(v) => moeda(v)}
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic
                  title="Débito"
                  value={resumoFormas.DEBITO}
                  formatter={(v) => moeda(v)}
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic
                  title="Crédito"
                  value={resumoFormas.CREDITO}
                  formatter={(v) => moeda(v)}
                />
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
            locale={{
              emptyText: (
                <Empty description="Nenhuma movimentação registrada neste caixa" />
              ),
            }}
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
                <Statistic
                  title="Saldo esperado"
                  value={caixa.saldoEsperado}
                  formatter={(v) => moeda(v)}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Saldo informado"
                  value={caixa.saldoInformado}
                  formatter={(v) => moeda(v)}
                />
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
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Space wrap>
                  <RangePicker
                    value={filtroHistorico}
                    format="DD/MM/YYYY"
                    onChange={(dates) => setFiltroHistorico(dates)}
                  />

                  <Button
                    onClick={() => loadHistorico()}
                    loading={loadingHistorico}
                  >
                    Filtrar
                  </Button>

                  <Button
                    onClick={() => {
                      setFiltroHistorico(null)
                      loadHistorico(null)
                    }}
                  >
                    Limpar filtro
                  </Button>
                </Space>
              </Col>

              <Col xs={24} md="auto">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadHistorico()}
                  loading={loadingHistorico}
                >
                  Atualizar
                </Button>
              </Col>
            </Row>
          </Card>

          <Card style={{ borderRadius: 16 }}>
            <Table
              rowKey="id"
              columns={historicoColumns}
              dataSource={historico}
              loading={loadingHistorico}
              pagination={{ pageSize: 8 }}
              locale={{
                emptyText: <Empty description="Nenhum caixa encontrado" />,
              }}
              scroll={{ x: 1300 }}
            />
          </Card>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Spin spinning={loading}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card style={{ borderRadius: 20 }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Space direction="vertical" size={4}>
                  <Title level={3} style={{ margin: 0 }}>
                    Caixa
                  </Title>
                  <Text type="secondary">
                    Controle de abertura, fechamento, despesas, sangrias, movimentações do dia e venda rápida no balcão.
                  </Text>
                </Space>
              </Col>

              <Col xs={24} md="auto">
                <Space wrap>
                  <Badge
                    status={statusColors[caixa.status] || 'default'}
                    text={<Text strong>{caixa.status}</Text>}
                  />

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => loadCurrentCashRegister()}
                  >
                    Atualizar
                  </Button>

                  <Button
                    icon={<CheckCircleOutlined />}
                    type="primary"
                    onClick={() => setOpenAbertura(true)}
                    disabled={caixa.status === 'ABERTO'}
                  >
                    Abrir caixa
                  </Button>

                  <Button
                    icon={<ThunderboltOutlined />}
                    type="primary"
                    ghost
                    onClick={abrirModalVendaRapida}
                    disabled={caixa.status !== 'ABERTO'}
                  >
                    Venda rápida
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
      </Spin>

      <Modal
        title="Abrir caixa"
        open={openAbertura}
        onCancel={() => setOpenAbertura(false)}
        onOk={handleAbrirCaixa}
        okText="Abrir caixa"
        cancelText="Cancelar"
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={formAbertura}
          layout="vertical"
          initialValues={{
            fundoInicial: 150,
            observacao: '',
          }}
        >
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="O operador será identificado automaticamente pelo usuário logado."
          />

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
        confirmLoading={submitting}
        destroyOnClose
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
                    { value: 'AJUSTE', label: 'Ajuste' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="formaPagamento"
                label="Forma de pagamento"
              >
                <Select
                  allowClear
                  options={[
                    { value: 'DINHEIRO', label: 'Dinheiro' },
                    { value: 'PIX', label: 'PIX' },
                    { value: 'DEBITO', label: 'Débito' },
                    { value: 'CREDITO', label: 'Crédito' },
                    { value: 'OUTRO', label: 'Outro' },
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
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={formFechamento}
          layout="vertical"
          initialValues={{
            saldoInformado: Number(caixa.saldoEsperado || 0),
            observacao: '',
          }}
        >
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

      <Modal
        title="Venda rápida"
        open={openVendaRapida}
        onCancel={fecharModalVendaRapida}
        onOk={handleFinalizarVendaRapida}
        okText="Finalizar venda"
        cancelText="Cancelar"
        confirmLoading={submitting}
        width={1200}
        destroyOnClose
        styles={{ body: { paddingTop: 12 } }}
      >
        <div style={{ height: '72vh' }}>
          <Row gutter={[16, 16]} style={{ height: '100%' }}>
            <Col xs={24} lg={14} style={{ height: '100%' }}>
              <Card
                title="Produtos"
                style={{ borderRadius: 16, height: '100%' }}
                styles={{
                  body: {
                    paddingBottom: 8,
                    height: 'calc(72vh - 57px)',
                    display: 'flex',
                    flexDirection: 'column',
                  },
                }}
              >
                <Space
                  direction="vertical"
                  size={16}
                  style={{ width: '100%', flex: 1, minHeight: 0 }}
                >
                  <Input
                    allowClear
                    placeholder="Buscar produto por nome ou categoria"
                    prefix={<SearchOutlined />}
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                  />

                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      paddingRight: 4,
                    }}
                  >
                    {loadingProdutos ? (
                      <div style={{ padding: 24, textAlign: 'center' }}>
                        <Spin />
                      </div>
                    ) : produtosFiltrados.length ? (
                      <Row gutter={[12, 12]}>
                        {produtosFiltrados.map((produto) => (
                          <Col xs={24} sm={12} xl={8} key={produto.id}>
                            <Card
                              hoverable
                              size="small"
                              style={{ borderRadius: 12, height: '100%' }}
                              onClick={() => adicionarProdutoVendaRapida(produto)}
                            >
                              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                <Text strong>{produto.nome}</Text>
                                <Text type="secondary">{produto.categoria}</Text>
                                <Text style={{ fontSize: 16, fontWeight: 700 }}>
                                  {moeda(produto.preco)}
                                </Text>
                                <Button type="primary" block icon={<PlusCircleOutlined />}>
                                  Adicionar
                                </Button>
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty description="Nenhum produto encontrado para venda rápida" />
                    )}
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={10} style={{ height: '100%' }}>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <Card
                  title="Carrinho"
                  style={{ borderRadius: 16 }}
                  styles={{
                    body: {
                      maxHeight: '30vh',
                      overflowY: 'auto',
                    },
                  }}
                  extra={
                    <Badge
                      count={totalItensCarrinho}
                      showZero
                      overflowCount={999}
                    >
                      <ShoppingCartOutlined style={{ fontSize: 18 }} />
                    </Badge>
                  }
                >
                  {carrinhoVendaRapida.length ? (
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      {carrinhoVendaRapida.map((item) => {
                        const totalItem =
                          Number(item.quantidade || 0) * Number(item.preco || 0)

                        return (
                          <Card
                            key={item.id}
                            size="small"
                            style={{ borderRadius: 12 }}
                          >
                            <Row gutter={[8, 8]} align="middle">
                              <Col xs={24} md={10}>
                                <Space direction="vertical" size={0}>
                                  <Text strong>{item.nome}</Text>
                                  <Text type="secondary">{moeda(item.preco)} cada</Text>
                                </Space>
                              </Col>

                              <Col xs={12} md={7}>
                                <InputNumber
                                  min={1}
                                  precision={0}
                                  style={{ width: '100%' }}
                                  value={item.quantidade}
                                  onChange={(value) =>
                                    alterarQuantidadeCarrinho(item.id, value)
                                  }
                                />
                              </Col>

                              <Col xs={8} md={5}>
                                <Text strong>{moeda(totalItem)}</Text>
                              </Col>

                              <Col xs={4} md={2}>
                                <Button
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => removerItemCarrinho(item.id)}
                                />
                              </Col>
                            </Row>
                          </Card>
                        )
                      })}

                      <Divider style={{ margin: '4px 0' }} />

                      <Row justify="space-between">
                        <Col>
                          <Text strong>Total</Text>
                        </Col>
                        <Col>
                          <Title level={4} style={{ margin: 0 }}>
                            {moeda(totalVendaRapida)}
                          </Title>
                        </Col>
                      </Row>
                    </Space>
                  ) : (
                    <Empty description="Adicione produtos para montar a venda" />
                  )}
                </Card>

                <Card
                  title="Pagamento"
                  style={{ borderRadius: 16, flex: 1 }}
                  styles={{
                    body: {
                      overflowY: 'auto',
                      maxHeight: 'calc(72vh - 30vh - 90px)',
                    },
                  }}
                >
                  <Form
                    form={formVendaRapida}
                    layout="vertical"
                    initialValues={{
                      customerName: '',
                      formaPagamento: 'DINHEIRO',
                      valorRecebido: null,
                      observacao: '',
                    }}
                  >
                    <Form.Item
                      name="customerName"
                      label="Cliente (opcional)"
                    >
                      <Input placeholder="Ex.: Consumidor balcão" />
                    </Form.Item>

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
                          { value: 'OUTRO', label: 'Outro' },
                        ]}
                      />
                    </Form.Item>

                    {String(formaPagamentoVendaRapida || '') === 'DINHEIRO' && (
                      <>
                        <Form.Item
                          name="valorRecebido"
                          label="Valor recebido"
                          rules={[
                            { required: true, message: 'Informe o valor recebido' },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            placeholder="0,00"
                          />
                        </Form.Item>

                        <Alert
                          type={faltaReceberVendaRapida > 0 ? 'warning' : 'success'}
                          showIcon
                          style={{ marginBottom: 16 }}
                          message={
                            Number(valorRecebidoVendaRapida || 0) <= 0
                              ? `Troco: ${moeda(0)}`
                              : faltaReceberVendaRapida > 0
                                ? `Falta receber: ${moeda(faltaReceberVendaRapida)}`
                                : `Troco: ${moeda(trocoVendaRapida)}`
                          }
                        />
                      </>
                    )}

                    <Form.Item name="observacao" label="Observação">
                      <TextArea
                        rows={3}
                        placeholder="Ex.: venda de balcão, produto já pronto..."
                      />
                    </Form.Item>

                    <Alert
                      type="info"
                      showIcon
                      message={`Total da venda: ${moeda(totalVendaRapida)}`}
                      description="Essa venda não abre comanda de mesa. Ela é registrada como venda rápida de balcão."
                    />
                  </Form>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  )
}