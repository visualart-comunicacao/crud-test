import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
  Spin,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FireOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import http from '@/api/http'

const { Title, Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

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
    borderColor: '#9e9e9e',
    bg: '#8c8c8c',
    badge: 'default',
  },
  ABERTA: {
    label: 'Aberta',
    color: 'processing',
    borderColor: '#1677ff',
    bg: '#1677ff',
    badge: 'processing',
  },
  FECHADA: {
    label: 'Finalizada',
    color: 'success',
    borderColor: '#389e0d',
    bg: '#389e0d',
    badge: 'success',
  },
  CANCELADA: {
    label: 'Cancelada',
    color: 'default',
    borderColor: '#434343',
    bg: '#434343',
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

function getApiError(error, fallback) {
  return error?.response?.data?.message || fallback
}

function getOrderStatus(order) {
  if (!order) return STATUS_COMANDA.LIVRE
  if (order.status === 'ABERTA') return STATUS_COMANDA.ABERTA
  if (order.status === 'FECHADA') return STATUS_COMANDA.FINALIZADA
  if (order.status === 'CANCELADA') return STATUS_COMANDA.CANCELADA
  return STATUS_COMANDA.ABERTA
}

function getTableName(table) {
  if (!table) return '-'
  return table.nome || table.name || `Mesa ${String(table.numero ?? table.number).padStart(2, '0')}`
}

function getTableNumberLabel(table) {
  if (!table) return '-'
  if (table.numero !== undefined && table.numero !== null) {
    return String(table.numero).padStart(2, '0')
  }
  if (table.number !== undefined && table.number !== null) {
    return String(table.number).padStart(2, '0')
  }
  return table.nome || table.name || '-'
}

function getIsTableActive(table) {
  if (!table) return true
  if (typeof table.ativo === 'boolean') return table.ativo
  if (typeof table.isActive === 'boolean') return table.isActive
  return table.status !== 'INATIVA'
}

function hasKitchenSentFlag(notes) {
  return String(notes || '').includes('[KITCHEN_SENT]')
}

function hasKitchenPreparingFlag(notes) {
  return String(notes || '').includes('[KITCHEN_PREPARO]')
}

function hasKitchenReadyFlag(notes) {
  return String(notes || '').includes('[KITCHEN_READY]')
}

function removeKitchenFlags(notes) {
  return String(notes || '')
    .replace(/\[KITCHEN_SENT\]/g, '')
    .replace(/\[KITCHEN_PREPARO\]/g, '')
    .replace(/\[KITCHEN_READY\]/g, '')
    .replace(/\[KITCHEN_FINISHED\]/g, '')
    .trim()
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
          mesa: getTableName(table),
          numero: table.numero ?? table.number,
          nome: table.nome ?? table.name,
          cliente: '',
          pessoas: 0,
          status: STATUS_COMANDA.LIVRE,
          total: 0,
          criadaEm: '',
          ultimaAtualizacao: '',
          garcom: '',
          tipoAtendimento: 'salao',
          itens: [],
          ativo: getIsTableActive(table),
          rawTable: table,
          rawOrder: null,
        }
      }

      return {
        id: openOrder.id,
        mesaId: table.id,
        mesa: openOrder.table?.nome || openOrder.table?.name || getTableName(table),
        numero: openOrder.table?.numero ?? openOrder.table?.number ?? table.numero ?? table.number,
        nome: openOrder.table?.nome ?? openOrder.table?.name ?? table.nome ?? table.name,
        cliente: openOrder.customerName || '',
        pessoas: 0,
        status: getOrderStatus(openOrder),
        total: Number(openOrder.total || 0),
        criadaEm: openOrder.openedAt || '',
        ultimaAtualizacao: openOrder.updatedAt || '',
        garcom: openOrder.createdBy?.name || openOrder.createdBy?.username || '',
        tipoAtendimento: 'salao',
        itens: openOrder.items || [],
        ativo: getIsTableActive(table),
        rawTable: table,
        rawOrder: openOrder,
      }
    })
    .sort((a, b) => Number(a.numero || 0) - Number(b.numero || 0))
}

function getStatusItemTag(item) {
  if (item.status === 'CANCELADO') {
    return { color: 'error', label: 'Cancelado' }
  }
  if (hasKitchenReadyFlag(item.notes)) {
    return { color: 'success', label: 'Pronto' }
  }
  if (hasKitchenPreparingFlag(item.notes)) {
    return { color: 'warning', label: 'Em preparo' }
  }
  if (hasKitchenSentFlag(item.notes)) {
    return { color: 'processing', label: 'Enviado cozinha' }
  }
  return { color: 'success', label: 'Ativo' }
}

function MesaButton({ comanda, onClick }) {
  const status = statusConfig[comanda.status] || statusConfig.LIVRE
  const livre = comanda.status === STATUS_COMANDA.LIVRE

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: livre ? 84 : 116,
        border: 'none',
        borderRadius: 12,
        background: status.bg,
        color: '#fff',
        padding: '10px 8px',
        cursor: 'pointer',
        boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
        opacity: comanda.ativo ? 1 : 0.55,
      }}
    >
      <div
        style={{
          fontSize: livre ? 28 : 26,
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: livre ? 0 : 6,
        }}
      >
        {String(comanda.numero || comanda.mesa || '').padStart(2, '0')}
      </div>

      {!livre && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              minHeight: 28,
              lineHeight: 1.2,
              overflow: 'hidden',
            }}
          >
            {comanda.cliente || 'Mesa sem identificação'}
          </div>

          <div style={{ fontSize: 10, marginTop: 6 }}>
            {formatCurrency(comanda.total)}
          </div>

          <div style={{ fontSize: 10, opacity: 0.95 }}>
            {comanda.ultimaAtualizacao || '--'}
          </div>
        </>
      )}
    </button>
  )
}

export default function ComandasMobile() {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const user = getCurrentUser()

  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [caixaAtual, setCaixaAtual] = useState(null)

  const [loadingPage, setLoadingPage] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)

  const [view, setView] = useState('lista')
  const [busca, setBusca] = useState('')

  const [comandaSelecionadaId, setComandaSelecionadaId] = useState(null)

  const [drawerNovaComandaOpen, setDrawerNovaComandaOpen] = useState(false)
  const [drawerAdicionarItemOpen, setDrawerAdicionarItemOpen] = useState(false)
  const [drawerEditarItemOpen, setDrawerEditarItemOpen] = useState(false)
  const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false)
  const [modalFechamentoOpen, setModalFechamentoOpen] = useState(false)

  const [itemEditando, setItemEditando] = useState(null)

  const [formNovaComanda] = Form.useForm()
  const [formAdicionarItem] = Form.useForm()
  const [formEditarItem] = Form.useForm()
  const [formTransferencia] = Form.useForm()
  const [formFechamento] = Form.useForm()

  async function carregarTudo() {
    try {
      setLoadingPage(true)

      const [tablesRes, ordersRes, productsRes, cashRes] = await Promise.all([
        http.get('/tables'),
        http.get('/orders'),
        http.get('/products'),
        http.get('/cash-register/current').catch(() => ({ data: null })),
      ])

      setTables(tablesRes.data || [])
      setOrders(ordersRes.data || [])
      setProducts(productsRes.data || [])
      setCaixaAtual(cashRes?.data?.caixa || null)
    } catch (error) {
      message.error(getApiError(error, 'Não foi possível carregar os dados.'))
    } finally {
      setLoadingPage(false)
    }
  }

  async function carregarCaixaAtual() {
    try {
      const { data } = await http.get('/cash-register/current')
      setCaixaAtual(data?.caixa || null)
      return data?.caixa || null
    } catch {
      setCaixaAtual(null)
      return null
    }
  }

  useEffect(() => {
    carregarTudo()
  }, [])

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

  const produtosPorCategoria = useMemo(() => {
    return products.reduce((acc, produto) => {
      const categoria = produto.categoriaNome || 'Sem categoria'
      if (!acc[categoria]) acc[categoria] = []
      acc[categoria].push(produto)
      return acc
    }, {})
  }, [products])

  const resumo = useMemo(() => {
    return {
      ativas: comandas.filter((item) => item.status !== STATUS_COMANDA.LIVRE).length,
      livres: comandas.filter((item) => item.status === STATUS_COMANDA.LIVRE).length,
    }
  }, [comandas])

  const comandasAtivasFiltradas = useMemo(() => {
    const texto = busca.toLowerCase().trim()

    return comandas.filter((comanda) => {
      if (comanda.status === STATUS_COMANDA.LIVRE) return false

      return (
        String(comanda.mesa || '').toLowerCase().includes(texto) ||
        String(comanda.cliente || '').toLowerCase().includes(texto) ||
        String(comanda.id || '').includes(texto) ||
        String(comanda.garcom || '').toLowerCase().includes(texto)
      )
    })
  }, [comandas, busca])

  const comandasLivresFiltradas = useMemo(() => {
    const texto = busca.toLowerCase().trim()

    return comandas.filter((comanda) => {
      if (comanda.status !== STATUS_COMANDA.LIVRE) return false
      if (!comanda.ativo) return false

      return String(comanda.mesa || '').toLowerCase().includes(texto)
    })
  }, [comandas, busca])

  const mesasLivres = useMemo(() => {
    return comandas.filter(
      (item) => item.status === STATUS_COMANDA.LIVRE && item.ativo,
    )
  }, [comandas])

  const produtoSelecionadoId = Form.useWatch('produtoId', formAdicionarItem)
  const produtoSelecionado = products.find(
    (produto) => String(produto.id) === String(produtoSelecionadoId),
  )

  const produtoEditandoSelecionadoId = Form.useWatch('produtoId', formEditarItem)
  const produtoEditandoSelecionado = products.find(
    (produto) => String(produto.id) === String(produtoEditandoSelecionadoId),
  )

  const pagamentoFechamento = Form.useWatch('pagamento', formFechamento)
  const valorRecebidoFechamento = Form.useWatch('valorRecebido', formFechamento)
  const divisaoFechamento = Form.useWatch('divisao', formFechamento)

  const totalSelecionado = Number(comandaSelecionada?.total || 0)
  const divisaoAtual = Number(divisaoFechamento || 1)
  const totalPorPessoa = divisaoAtual > 0 ? totalSelecionado / divisaoAtual : totalSelecionado
  const trocoFechamento =
    pagamentoFechamento === 'DINHEIRO'
      ? Math.max(Number(valorRecebidoFechamento || 0) - totalSelecionado, 0)
      : 0

  const selecionarComanda = (comanda) => {
    if (comanda.status === STATUS_COMANDA.LIVRE) {
      formNovaComanda.resetFields()
      formNovaComanda.setFieldsValue({
        mesa: comanda.mesa,
        cliente: '',
        pessoas: 1,
        tipoAtendimento: 'salao',
        garcom: user?.name || user?.username || '',
        observacao: '',
      })
      setDrawerNovaComandaOpen(true)
      return
    }

    setComandaSelecionadaId(comanda.id)
    setView('detalhe')
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
      setDrawerNovaComandaOpen(false)
      setView('detalhe')
      message.success('Comanda aberta com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(getApiError(error, 'Não foi possível abrir a comanda.'))
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirAdicionarItem = () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    formAdicionarItem.resetFields()
    formAdicionarItem.setFieldsValue({
      qtd: 1,
      observacao: '',
    })
    setDrawerAdicionarItemOpen(true)
  }

  const salvarNovoItem = async () => {
    try {
      const values = await formAdicionarItem.validateFields()
      if (!comandaSelecionada?.rawOrder) return

      setLoadingAction(true)

      const { data } = await http.post(
        `/orders/${comandaSelecionada.rawOrder.id}/items`,
        {
          productId: values.produtoId,
          quantity: values.qtd,
          notes: values.observacao || '',
        },
      )

      setOrders((prev) =>
        prev.map((item) =>
          item.id === comandaSelecionada.rawOrder.id ? data : item,
        ),
      )

      setDrawerAdicionarItemOpen(false)
      message.success('Item adicionado à comanda')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(getApiError(error, 'Não foi possível adicionar o item.'))
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirEditarItem = (item) => {
    if (!comandaSelecionada?.rawOrder) return

    setItemEditando(item)
    formEditarItem.resetFields()
    formEditarItem.setFieldsValue({
      categoria: products.find((p) => String(p.id) === String(item.productId))?.categoriaNome,
      produtoId: item.productId,
      qtd: item.quantity,
      observacao: removeKitchenFlags(item.notes || ''),
    })
    setDrawerEditarItemOpen(true)
  }

  const salvarEdicaoItem = async () => {
    try {
      const values = await formEditarItem.validateFields()
      if (!comandaSelecionada?.rawOrder || !itemEditando) return

      setLoadingAction(true)

      const { data } = await http.put(
        `/orders/${comandaSelecionada.rawOrder.id}/items/${itemEditando.id}`,
        {
          productId: values.produtoId,
          quantity: values.qtd,
          notes: values.observacao || '',
        },
      )

      setOrders((prev) =>
        prev.map((item) =>
          item.id === comandaSelecionada.rawOrder.id ? data : item,
        ),
      )

      setDrawerEditarItemOpen(false)
      setItemEditando(null)
      message.success('Item atualizado com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(getApiError(error, 'Não foi possível editar o item.'))
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
        prev.map((item) =>
          item.id === comandaSelecionada.rawOrder.id ? data : item,
        ),
      )

      message.success('Item cancelado')
    } catch (error) {
      message.error(getApiError(error, 'Não foi possível cancelar o item.'))
    } finally {
      setLoadingAction(false)
    }
  }

  const enviarParaCozinha = async () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    const itensAtivos = (comandaSelecionada.itens || []).filter(
      (item) => item.status === 'ATIVO',
    )

    if (!itensAtivos.length) {
      message.warning('A comanda não possui itens ativos para envio')
      return
    }

    const itensPendentes = itensAtivos.filter((item) => !hasKitchenSentFlag(item.notes))

    if (!itensPendentes.length) {
      message.info('Todos os itens já foram enviados para a cozinha')
      return
    }

    try {
      setLoadingAction(true)

      const { data } = await http.patch(
        `/orders/${comandaSelecionada.rawOrder.id}/send-to-kitchen`,
      )

      setOrders((prev) =>
        prev.map((item) =>
          item.id === comandaSelecionada.rawOrder.id ? data : item,
        ),
      )

      message.success('Itens enviados para a cozinha')
    } catch (error) {
      message.error(getApiError(error, 'Não foi possível enviar para a cozinha.'))
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirTransferencia = () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    formTransferencia.resetFields()
    formTransferencia.setFieldsValue({
      mesaAtual: comandaSelecionada.mesa,
    })
    setModalTransferenciaOpen(true)
  }

  const confirmarTransferencia = async () => {
    try {
      const values = await formTransferencia.validateFields()
      if (!comandaSelecionada?.rawOrder) return

      setLoadingAction(true)

      const mesaDestino = mesasLivres.find((item) => item.mesa === values.novaMesa)

      if (!mesaDestino) {
        message.error('Mesa de destino não encontrada')
        return
      }

      const { data } = await http.patch(
        `/orders/${comandaSelecionada.rawOrder.id}/transfer-table`,
        {
          newTableId: mesaDestino.mesaId,
        },
      )

      setOrders((prev) =>
        prev.map((item) =>
          item.id === comandaSelecionada.rawOrder.id ? data : item,
        ),
      )

      setModalTransferenciaOpen(false)
      message.success('Mesa transferida com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(getApiError(error, 'Não foi possível transferir a mesa.'))
      }
    } finally {
      setLoadingAction(false)
    }
  }

  const abrirFechamento = async () => {
    if (!comandaSelecionada?.rawOrder) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    if (!comandaSelecionada.itens.length) {
      message.warning('A comanda não possui itens')
      return
    }

    const caixa = await carregarCaixaAtual()

    if (!caixa || caixa.status !== 'ABERTO') {
      message.error('Abra o caixa antes de fechar a comanda.')
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

      const total = Number(comandaSelecionada.total || 0)
      const valorRecebido = Number(values.valorRecebido || 0)
      const pagamentoDinheiro = values.pagamento === 'DINHEIRO'
      const divisao = Math.max(Number(values.divisao || 1), 1)

      if (pagamentoDinheiro && valorRecebido < total) {
        message.error('O valor recebido é menor que o total da comanda')
        return
      }

      const caixa = await carregarCaixaAtual()

      if (!caixa || caixa.status !== 'ABERTO') {
        message.error('Abra o caixa antes de fechar a comanda.')
        return
      }

      setLoadingAction(true)

      const orderId = comandaSelecionada.rawOrder.id
      const payments = []

      if (divisao <= 1) {
        payments.push({
          method: values.pagamento,
          amount: Number(total.toFixed(2)),
        })
      } else {
        const valorBase = Number((total / divisao).toFixed(2))
        let acumulado = 0

        for (let index = 0; index < divisao; index += 1) {
          const isLast = index === divisao - 1
          const amount = isLast
            ? Number((total - acumulado).toFixed(2))
            : valorBase

          acumulado += amount

          payments.push({
            method: values.pagamento,
            amount,
          })
        }
      }

      await http.post(`/cash-register/order/${orderId}/payment`, {
        payments,
        notes: `Fechamento da comanda ${comandaSelecionada.mesa}`,
      })

      const [tablesRes, ordersRes, productsRes, cashRes] = await Promise.all([
        http.get('/tables'),
        http.get('/orders'),
        http.get('/products'),
        http.get('/cash-register/current').catch(() => ({ data: null })),
      ])

      const novasTables = tablesRes.data || []
      const novasOrders = ordersRes.data || []
      const novosProducts = productsRes.data || []

      setTables(novasTables)
      setOrders(novasOrders)
      setProducts(novosProducts)
      setCaixaAtual(cashRes?.data?.caixa || null)

      const novasComandas = buildMesas(novasTables, novasOrders)
      const proximaComanda =
        novasComandas.find(
          (item) =>
            String(item.id) !== String(orderId) &&
            item.status !== STATUS_COMANDA.LIVRE,
        ) || null

      setComandaSelecionadaId(proximaComanda?.id || null)
      setModalFechamentoOpen(false)
      setView('lista')
      message.success('Conta fechada com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(getApiError(error, 'Não foi possível fechar a comanda.'))
      }
    } finally {
      setLoadingAction(false)
    }
  }

  if (!isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f5f5f5',
          padding: 24,
        }}
      >
        <Card style={{ maxWidth: 420, width: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>
              Tela exclusiva para celular
            </Title>
            <Text type="secondary">
              Essa página foi pensada para o garçom usar no celular.
            </Text>
          </Space>
        </Card>
      </div>
    )
  }

  if (loadingPage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#efefef',
          padding: 24,
        }}
      >
        <Card style={{ width: '100%', maxWidth: 420, borderRadius: 12 }}>
          <div
            style={{
              minHeight: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#efefef',
        paddingBottom: view === 'detalhe' && comandaSelecionada ? 96 : 16,
      }}
    >
      {view === 'lista' ? (
        <>
          <div
            style={{
              padding: '12px 12px 4px',
            }}
          >
            <Input
              allowClear
              size="large"
              placeholder="Digite nº da mesa, cliente ou garçom..."
              prefix={<SearchOutlined />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                borderRadius: 12,
              }}
            />
          </div>

          <div style={{ padding: '6px 12px 0' }}>
            <Text strong style={{ fontSize: 15 }}>
              Pedidos em andamento ({comandasAtivasFiltradas.length})
            </Text>

            <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
              {comandasAtivasFiltradas.map((comanda) => (
                <Col span={8} key={`${comanda.mesa}-${comanda.id}`}>
                  <MesaButton
                    comanda={comanda}
                    onClick={() => selecionarComanda(comanda)}
                  />
                </Col>
              ))}
            </Row>

            {!comandasAtivasFiltradas.length && (
              <Card style={{ marginTop: 10, borderRadius: 12 }}>
                <Empty description="Nenhuma comanda em andamento" />
              </Card>
            )}
          </div>

          <div style={{ padding: '18px 12px 0' }}>
            <Text strong style={{ fontSize: 15 }}>
              Mesas livres ({comandasLivresFiltradas.length})
            </Text>

            <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
              {comandasLivresFiltradas.map((comanda) => (
                <Col span={6} key={`${comanda.mesa}-${comanda.id}`}>
                  <MesaButton
                    comanda={comanda}
                    onClick={() => selecionarComanda(comanda)}
                  />
                </Col>
              ))}
            </Row>

            {!comandasLivresFiltradas.length && (
              <Card style={{ marginTop: 10, borderRadius: 12 }}>
                <Empty description="Nenhuma mesa livre encontrada" />
              </Card>
            )}
          </div>

          <div
            style={{
              position: 'sticky',
              bottom: 0,
              marginTop: 16,
              background: '#fff',
              borderTop: '1px solid #d9d9d9',
              padding: '10px 12px',
            }}
          >
            <Row gutter={10}>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ borderRadius: 10 }}
                  styles={{ body: { padding: 8, textAlign: 'center' } }}
                >
                  <Text style={{ fontSize: 12 }}>Ativas: {resumo.ativas}</Text>
                </Card>
              </Col>

              <Col span={8}>
                <Card
                  size="small"
                  style={{ borderRadius: 10 }}
                  styles={{ body: { padding: 8, textAlign: 'center' } }}
                >
                  <Text style={{ fontSize: 12 }}>Livres: {resumo.livres}</Text>
                </Card>
              </Col>

              <Col span={8}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    formNovaComanda.resetFields()
                    formNovaComanda.setFieldsValue({
                      pessoas: 1,
                      tipoAtendimento: 'salao',
                      garcom: user?.name || user?.username || '',
                      observacao: '',
                    })
                    setDrawerNovaComandaOpen(true)
                  }}
                  style={{ borderRadius: 10 }}
                >
                  Nova
                </Button>
              </Col>
            </Row>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              background: '#ffffff',
              padding: '10px 12px',
              borderBottom: '1px solid #e8e8e8',
              position: 'sticky',
              top: 0,
              zIndex: 20,
            }}
          >
            <Space
              align="center"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <Space align="center">
                <Button
                  shape="circle"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setView('lista')}
                />
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {comandaSelecionada?.mesa}
                  </Title>
                  <Text type="secondary">
                    {comandaSelecionada?.rawOrder
                      ? `Comanda #${String(comandaSelecionada.rawOrder.id).slice(-6)}`
                      : 'Sem comanda'}
                  </Text>
                </div>
              </Space>

              <Tag color={statusConfig[comandaSelecionada?.status]?.color}>
                {statusConfig[comandaSelecionada?.status]?.label}
              </Tag>
            </Space>
          </div>

          <div style={{ padding: 12 }}>
            {comandaSelecionada ? (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {!caixaAtual || caixaAtual.status !== 'ABERTO' ? (
                  <Alert
                    type="warning"
                    showIcon
                    message="Caixa fechado"
                    description="Abra o caixa antes de fechar comandas."
                  />
                ) : null}

                <Card style={{ borderRadius: 12 }}>
                  <Descriptions size="small" column={1}>
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
                      {comandaSelecionada.criadaEm || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Última atualização">
                      {comandaSelecionada.ultimaAtualizacao || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                      <Badge
                        status={statusConfig[comandaSelecionada.status]?.badge}
                        text={statusConfig[comandaSelecionada.status]?.label}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Ações rápidas"
                  style={{ borderRadius: 12 }}
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      onClick={abrirAdicionarItem}
                      disabled={!comandaSelecionada?.rawOrder}
                    >
                      Novo item
                    </Button>
                  }
                >
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Button
                        block
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={abrirAdicionarItem}
                        disabled={!comandaSelecionada?.rawOrder}
                      >
                        Adicionar
                      </Button>
                    </Col>

                    <Col span={12}>
                      <Button
                        block
                        size="large"
                        icon={<FireOutlined />}
                        onClick={enviarParaCozinha}
                        disabled={
                          !comandaSelecionada?.rawOrder ||
                          !(comandaSelecionada.itens || []).some(
                            (item) => item.status === 'ATIVO' && !hasKitchenSentFlag(item.notes),
                          )
                        }
                      >
                        Cozinha
                      </Button>
                    </Col>

                    <Col span={12}>
                      <Button
                        block
                        size="large"
                        icon={<SwapOutlined />}
                        onClick={abrirTransferencia}
                        disabled={!comandaSelecionada?.rawOrder}
                      >
                        Transferir
                      </Button>
                    </Col>

                    <Col span={12}>
                      <Button
                        block
                        size="large"
                        icon={<CheckCircleOutlined />}
                        onClick={abrirFechamento}
                        disabled={!comandaSelecionada?.rawOrder}
                      >
                        Fechar
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card
                  title="Itens da comanda"
                  style={{ borderRadius: 12 }}
                  extra={
                    <Text strong style={{ fontSize: 16 }}>
                      {formatCurrency(comandaSelecionada.total)}
                    </Text>
                  }
                >
                  <List
                    locale={{ emptyText: 'Nenhum item nesta comanda' }}
                    dataSource={comandaSelecionada.itens}
                    renderItem={(item) => {
                      const statusItemConfig = getStatusItemTag(item)

                      return (
                        <List.Item
                          style={{ paddingInline: 0 }}
                          actions={[
                            <Button
                              key="edit"
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => abrirEditarItem(item)}
                              disabled={item.status === 'CANCELADO'}
                            >
                              Editar
                            </Button>,
                            item.status !== 'CANCELADO' ? (
                              <Popconfirm
                                key="remove"
                                title="Cancelar item?"
                                onConfirm={() => removerItem(item.id)}
                              >
                                <Button type="link" danger>
                                  Cancelar
                                </Button>
                              </Popconfirm>
                            ) : null,
                          ].filter(Boolean)}
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
                              <Text strong>
                                {item.quantity}x {item.productName}
                              </Text>

                              <Text strong>
                                {formatCurrency(item.totalPrice)}
                              </Text>
                            </div>

                            <Space wrap size={[6, 6]}>
                              <Tag color={statusItemConfig.color}>
                                {statusItemConfig.label}
                              </Tag>
                            </Space>

                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Unitário: {formatCurrency(item.unitPrice)}
                              </Text>
                            </div>

                            {!!removeKitchenFlags(item.notes) && (
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Obs.: {removeKitchenFlags(item.notes)}
                                </Text>
                              </div>
                            )}
                          </div>
                        </List.Item>
                      )
                    }}
                  />
                </Card>
              </Space>
            ) : (
              <Card style={{ borderRadius: 12 }}>
                <Empty description="Selecione uma comanda" />
              </Card>
            )}
          </div>

          {comandaSelecionada && (
            <div
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 30,
                background: '#fff',
                borderTop: '1px solid #d9d9d9',
                padding: 12,
              }}
            >
              <Row gutter={8}>
                <Col span={12}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlusOutlined />}
                    onClick={abrirAdicionarItem}
                    style={{ borderRadius: 10 }}
                    disabled={!comandaSelecionada?.rawOrder}
                  >
                    Adicionar item
                  </Button>
                </Col>

                <Col span={12}>
                  <Button
                    danger
                    size="large"
                    block
                    icon={<CheckCircleOutlined />}
                    onClick={abrirFechamento}
                    style={{ borderRadius: 10 }}
                    disabled={!comandaSelecionada?.rawOrder}
                  >
                    Fechar conta
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </>
      )}

      <Drawer
        title="Nova comanda"
        open={drawerNovaComandaOpen}
        onClose={() => setDrawerNovaComandaOpen(false)}
        placement="bottom"
        height="86vh"
        extra={
          <Button type="primary" onClick={salvarNovaComanda} loading={loadingAction}>
            Abrir
          </Button>
        }
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
      </Drawer>

      <Drawer
        title="Adicionar item"
        open={drawerAdicionarItemOpen}
        onClose={() => setDrawerAdicionarItemOpen(false)}
        placement="bottom"
        height="92vh"
        extra={
          <Button type="primary" onClick={salvarNovoItem} loading={loadingAction}>
            Adicionar
          </Button>
        }
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
              rows={4}
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
      </Drawer>

      <Drawer
        title="Editar item"
        open={drawerEditarItemOpen}
        onClose={() => {
          setDrawerEditarItemOpen(false)
          setItemEditando(null)
        }}
        placement="bottom"
        height="92vh"
        extra={
          <Button type="primary" onClick={salvarEdicaoItem} loading={loadingAction}>
            Salvar
          </Button>
        }
      >
        <Form form={formEditarItem} layout="vertical">
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
                formEditarItem.setFieldsValue({
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
              rows={4}
              placeholder="Ex.: sem cebola, mandar junto, ponto da carne..."
            />
          </Form.Item>

          {produtoEditandoSelecionado && (
            <Alert
              style={{ marginTop: 8 }}
              type="info"
              showIcon
              message={`Preço unitário: ${formatCurrency(produtoEditandoSelecionado.preco)}`}
            />
          )}
        </Form>
      </Drawer>

      <Modal
        title="Transferir mesa"
        open={modalTransferenciaOpen}
        onCancel={() => setModalTransferenciaOpen(false)}
        onOk={confirmarTransferencia}
        okText="Transferir"
        cancelText="Cancelar"
        confirmLoading={loadingAction}
      >
        <Form form={formTransferencia} layout="vertical">
          <Form.Item label="Mesa atual">
            <Input value={comandaSelecionada?.mesa} disabled />
          </Form.Item>

          <Form.Item
            label="Nova mesa"
            name="novaMesa"
            rules={[{ required: true, message: 'Selecione a nova mesa' }]}
          >
            <Select
              placeholder="Selecione a mesa de destino"
              options={mesasLivres
                .filter((item) => item.mesaId !== comandaSelecionada?.mesaId)
                .map((item) => ({
                  label: item.mesa,
                  value: item.mesa,
                }))}
            />
          </Form.Item>
        </Form>
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
                { label: 'Cartão de crédito', value: 'CREDITO' },
                { label: 'Cartão de débito', value: 'DEBITO' },
                { label: 'Dinheiro', value: 'DINHEIRO' },
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
            rules={[
              {
                required: true,
                message: 'Informe o valor recebido',
              },
            ]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              addonBefore={<WalletOutlined />}
            />
          </Form.Item>

          {pagamentoFechamento === 'DINHEIRO' && (
            <>
              {Number(valorRecebidoFechamento || 0) < totalSelecionado ? (
                <Alert
                  type="warning"
                  showIcon
                  message="O valor recebido ainda é menor que o total da comanda."
                />
              ) : (
                <Alert
                  type="success"
                  showIcon
                  message={`Troco: ${formatCurrency(trocoFechamento)}`}
                />
              )}
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}