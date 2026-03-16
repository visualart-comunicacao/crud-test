import { useEffect, useMemo, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Tag,
  Button,
  Space,
  Typography,
  List,
  Divider,
  Empty,
  Badge,
  Statistic,
  message,
  Modal,
  Form,
  InputNumber,
  Tabs,
  Table,
  Popconfirm,
  Descriptions,
  Steps,
  Alert,
  Spin,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  PrinterOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  HistoryOutlined,
  TableOutlined,
  FireOutlined,
  WalletOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from '@ant-design/icons'
import PageTitle from '../../components/common/PageTitle'
import http from '@/api/http'

const { Text, Title } = Typography
const { TextArea } = Input

const STATUS_COMANDA = {
  LIVRE: 'LIVRE',
  ABERTA: 'ABERTA',
  FINALIZADA: 'FECHADA',
  CANCELADA: 'CANCELADA',
}

const statusConfig = {
  LIVRE: {
    label: 'Livre',
    color: 'default',
    borderColor: '#303030',
    bg: '#141414',
    badge: 'default',
  },
  ABERTA: {
    label: 'Aberta',
    color: 'processing',
    borderColor: '#1677ff',
    bg: '#111a2c',
    badge: 'processing',
  },
  FECHADA: {
    label: 'Finalizada',
    color: 'success',
    borderColor: '#52c41a',
    bg: '#162312',
    badge: 'success',
  },
  CANCELADA: {
    label: 'Cancelada',
    color: 'default',
    borderColor: '#434343',
    bg: '#141414',
    badge: 'default',
  },
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getTableDisplayName(table) {
  if (!table) return '-'
  return table.nome || `Mesa ${String(table.numero).padStart(2, '0')}`
}

function getOrderStatus(order) {
  if (!order) return STATUS_COMANDA.LIVRE
  if (order.status === 'ABERTA') return STATUS_COMANDA.ABERTA
  if (order.status === 'FECHADA') return STATUS_COMANDA.FINALIZADA
  if (order.status === 'CANCELADA') return STATUS_COMANDA.CANCELADA
  return STATUS_COMANDA.ABERTA
}

function buildMesas(tables, orders) {
  return tables
    .map((table) => {
      const openOrder = orders.find(
        (order) => order.tableId === table.id && order.status === 'ABERTA',
      )

      if (!openOrder) {
        return {
          id: table.id,
          mesaId: table.id,
          mesa: table.nome || `Mesa ${String(table.numero).padStart(2, '0')}`,
          numero: table.numero,
          nome: table.nome,
          cliente: '',
          pessoas: 0,
          status: STATUS_COMANDA.LIVRE,
          total: 0,
          criadaEm: '',
          ultimaAtualizacao: '',
          garcom: '',
          tipoAtendimento: 'salao',
          itens: [],
          ativo: table.ativo,
          rawTable: table,
          rawOrder: null,
        }
      }

      return {
        id: openOrder.id,
        mesaId: table.id,
        mesa: openOrder.table?.nome || `Mesa ${String(openOrder.table?.numero || table.numero).padStart(2, '0')}`,
        numero: table.numero,
        nome: table.nome,
        cliente: openOrder.customerName || '',
        pessoas: 0,
        status: getOrderStatus(openOrder),
        total: Number(openOrder.total || 0),
        criadaEm: openOrder.openedAt || '',
        ultimaAtualizacao: openOrder.updatedAt || '',
        garcom: openOrder.createdBy?.name || openOrder.createdBy?.username || '',
        tipoAtendimento: 'salao',
        itens: openOrder.items || [],
        ativo: table.ativo,
        rawTable: table,
        rawOrder: openOrder,
      }
    })
    .sort((a, b) => Number(a.numero || 0) - Number(b.numero || 0))
}

export default function Comandas() {
  const user = getCurrentUser()

  const [tabAtiva, setTabAtiva] = useState('comandas')

  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  const [loadingPage, setLoadingPage] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const [comandaSelecionadaId, setComandaSelecionadaId] = useState(null)

  const [modalNovaMesaOpen, setModalNovaMesaOpen] = useState(false)
  const [modalEditarMesaOpen, setModalEditarMesaOpen] = useState(false)
  const [modalNovaComandaOpen, setModalNovaComandaOpen] = useState(false)
  const [modalAdicionarItemOpen, setModalAdicionarItemOpen] = useState(false)
  const [modalFechamentoOpen, setModalFechamentoOpen] = useState(false)
  const [modalDividirContaOpen, setModalDividirContaOpen] = useState(false)

  const [mesaEditando, setMesaEditando] = useState(null)

  const [formNovaMesa] = Form.useForm()
  const [formEditarMesa] = Form.useForm()
  const [formNovaComanda] = Form.useForm()
  const [formAdicionarItem] = Form.useForm()
  const [formFechamento] = Form.useForm()
  const [formDividirConta] = Form.useForm()

  async function carregarTudo() {
    try {
      setLoadingPage(true)

      const [tablesRes, ordersRes, productsRes] = await Promise.all([
        http.get('/tables'),
        http.get('/orders'),
        http.get('/products'),
      ])

      setTables(tablesRes.data || [])
      setOrders(ordersRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível carregar os dados.')
    } finally {
      setLoadingPage(false)
    }
  }

  useEffect(() => {
    carregarTudo()
  }, [])

  const produtosPorCategoria = useMemo(() => {
    return products.reduce((acc, produto) => {
      const categoria = produto.categoriaNome || 'Sem categoria'
      if (!acc[categoria]) acc[categoria] = []
      acc[categoria].push(produto)
      return acc
    }, {})
  }, [products])

  const comandas = useMemo(() => buildMesas(tables, orders), [tables, orders])

  const primeiraAtiva = useMemo(
    () => comandas.find((item) => item.status !== STATUS_COMANDA.LIVRE) || null,
    [comandas],
  )

  useEffect(() => {
    if (!comandaSelecionadaId && primeiraAtiva) {
      setComandaSelecionadaId(primeiraAtiva.id)
    }
  }, [comandaSelecionadaId, primeiraAtiva])

  const comandaSelecionada =
    comandas.find((item) => String(item.id) === String(comandaSelecionadaId)) || null

  const comandasFiltradas = useMemo(() => {
    return comandas.filter((comanda) => {
      const texto = busca.toLowerCase()

      const matchBusca =
        String(comanda.mesa || '').toLowerCase().includes(texto) ||
        String(comanda.cliente || '').toLowerCase().includes(texto) ||
        String(comanda.id || '').includes(texto) ||
        String(comanda.garcom || '').toLowerCase().includes(texto)

      const matchStatus =
        filtroStatus === 'todos' ? true : comanda.status === filtroStatus

      return matchBusca && matchStatus
    })
  }, [comandas, busca, filtroStatus])

  const resumo = useMemo(() => {
    return {
      ativas: comandas.filter((item) => item.status !== STATUS_COMANDA.LIVRE).length,
      abertas: comandas.filter((item) => item.status === STATUS_COMANDA.ABERTA).length,
      finalizadas: orders.filter((item) => item.status === 'FECHADA').length,
      livres: comandas.filter((item) => item.status === STATUS_COMANDA.LIVRE).length,
    }
  }, [comandas, orders])

  const mesasLivres = useMemo(
    () => comandas.filter((item) => item.status === STATUS_COMANDA.LIVRE && item.ativo),
    [comandas],
  )

  const mesasOcupadas = useMemo(
    () => comandas.filter((item) => item.status !== STATUS_COMANDA.LIVRE),
    [comandas],
  )

  const historico = useMemo(() => {
    return orders
      .filter((item) => item.status === 'FECHADA')
      .map((item) => ({
        id: item.id,
        mesa: getTableDisplayName(item.table),
        cliente: item.customerName || 'Mesa sem identificação',
        pagamento: '-',
        total: Number(item.total || 0),
        troco: 0,
        divisao: 1,
        fechadoEm: item.closedAt || '-',
      }))
  }, [orders])

  const totaisCaixa = useMemo(() => {
    const totalDia = historico.reduce((acc, item) => acc + item.total, 0)
    return {
      totalDia,
      pix: 0,
      credito: 0,
      debito: 0,
      dinheiro: 0,
    }
  }, [historico])

  const produtoSelecionadoId = Form.useWatch('produtoId', formAdicionarItem)
  const produtoSelecionado = products.find(
    (produto) => String(produto.id) === String(produtoSelecionadoId),
  )

  const pagamentoFechamento = Form.useWatch('pagamento', formFechamento)
  const valorRecebidoFechamento = Form.useWatch('valorRecebido', formFechamento)
  const divisaoFechamento = Form.useWatch('divisao', formFechamento)

  const totalSelecionado = Number(comandaSelecionada?.total || 0)
  const divisaoAtual = Number(divisaoFechamento || 1)
  const totalPorPessoa = divisaoAtual > 0 ? totalSelecionado / divisaoAtual : totalSelecionado
  const trocoFechamento =
    pagamentoFechamento === 'Dinheiro'
      ? Math.max(Number(valorRecebidoFechamento || 0) - totalSelecionado, 0)
      : 0

  const qtdDivisaoConta = Form.useWatch('qtdPessoas', formDividirConta)
  const qtdDivisaoAtual = Number(qtdDivisaoConta || 1)
  const valorDivisaoConta =
    qtdDivisaoAtual > 0 ? totalSelecionado / qtdDivisaoAtual : totalSelecionado

  const selecionarComanda = (comanda) => {
    setComandaSelecionadaId(comanda.id)
    setTabAtiva('comandas')
  }

  const abrirModalNovaMesa = () => {
    formNovaMesa.resetFields()
    setModalNovaMesaOpen(true)
  }

  const salvarNovaMesa = async () => {
    try {
      const values = await formNovaMesa.validateFields()
      setLoadingAction(true)

      const { data } = await http.post('/tables', {
        numero: values.numero,
        nome: values.nome || null,
      })

      setTables((prev) => [...prev, data].sort((a, b) => Number(a.numero) - Number(b.numero)))
      setModalNovaMesaOpen(false)
      formNovaMesa.resetFields()
      message.success('Mesa cadastrada com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível cadastrar a mesa.')
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirEditarMesa = (mesa) => {
    setMesaEditando(mesa)
    formEditarMesa.resetFields()
    formEditarMesa.setFieldsValue({
      numero: mesa.numero,
      nome: mesa.nome || '',
      status: mesa.rawTable?.status || 'LIVRE',
    })
    setModalEditarMesaOpen(true)
  }

  const salvarEdicaoMesa = async () => {
    try {
      const values = await formEditarMesa.validateFields()
      if (!mesaEditando?.mesaId) return

      setLoadingAction(true)

      const { data } = await http.put(`/tables/${mesaEditando.mesaId}`, {
        numero: values.numero,
        nome: values.nome || null,
        status: values.status,
      })

      setTables((prev) =>
        prev
          .map((item) => (item.id === mesaEditando.mesaId ? data : item))
          .sort((a, b) => Number(a.numero) - Number(b.numero)),
      )

      setModalEditarMesaOpen(false)
      setMesaEditando(null)
      message.success('Mesa atualizada com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível atualizar a mesa.')
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const alternarStatusMesa = async (mesa) => {
    try {
      if (mesa.status !== STATUS_COMANDA.LIVRE) {
        message.warning('Não é possível inativar uma mesa com comanda aberta.')
        return
      }

      setLoadingAction(true)

      const { data } = await http.patch(`/tables/${mesa.mesaId}/status`)

      setTables((prev) =>
        prev
          .map((item) => (item.id === mesa.mesaId ? data : item))
          .sort((a, b) => Number(a.numero) - Number(b.numero)),
      )

      message.success(`Mesa ${mesa.ativo ? 'inativada' : 'ativada'} com sucesso`)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível alterar a mesa.')
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirModalNovaComanda = () => {
    formNovaComanda.resetFields()
    formNovaComanda.setFieldsValue({
      pessoas: 1,
      tipoAtendimento: 'salao',
      garcom: user?.name || user?.username || '',
    })
    setModalNovaComandaOpen(true)
  }

  const salvarNovaComanda = async () => {
    try {
      const values = await formNovaComanda.validateFields()
      setLoadingAction(true)

      const mesa = mesasLivres.find((item) => item.mesa === values.mesa)

      if (!mesa) {
        message.error('Mesa não encontrada')
        return
      }

      const { data } = await http.post('/orders', {
        tableId: mesa.mesaId,
        customerName: values.cliente || null,
        notes: values.observacao || null,
      })

      setOrders((prev) => [data, ...prev])
      setComandaSelecionadaId(data.id)
      setModalNovaComandaOpen(false)
      message.success('Nova comanda aberta com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível abrir a comanda.')
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirModalAdicionarItem = () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    formAdicionarItem.resetFields()
    formAdicionarItem.setFieldsValue({
      qtd: 1,
      observacao: '',
    })
    setModalAdicionarItemOpen(true)
  }

  const salvarNovoItem = async () => {
    try {
      const values = await formAdicionarItem.validateFields()
      if (!comandaSelecionada?.rawOrder) return

      setLoadingAction(true)

      const { data } = await http.post(`/orders/${comandaSelecionada.rawOrder.id}/items`, {
        productId: values.produtoId,
        quantity: values.qtd,
        notes: values.observacao || '',
      })

      setOrders((prev) =>
        prev.map((item) => (item.id === comandaSelecionada.rawOrder.id ? data : item)),
      )

      setModalAdicionarItemOpen(false)
      message.success('Item adicionado à comanda')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível adicionar o item.')
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const removerItem = async (itemId) => {
    if (!comandaSelecionada?.rawOrder) return

    try {
      setLoadingAction(true)

      const { data } = await http.patch(
        `/orders/${comandaSelecionada.rawOrder.id}/items/${itemId}/cancel`,
        {
          notes: 'Cancelado pelo usuário',
        },
      )

      setOrders((prev) =>
        prev.map((item) => (item.id === comandaSelecionada.rawOrder.id ? data : item)),
      )

      message.success('Item cancelado')
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível cancelar o item.')
    } finally {
      setLoadingAction(false)
    }
  }

  const enviarParaCozinha = () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    message.info('A integração da cozinha será ligada no próximo passo.')
  }

  const abrirFechamento = () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    if (!comandaSelecionada.itens.length) {
      message.warning('A comanda não possui itens')
      return
    }

    formFechamento.resetFields()
    formFechamento.setFieldsValue({
      pagamento: 'PIX',
      valorRecebido: comandaSelecionada.total,
      divisao: 1,
    })
    setModalFechamentoOpen(true)
  }

  const confirmarFechamento = async () => {
    try {
      const values = await formFechamento.validateFields()
      if (!comandaSelecionada?.rawOrder) return

      const total = Number(comandaSelecionada.total)
      const valorRecebido = Number(values.valorRecebido || 0)
      const pagamentoDinheiro = values.pagamento === 'Dinheiro'

      if (pagamentoDinheiro && valorRecebido < total) {
        message.error('O valor recebido é menor que o total da comanda')
        return
      }

      setLoadingAction(true)

      const { data } = await http.patch(`/orders/${comandaSelecionada.rawOrder.id}/close`)

      setOrders((prev) =>
        prev.map((item) => (item.id === comandaSelecionada.rawOrder.id ? data : item)),
      )

      const proximaComanda =
        comandas.find(
          (item) =>
            String(item.id) !== String(comandaSelecionada.rawOrder.id) &&
            item.status !== STATUS_COMANDA.LIVRE,
        ) || null

      setComandaSelecionadaId(proximaComanda?.id || null)
      setModalFechamentoOpen(false)
      message.success('Conta fechada com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível fechar a comanda.')
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirDividirConta = () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    formDividirConta.resetFields()
    formDividirConta.setFieldsValue({
      qtdPessoas: 1,
    })
    setModalDividirContaOpen(true)
  }

  const mesasTabColumns = [
    {
      title: 'Mesa',
      dataIndex: 'mesa',
    },
    {
      title: 'Número',
      dataIndex: 'numero',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      render: (_, record) => record.cliente || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={statusConfig[status]?.color || 'default'}>
          {statusConfig[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: 'Ativa',
      dataIndex: 'ativo',
      render: (ativo) => (
        <Tag color={ativo ? 'success' : 'default'}>
          {ativo ? 'Sim' : 'Não'}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Ações',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => selecionarComanda(record)}>
            Ver
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => abrirEditarMesa(record)}>
            Editar
          </Button>
          <Popconfirm
            title={record.ativo ? 'Inativar mesa?' : 'Ativar mesa?'}
            onConfirm={() => alternarStatusMesa(record)}
          >
            <Button type="link">{record.ativo ? 'Inativar' : 'Ativar'}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const caixaColumns = [
    {
      title: 'Comanda',
      dataIndex: 'id',
      render: (id) => `#${String(id).slice(-6)}`,
    },
    {
      title: 'Mesa',
      dataIndex: 'mesa',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
    },
    {
      title: 'Pagamento',
      dataIndex: 'pagamento',
      render: (pagamento) => <Tag>{pagamento}</Tag>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Troco',
      dataIndex: 'troco',
      render: (value) => formatCurrency(value || 0),
    },
    {
      title: 'Fechado em',
      dataIndex: 'fechadoEm',
    },
  ]

  const historicoColumns = [
    {
      title: 'Comanda',
      dataIndex: 'id',
      render: (id) => `#${String(id).slice(-6)}`,
    },
    {
      title: 'Mesa',
      dataIndex: 'mesa',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
    },
    {
      title: 'Pagamento',
      dataIndex: 'pagamento',
    },
    {
      title: 'Divisão',
      dataIndex: 'divisao',
      render: (value) => `${value}x`,
    },
    {
      title: 'Valor',
      dataIndex: 'total',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Troco',
      dataIndex: 'troco',
      render: (value) => formatCurrency(value || 0),
    },
    {
      title: 'Horário',
      dataIndex: 'fechadoEm',
    },
  ]

  const itemsTabs = [
    {
      key: 'comandas',
      label: (
        <span>
          <ShoppingCartOutlined /> Comandas
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card bordered={false}>
              <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={10}>
                  <Input
                    allowClear
                    size="large"
                    placeholder="Buscar por mesa, cliente, comanda ou garçom"
                    prefix={<SearchOutlined />}
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </Col>

                <Col xs={24} md={7}>
                  <Select
                    size="large"
                    style={{ width: '100%' }}
                    value={filtroStatus}
                    onChange={setFiltroStatus}
                    options={[
                      { label: 'Todos os status', value: 'todos' },
                      { label: 'Livre', value: STATUS_COMANDA.LIVRE },
                      { label: 'Aberta', value: STATUS_COMANDA.ABERTA },
                      { label: 'Finalizada', value: STATUS_COMANDA.FINALIZADA },
                      { label: 'Cancelada', value: STATUS_COMANDA.CANCELADA },
                    ]}
                  />
                </Col>

                <Col xs={24} md={7}>
                  <Space style={{ width: '100%' }}>
                    <Button
                      type="default"
                      size="large"
                      icon={<TableOutlined />}
                      onClick={abrirModalNovaMesa}
                    >
                      Nova mesa
                    </Button>

                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={abrirModalNovaComanda}
                    >
                      Nova comanda
                    </Button>
                  </Space>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                {comandasFiltradas.map((comanda) => {
                  const status = statusConfig[comanda.status] || statusConfig.LIVRE
                  const selecionada = String(comandaSelecionada?.id) === String(comanda.id)

                  return (
                    <Col xs={24} sm={12} lg={8} key={`${comanda.mesa}-${comanda.id}`}>
                      <Card
                        hoverable
                        onClick={() => selecionarComanda(comanda)}
                        style={{
                          cursor: 'pointer',
                          border: selecionada
                            ? '1px solid #fa541c'
                            : `1px solid ${status.borderColor}`,
                          background: status.bg,
                          boxShadow: selecionada
                            ? '0 0 0 1px rgba(250,84,28,0.15)'
                            : 'none',
                          opacity: comanda.ativo ? 1 : 0.6,
                        }}
                        styles={{ body: { padding: 16 } }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 12,
                          }}
                        >
                          <div>
                            <Title
                              level={4}
                              style={{ color: '#fff', margin: 0, lineHeight: 1.1 }}
                            >
                              {comanda.mesa}
                            </Title>
                            <Text style={{ color: '#bfbfbf' }}>
                              {comanda.rawOrder
                                ? `Comanda #${String(comanda.rawOrder.id).slice(-6)}`
                                : 'Sem comanda'}
                            </Text>
                          </div>

                          <Tag color={status.color} style={{ marginRight: 0 }}>
                            {status.label}
                          </Tag>
                        </div>

                        <Space direction="vertical" size={6} style={{ width: '100%' }}>
                          <Text style={{ color: '#d9d9d9' }}>
                            <strong>Cliente:</strong>{' '}
                            {comanda.cliente || 'Mesa sem identificação'}
                          </Text>

                          <Text style={{ color: '#d9d9d9' }}>
                            <strong>Garçom:</strong> {comanda.garcom || '-'}
                          </Text>

                          <Text style={{ color: '#d9d9d9' }}>
                            <strong>Mesa ativa:</strong> {comanda.ativo ? 'Sim' : 'Não'}
                          </Text>

                          <Text style={{ color: '#d9d9d9' }}>
                            <strong>Total:</strong> {formatCurrency(comanda.total)}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  )
                })}
              </Row>

              {!comandasFiltradas.length && (
                <div style={{ padding: '32px 0' }}>
                  <Empty description="Nenhuma comanda encontrada" />
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Card
              bordered={false}
              title={
                <span style={{ color: '#fff' }}>
                  {comandaSelecionada
                    ? `${comandaSelecionada.mesa} • ${
                        comandaSelecionada.rawOrder
                          ? `Comanda #${String(comandaSelecionada.rawOrder.id).slice(-6)}`
                          : 'Sem comanda'
                      }`
                    : 'Detalhes da comanda'}
                </span>
              }
            >
              {comandaSelecionada ? (
                <>
                  <Descriptions
                    size="small"
                    column={1}
                    styles={{
                      label: { color: '#bfbfbf' },
                      content: { color: '#f5f5f5' },
                    }}
                  >
                    <Descriptions.Item label="Cliente">
                      {comandaSelecionada.cliente || 'Mesa sem identificação'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Garçom">
                      <Space size={6}>
                        <UserOutlined />
                        {comandaSelecionada.garcom || '-'}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mesa ativa">
                      {comandaSelecionada.ativo ? 'Sim' : 'Não'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Abertura">
                      {comandaSelecionada.rawOrder?.openedAt || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Última atualização">
                      {comandaSelecionada.rawOrder?.updatedAt || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Badge
                        status={statusConfig[comandaSelecionada.status]?.badge || 'default'}
                        text={
                          <span style={{ color: '#d9d9d9' }}>
                            {statusConfig[comandaSelecionada.status]?.label || comandaSelecionada.status}
                          </span>
                        }
                      />
                    </Descriptions.Item>
                  </Descriptions>

                  {comandaSelecionada.status !== STATUS_COMANDA.LIVRE && (
                    <>
                      <Divider style={{ borderColor: '#303030' }} />

                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: 12,
                        }}
                      >
                        Andamento da comanda
                      </Text>

                      <Steps
                        size="small"
                        current={comandaSelecionada.status === STATUS_COMANDA.ABERTA ? 0 : 2}
                        items={[
                          { title: 'Aberta' },
                          { title: 'Itens lançados' },
                          { title: 'Fechamento' },
                        ]}
                      />

                      <Alert
                        type="info"
                        showIcon
                        style={{ marginTop: 12 }}
                        message="A visualização da cozinha será ligada na próxima etapa."
                      />
                    </>
                  )}

                  <Divider style={{ borderColor: '#303030' }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      Itens da comanda
                    </Text>

                    <Button size="small" onClick={abrirModalAdicionarItem}>
                      Novo item
                    </Button>
                  </div>

                  <List
                    locale={{ emptyText: 'Nenhum item nesta comanda' }}
                    dataSource={comandaSelecionada.itens}
                    renderItem={(item) => {
                      const statusItemConfig =
                        item.status === 'CANCELADO'
                          ? { color: 'error', label: 'Cancelado' }
                          : { color: 'success', label: 'Ativo' }

                      return (
                        <List.Item
                          style={{
                            padding: '12px 0',
                            borderBottom: '1px solid #262626',
                          }}
                          actions={
                            comandaSelecionada.status !== STATUS_COMANDA.LIVRE &&
                            item.status !== 'CANCELADO'
                              ? [
                                  <Popconfirm
                                    key="remove"
                                    title="Cancelar item?"
                                    onConfirm={() => removerItem(item.id)}
                                  >
                                    <Button type="link" danger>
                                      Cancelar
                                    </Button>
                                  </Popconfirm>,
                                ]
                              : []
                          }
                        >
                          <div style={{ width: '100%' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 12,
                                marginBottom: 4,
                              }}
                            >
                              <Text style={{ color: '#f5f5f5' }}>
                                {item.quantity}x {item.productName}
                              </Text>
                              <Text style={{ color: '#f5f5f5', fontWeight: 600 }}>
                                {formatCurrency(item.totalPrice)}
                              </Text>
                            </div>

                            <Space wrap size={[6, 6]}>
                              <Tag color={statusItemConfig.color}>
                                {statusItemConfig.label}
                              </Tag>
                            </Space>

                            <div>
                              <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                                Unitário: {formatCurrency(item.unitPrice)}
                              </Text>
                            </div>

                            {!!item.notes && (
                              <div>
                                <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                                  Obs.: {item.notes}
                                </Text>
                              </div>
                            )}
                          </div>
                        </List.Item>
                      )
                    }}
                  />

                  <Divider style={{ borderColor: '#303030' }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ color: '#bfbfbf', fontSize: 16 }}>
                      Total da comanda
                    </Text>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 22,
                        fontWeight: 700,
                      }}
                    >
                      {formatCurrency(comandaSelecionada.total)}
                    </Text>
                  </div>

                  <Space direction="vertical" style={{ width: '100%' }} size={10}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="large"
                      block
                      onClick={abrirModalAdicionarItem}
                      disabled={comandaSelecionada.status === STATUS_COMANDA.LIVRE}
                    >
                      Adicionar itens
                    </Button>

                    <Button
                      size="large"
                      block
                      icon={<FireOutlined />}
                      onClick={enviarParaCozinha}
                      disabled={comandaSelecionada.status === STATUS_COMANDA.LIVRE}
                    >
                      Enviar para cozinha
                    </Button>

                    <Button
                      size="large"
                      block
                      icon={<CheckCircleOutlined />}
                      onClick={abrirDividirConta}
                      disabled={comandaSelecionada.status === STATUS_COMANDA.LIVRE}
                    >
                      Dividir conta
                    </Button>

                    <Button
                      size="large"
                      block
                      icon={<PrinterOutlined />}
                      onClick={() => message.success('Impressão enviada')}
                      disabled={comandaSelecionada.status === STATUS_COMANDA.LIVRE}
                    >
                      Imprimir comanda
                    </Button>

                    <Button
                      danger
                      size="large"
                      block
                      onClick={abrirFechamento}
                      disabled={comandaSelecionada.status === STATUS_COMANDA.LIVRE}
                    >
                      Fechar conta
                    </Button>
                  </Space>
                </>
              ) : (
                <Empty description="Selecione uma comanda" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'mesas',
      label: (
        <span>
          <TableOutlined /> Mesas
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card
              bordered={false}
              title="Visão geral das mesas"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={abrirModalNovaMesa}>
                  Nova mesa
                </Button>
              }
            >
              <Table
                rowKey={(record) => `${record.mesa}-${record.mesaId}`}
                columns={mesasTabColumns}
                dataSource={comandas}
                pagination={false}
              />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card bordered={false}>
                  <Statistic title="Mesas ocupadas" value={mesasOcupadas.length} />
                </Card>
              </Col>
              <Col span={24}>
                <Card bordered={false}>
                  <Statistic title="Mesas livres" value={mesasLivres.length} />
                </Card>
              </Col>
              <Col span={24}>
                <Card bordered={false} title="Mesas livres agora">
                  <Space wrap>
                    {mesasLivres.map((mesa) => (
                      <Tag key={mesa.mesaId} style={{ padding: '6px 10px' }}>
                        {mesa.mesa}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      ),
    },
    {
      key: 'caixa',
      label: (
        <span>
          <DollarOutlined /> Caixa
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} xl={6}>
            <Card bordered={false}>
              <Statistic
                title="Faturamento do dia"
                value={totaisCaixa.totalDia}
                precision={2}
                prefix="R$"
              />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card bordered={false}>
              <Statistic title="PIX" value={totaisCaixa.pix} precision={2} prefix="R$" />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card bordered={false}>
              <Statistic
                title="Crédito"
                value={totaisCaixa.credito}
                precision={2}
                prefix="R$"
              />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card bordered={false}>
              <Statistic
                title="Débito + Dinheiro"
                value={totaisCaixa.debito + totaisCaixa.dinheiro}
                precision={2}
                prefix="R$"
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card bordered={false} title="Lançamentos do caixa">
              <Table
                rowKey="id"
                columns={caixaColumns}
                dataSource={historico}
                pagination={{ pageSize: 6 }}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'historico',
      label: (
        <span>
          <HistoryOutlined /> Histórico
        </span>
      ),
      children: (
        <Card bordered={false} title="Histórico de comandas fechadas">
          <Table
            rowKey="id"
            columns={historicoColumns}
            dataSource={historico}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      ),
    },
  ]

  if (loadingPage) {
    return (
      <>
        <PageTitle
          title="Comandas"
          subtitle="Controle de mesas, consumo, envio para cozinha, caixa e histórico"
        />
        <Card bordered={false}>
          <div
            style={{
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle
        title="Comandas"
        subtitle="Controle de mesas, consumo, envio para cozinha, caixa e histórico"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 4 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Comandas ativas" value={resumo.ativas} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Abertas" value={resumo.abertas} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Finalizadas" value={resumo.finalizadas} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Mesas livres" value={resumo.livres} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={tabAtiva} onChange={setTabAtiva} items={itemsTabs} />
      </Card>

      <Modal
        title="Nova mesa"
        open={modalNovaMesaOpen}
        onCancel={() => setModalNovaMesaOpen(false)}
        onOk={salvarNovaMesa}
        okText="Cadastrar mesa"
        cancelText="Cancelar"
        confirmLoading={loadingAction}
      >
        <Form form={formNovaMesa} layout="vertical">
          <Form.Item
            label="Número da mesa"
            name="numero"
            rules={[{ required: true, message: 'Informe o número da mesa' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Nome da mesa" name="nome">
            <Input placeholder="Ex.: Área externa / Mesa 01" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar mesa"
        open={modalEditarMesaOpen}
        onCancel={() => {
          setModalEditarMesaOpen(false)
          setMesaEditando(null)
        }}
        onOk={salvarEdicaoMesa}
        okText="Salvar alterações"
        cancelText="Cancelar"
        confirmLoading={loadingAction}
      >
        <Form form={formEditarMesa} layout="vertical">
          <Form.Item
            label="Número da mesa"
            name="numero"
            rules={[{ required: true, message: 'Informe o número da mesa' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Nome da mesa" name="nome">
            <Input placeholder="Ex.: Área externa / Mesa 01" />
          </Form.Item>

          <Form.Item
            label="Status físico da mesa"
            name="status"
            rules={[{ required: true, message: 'Selecione o status' }]}
          >
            <Select
              options={[
                { label: 'Livre', value: 'LIVRE' },
                { label: 'Ocupada', value: 'OCUPADA' },
                { label: 'Reservada', value: 'RESERVADA' },
                { label: 'Inativa', value: 'INATIVA' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Nova comanda"
        open={modalNovaComandaOpen}
        onCancel={() => setModalNovaComandaOpen(false)}
        onOk={salvarNovaComanda}
        okText="Abrir comanda"
        cancelText="Cancelar"
        confirmLoading={loadingAction}
      >
        <Form form={formNovaComanda} layout="vertical">
          <Form.Item
            label="Mesa"
            name="mesa"
            rules={[{ required: true, message: 'Selecione a mesa' }]}
          >
            <Select
              placeholder="Selecione a mesa"
              options={mesasLivres.map((item) => ({
                label: item.mesa,
                value: item.mesa,
              }))}
            />
          </Form.Item>

          <Form.Item label="Cliente" name="cliente">
            <Input placeholder="Nome do cliente (opcional)" />
          </Form.Item>

          <Form.Item
            label="Garçom responsável"
            name="garcom"
            rules={[{ required: true, message: 'Informe o garçom' }]}
          >
            <Input placeholder="Ex.: João" />
          </Form.Item>

          <Form.Item
            label="Tipo de atendimento"
            name="tipoAtendimento"
            rules={[{ required: true, message: 'Selecione o tipo' }]}
          >
            <Select
              options={[
                { label: 'Salão', value: 'salao' },
                { label: 'Balcão', value: 'balcao' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Número de pessoas"
            name="pessoas"
            rules={[{ required: true, message: 'Informe a quantidade de pessoas' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Observação" name="observacao">
            <TextArea rows={3} placeholder="Observação inicial da comanda" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Adicionar item à comanda"
        open={modalAdicionarItemOpen}
        onCancel={() => setModalAdicionarItemOpen(false)}
        onOk={salvarNovoItem}
        okText="Adicionar item"
        cancelText="Cancelar"
        confirmLoading={loadingAction}
      >
        <Form form={formAdicionarItem} layout="vertical">
          <Form.Item
            label="Categoria"
            name="categoria"
            rules={[{ required: true, message: 'Selecione a categoria' }]}
          >
            <Select
              placeholder="Selecione a categoria"
              options={Object.keys(produtosPorCategoria).map((categoria) => ({
                label: categoria,
                value: categoria,
              }))}
              onChange={() => {
                formAdicionarItem.setFieldsValue({
                  produtoId: undefined,
                })
              }}
            />
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.categoria !== curr.categoria} noStyle>
            {({ getFieldValue }) => {
              const categoria = getFieldValue('categoria')
              const produtosDaCategoria = categoria
                ? produtosPorCategoria[categoria] || []
                : []

              return (
                <Form.Item
                  label="Produto"
                  name="produtoId"
                  rules={[{ required: true, message: 'Selecione o produto' }]}
                >
                  <Select
                    placeholder="Selecione o produto"
                    options={produtosDaCategoria.map((produto) => ({
                      label: `${produto.nome} • ${formatCurrency(produto.preco)}`,
                      value: produto.id,
                    }))}
                  />
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item
            label="Quantidade"
            name="qtd"
            rules={[{ required: true, message: 'Informe a quantidade' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Observação" name="observacao">
            <TextArea
              rows={3}
              placeholder="Ex.: sem cebola, mandar junto, ponto da carne..."
            />
          </Form.Item>

          {produtoSelecionado && (
            <Alert
              style={{ marginTop: 8 }}
              type="info"
              showIcon
              message={`Preço unitário: ${formatCurrency(produtoSelecionado.preco)}`}
            />
          )}
        </Form>
      </Modal>

      <Modal
        title="Dividir conta"
        open={modalDividirContaOpen}
        onCancel={() => setModalDividirContaOpen(false)}
        footer={null}
      >
        <Form form={formDividirConta} layout="vertical">
          <Form.Item
            label="Dividir em quantas pessoas"
            name="qtdPessoas"
            rules={[{ required: true, message: 'Informe a quantidade' }]}
          >
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
        </Form>

        <Card
          size="small"
          style={{
            background: '#141414',
            border: '1px solid #262626',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#bfbfbf' }}>Total da comanda</Text>
              <Text style={{ color: '#fff' }}>{formatCurrency(totalSelecionado)}</Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#bfbfbf' }}>Divisão</Text>
              <Text style={{ color: '#fff' }}>{qtdDivisaoAtual}x</Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#bfbfbf' }}>Valor por pessoa</Text>
              <Text style={{ color: '#fff', fontWeight: 700 }}>
                {formatCurrency(valorDivisaoConta)}
              </Text>
            </div>
          </Space>
        </Card>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setModalDividirContaOpen(false)}>Fechar</Button>
        </div>
      </Modal>

      <Modal
        title="Fechar conta"
        open={modalFechamentoOpen}
        onCancel={() => setModalFechamentoOpen(false)}
        onOk={confirmarFechamento}
        okText="Confirmar fechamento"
        cancelText="Cancelar"
        confirmLoading={loadingAction}
      >
        <Form form={formFechamento} layout="vertical">
          <Form.Item label="Total da comanda">
            <Input
              value={comandaSelecionada ? formatCurrency(comandaSelecionada.total) : ''}
              disabled
            />
          </Form.Item>

          <Form.Item
            label="Forma de pagamento"
            name="pagamento"
            rules={[{ required: true, message: 'Selecione a forma de pagamento' }]}
          >
            <Select
              options={[
                { label: 'PIX', value: 'PIX' },
                { label: 'Cartão de crédito', value: 'Cartão de crédito' },
                { label: 'Cartão de débito', value: 'Cartão de débito' },
                { label: 'Dinheiro', value: 'Dinheiro' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Dividir em quantas partes" name="divisao">
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>

          <Card
            size="small"
            style={{
              background: '#141414',
              border: '1px solid #262626',
              marginBottom: 16,
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#bfbfbf' }}>Total</Text>
                <Text style={{ color: '#fff' }}>{formatCurrency(totalSelecionado)}</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#bfbfbf' }}>Divisão</Text>
                <Text style={{ color: '#fff' }}>{divisaoAtual}x</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#bfbfbf' }}>Valor por parte</Text>
                <Text style={{ color: '#fff', fontWeight: 700 }}>
                  {formatCurrency(totalPorPessoa)}
                </Text>
              </div>
            </Space>
          </Card>

          <Form.Item
            label="Valor recebido"
            name="valorRecebido"
            rules={[{ required: true, message: 'Informe o valor recebido' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              addonBefore={<WalletOutlined />}
            />
          </Form.Item>

          {pagamentoFechamento === 'Dinheiro' && (
            <>
              {Number(valorRecebidoFechamento || 0) < totalSelecionado ? (
                <Alert
                  type="warning"
                  showIcon
                  message="O valor recebido ainda é menor que o total da comanda."
                  style={{ marginBottom: 12 }}
                />
              ) : (
                <Alert
                  type="success"
                  showIcon
                  message={`Troco: ${formatCurrency(trocoFechamento)}`}
                  style={{ marginBottom: 12 }}
                />
              )}
            </>
          )}
        </Form>
      </Modal>
    </>
  )
}