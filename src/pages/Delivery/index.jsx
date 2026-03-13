import { useMemo, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Input,
  Tag,
  Button,
  Space,
  Typography,
  Statistic,
  Badge,
  Divider,
  Empty,
  message,
  Select,
  Switch,
  Segmented,
  Tabs,
  Form,
  InputNumber,
  Table,
  Modal,
  Popconfirm,
  List,
} from 'antd'
import {
  SearchOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UndoOutlined,
  CarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  FilterOutlined,
  ShopOutlined,
  WalletOutlined,
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import PageTitle from '../../components/common/PageTitle'

const { Title, Text } = Typography
const { TextArea } = Input

const STATUS_DELIVERY = {
  RECEBIDO: 'recebido',
  PREPARANDO: 'preparando',
  ROTA: 'rota',
  ENTREGUE: 'entregue',
}

const TIPO_ENTREGA = {
  DELIVERY: 'delivery',
  RETIRADA: 'retirada',
}

const produtosMock = [
  { id: 1, categoria: 'Espetos', nome: 'Espeto de Carne', preco: 12 },
  { id: 2, categoria: 'Espetos', nome: 'Espeto de Frango', preco: 11 },
  { id: 3, categoria: 'Espetos', nome: 'Espeto Medalhão', preco: 15 },
  { id: 4, categoria: 'Porções', nome: 'Porção de Fritas', preco: 18.9 },
  { id: 5, categoria: 'Porções', nome: 'Linguiça Acebolada', preco: 22 },
  { id: 6, categoria: 'Bebidas', nome: 'Coca-Cola 600ml', preco: 7.5 },
  { id: 7, categoria: 'Bebidas', nome: 'Coca-Cola 2L', preco: 14 },
  { id: 8, categoria: 'Bebidas', nome: 'Suco Natural', preco: 9 },
  { id: 9, categoria: 'Acompanhamentos', nome: 'Farofa Especial', preco: 12 },
  { id: 10, categoria: 'Acompanhamentos', nome: 'Vinagrete', preco: 5 },
  { id: 11, categoria: 'Entradas', nome: 'Pão de Alho', preco: 8.5 },
]

const clientesIniciais = [
  {
    id: 1,
    nome: 'Mariana Souza',
    telefone: '(16) 99999-1001',
    endereco: 'Rua 7 de Setembro, 245 - Centro',
    bairro: 'Centro',
    referencia: 'Casa com portão branco',
  },
  {
    id: 2,
    nome: 'Ricardo Lima',
    telefone: '(16) 99999-2002',
    endereco: 'Av. Paulo Roberto, 110',
    bairro: 'Jardim Buscardi',
    referencia: 'Próximo à padaria',
  },
  {
    id: 3,
    nome: 'Paula Gomes',
    telefone: '(16) 99999-3003',
    endereco: 'Rua Marechal Deodoro, 88',
    bairro: 'Vale do Sol',
    referencia: '',
  },
]

const entregadoresIniciais = [
  { id: 1, nome: 'André', telefone: '(16) 99999-9001', status: 'em_rota' },
  { id: 2, nome: 'Carlos', telefone: '(16) 99999-9002', status: 'disponivel' },
  { id: 3, nome: 'Mateus', telefone: '(16) 99999-9003', status: 'disponivel' },
]

const pedidosIniciais = [
  {
    id: 3001,
    clienteId: 1,
    cliente: 'Mariana Souza',
    telefone: '(16) 99999-1001',
    endereco: 'Rua 7 de Setembro, 245 - Centro',
    bairro: 'Centro',
    referencia: 'Casa com portão branco',
    origem: TIPO_ENTREGA.DELIVERY,
    status: STATUS_DELIVERY.RECEBIDO,
    prioridade: 'normal',
    pagamento: 'PIX',
    valorTotal: 74.5,
    trocoPara: 0,
    entregador: '',
    canal: 'WhatsApp',
    horarioCriacao: '19:05',
    previsaoEntrega: '19:45',
    tempoMin: 8,
    observacao: 'Sem cebola e tocar campainha',
    itens: [
      { id: 1, produtoId: 1, nome: 'Espeto de Carne', qtd: 3, valor: 12 },
      { id: 2, produtoId: 7, nome: 'Coca-Cola 2L', qtd: 1, valor: 14 },
      { id: 3, produtoId: 9, nome: 'Farofa Especial', qtd: 2, valor: 12 },
    ],
  },
  {
    id: 3002,
    clienteId: 2,
    cliente: 'Ricardo Lima',
    telefone: '(16) 99999-2002',
    endereco: 'Av. Paulo Roberto, 110',
    bairro: 'Jardim Buscardi',
    referencia: 'Próximo à padaria',
    origem: TIPO_ENTREGA.DELIVERY,
    status: STATUS_DELIVERY.PREPARANDO,
    prioridade: 'alta',
    pagamento: 'Dinheiro',
    valorTotal: 98,
    trocoPara: 120,
    entregador: '',
    canal: 'iFood',
    horarioCriacao: '19:00',
    previsaoEntrega: '19:40',
    tempoMin: 18,
    observacao: 'Cliente pediu pressa',
    itens: [
      { id: 1, produtoId: 5, nome: 'Linguiça Acebolada', qtd: 2, valor: 22 },
      { id: 2, produtoId: 2, nome: 'Espeto de Frango', qtd: 4, valor: 11 },
      { id: 3, produtoId: 10, nome: 'Vinagrete', qtd: 2, valor: 5 },
    ],
  },
  {
    id: 3003,
    clienteId: 3,
    cliente: 'Paula Gomes',
    telefone: '(16) 99999-3003',
    endereco: 'Rua Marechal Deodoro, 88',
    bairro: 'Vale do Sol',
    referencia: '',
    origem: TIPO_ENTREGA.DELIVERY,
    status: STATUS_DELIVERY.ROTA,
    prioridade: 'normal',
    pagamento: 'Cartão de crédito',
    valorTotal: 61.9,
    trocoPara: 0,
    entregador: 'André',
    canal: 'Telefone',
    horarioCriacao: '18:55',
    previsaoEntrega: '19:35',
    tempoMin: 24,
    observacao: '',
    itens: [
      { id: 1, produtoId: 3, nome: 'Espeto Medalhão', qtd: 2, valor: 15 },
      { id: 2, produtoId: 11, nome: 'Pão de Alho', qtd: 2, valor: 8.5 },
      { id: 3, produtoId: 6, nome: 'Coca-Cola 600ml', qtd: 2, valor: 7.5 },
    ],
  },
]

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function gerarHorarioAtual() {
  const agora = new Date()
  const horas = String(agora.getHours()).padStart(2, '0')
  const minutos = String(agora.getMinutes()).padStart(2, '0')
  return `${horas}:${minutos}`
}

function somarItens(itens) {
  return itens.reduce((acc, item) => acc + Number(item.qtd) * Number(item.valor), 0)
}

function getTempoCor(tempoMin) {
  if (tempoMin >= 25) return '#ff4d4f'
  if (tempoMin >= 15) return '#faad14'
  return '#52c41a'
}

function getPriorityTag(prioridade) {
  if (prioridade === 'alta') {
    return { color: 'error', label: 'Alta prioridade' }
  }
  return { color: 'default', label: 'Normal' }
}

function getStatusColor(status) {
  if (status === STATUS_DELIVERY.RECEBIDO) return 'processing'
  if (status === STATUS_DELIVERY.PREPARANDO) return 'warning'
  if (status === STATUS_DELIVERY.ROTA) return 'cyan'
  if (status === STATUS_DELIVERY.ENTREGUE) return 'success'
  return 'default'
}

function getStatusLabel(status) {
  if (status === STATUS_DELIVERY.RECEBIDO) return 'Recebido'
  if (status === STATUS_DELIVERY.PREPARANDO) return 'Preparando'
  if (status === STATUS_DELIVERY.ROTA) return 'Em rota'
  if (status === STATUS_DELIVERY.ENTREGUE) return 'Entregue'
  return status
}

function getOrigemLabel(origem) {
  return origem === TIPO_ENTREGA.RETIRADA ? 'Retirada' : 'Delivery'
}

export default function Delivery() {
  const [pedidos, setPedidos] = useState(pedidosIniciais)
  const [clientes, setClientes] = useState(clientesIniciais)
  const [entregadores, setEntregadores] = useState(entregadoresIniciais)

  const [tabAtiva, setTabAtiva] = useState('pedidos')
  const [busca, setBusca] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
  const [filtroOrigem, setFiltroOrigem] = useState('todas')
  const [mostrarApenasAtrasados, setMostrarApenasAtrasados] = useState(false)
  const [mostrarEntregues, setMostrarEntregues] = useState(true)
  const [somAtivo, setSomAtivo] = useState(true)

  const [formPedido] = Form.useForm()
  const [formCliente] = Form.useForm()
  const [formEntregador] = Form.useForm()

  const [itensNovoPedido, setItensNovoPedido] = useState([])
  const [modalClienteOpen, setModalClienteOpen] = useState(false)
  const [modalEntregadorOpen, setModalEntregadorOpen] = useState(false)

  const [clienteSelecionadoId, setClienteSelecionadoId] = useState(null)
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState(null)
  const [quantidadeProduto, setQuantidadeProduto] = useState(1)

  const origemPedido = Form.useWatch('origem', formPedido)
  const pagamentoPedido = Form.useWatch('pagamento', formPedido)
  const trocoParaPedido = Form.useWatch('trocoPara', formPedido)

  const clientesMaisRecentes = useMemo(() => clientes.slice().reverse(), [clientes])

  const entregadoresDisponiveis = useMemo(
    () => entregadores.filter((item) => item.status === 'disponivel'),
    [entregadores]
  )

  const totalNovoPedido = useMemo(() => somarItens(itensNovoPedido), [itensNovoPedido])

  const trocoEstimadoNovoPedido =
    pagamentoPedido === 'Dinheiro'
      ? Math.max(Number(trocoParaPedido || 0) - totalNovoPedido, 0)
      : 0

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const texto = busca.toLowerCase()

      const matchBusca =
        String(pedido.id).includes(texto) ||
        pedido.cliente.toLowerCase().includes(texto) ||
        pedido.telefone.toLowerCase().includes(texto) ||
        pedido.endereco.toLowerCase().includes(texto) ||
        pedido.bairro.toLowerCase().includes(texto) ||
        pedido.canal.toLowerCase().includes(texto) ||
        (pedido.entregador || '').toLowerCase().includes(texto) ||
        pedido.itens.some((item) => item.nome.toLowerCase().includes(texto))

      const matchPrioridade =
        filtroPrioridade === 'todas'
          ? true
          : pedido.prioridade === filtroPrioridade

      const matchOrigem =
        filtroOrigem === 'todas' ? true : pedido.origem === filtroOrigem

      const matchAtrasado = mostrarApenasAtrasados ? pedido.tempoMin >= 25 : true
      const matchEntregues =
        mostrarEntregues ? true : pedido.status !== STATUS_DELIVERY.ENTREGUE

      return (
        matchBusca &&
        matchPrioridade &&
        matchOrigem &&
        matchAtrasado &&
        matchEntregues
      )
    })
  }, [
    pedidos,
    busca,
    filtroPrioridade,
    filtroOrigem,
    mostrarApenasAtrasados,
    mostrarEntregues,
  ])

  const pedidosRecebidos = useMemo(
    () => pedidosFiltrados.filter((item) => item.status === STATUS_DELIVERY.RECEBIDO),
    [pedidosFiltrados]
  )

  const pedidosPreparando = useMemo(
    () =>
      pedidosFiltrados.filter((item) => item.status === STATUS_DELIVERY.PREPARANDO),
    [pedidosFiltrados]
  )

  const pedidosRota = useMemo(
    () => pedidosFiltrados.filter((item) => item.status === STATUS_DELIVERY.ROTA),
    [pedidosFiltrados]
  )

  const pedidosEntregues = useMemo(
    () => pedidosFiltrados.filter((item) => item.status === STATUS_DELIVERY.ENTREGUE),
    [pedidosFiltrados]
  )

  const resumo = useMemo(() => {
    return {
      total: pedidos.length,
      recebidos: pedidos.filter((item) => item.status === STATUS_DELIVERY.RECEBIDO)
        .length,
      preparando: pedidos.filter(
        (item) => item.status === STATUS_DELIVERY.PREPARANDO
      ).length,
      rota: pedidos.filter((item) => item.status === STATUS_DELIVERY.ROTA).length,
      entregues: pedidos.filter((item) => item.status === STATUS_DELIVERY.ENTREGUE)
        .length,
      atrasados: pedidos.filter((item) => item.tempoMin >= 25).length,
      delivery: pedidos.filter((item) => item.origem === TIPO_ENTREGA.DELIVERY).length,
      retirada: pedidos.filter((item) => item.origem === TIPO_ENTREGA.RETIRADA).length,
    }
  }, [pedidos])

  const atualizarStatus = (pedidoId, novoStatus) => {
    setPedidos((prev) =>
      prev.map((item) =>
        item.id === pedidoId
          ? {
              ...item,
              status: novoStatus,
            }
          : item
      )
    )
  }

  const iniciarPreparo = (pedidoId) => {
    atualizarStatus(pedidoId, STATUS_DELIVERY.PREPARANDO)
    message.success('Pedido movido para preparando')
  }

  const despacharPedido = (pedidoId) => {
    setPedidos((prev) =>
      prev.map((item) => {
        if (item.id !== pedidoId) return item

        const entregadorPadrao =
          item.origem === TIPO_ENTREGA.DELIVERY
            ? entregadoresDisponiveis[0]?.nome || 'Motoboy 01'
            : ''

        return {
          ...item,
          status: STATUS_DELIVERY.ROTA,
          entregador: item.entregador || entregadorPadrao,
        }
      })
    )
    message.success('Pedido despachado')
  }

  const marcarEntregue = (pedidoId) => {
    atualizarStatus(pedidoId, STATUS_DELIVERY.ENTREGUE)
    message.success('Pedido marcado como entregue')
  }

  const voltarEtapa = (pedido) => {
    if (pedido.status === STATUS_DELIVERY.ENTREGUE) {
      atualizarStatus(pedido.id, STATUS_DELIVERY.ROTA)
      message.success('Pedido voltou para em rota')
      return
    }

    if (pedido.status === STATUS_DELIVERY.ROTA) {
      atualizarStatus(pedido.id, STATUS_DELIVERY.PREPARANDO)
      message.success('Pedido voltou para preparando')
      return
    }

    if (pedido.status === STATUS_DELIVERY.PREPARANDO) {
      atualizarStatus(pedido.id, STATUS_DELIVERY.RECEBIDO)
      message.success('Pedido voltou para recebido')
      return
    }

    message.info('Esse pedido já está na primeira etapa')
  }

  const chamarEntregador = (pedido) => {
    message.info(
      pedido.origem === TIPO_ENTREGA.RETIRADA
        ? `Aviso de retirada do pedido #${pedido.id}`
        : `Entregador chamado para o pedido #${pedido.id}`
    )
  }

  const tocarAlerta = () => {
    message.info(somAtivo ? 'Alerta sonoro simulado' : 'O som está desativado')
  }

  const selecionarCliente = (clienteId) => {
    const cliente = clientes.find((item) => item.id === clienteId)
    setClienteSelecionadoId(clienteId)

    if (!cliente) return

    formPedido.setFieldsValue({
      clienteId: cliente.id,
      cliente: cliente.nome,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      bairro: cliente.bairro,
      referencia: cliente.referencia,
    })
  }

  const adicionarItemPedido = () => {
    const produto = produtosMock.find((p) => p.id === produtoSelecionadoId)

    if (!produto) {
      message.warning('Selecione um produto')
      return
    }

    if (!quantidadeProduto || quantidadeProduto < 1) {
      message.warning('Informe uma quantidade válida')
      return
    }

    const novoItem = {
      id: Date.now(),
      produtoId: produto.id,
      nome: produto.nome,
      qtd: quantidadeProduto,
      valor: produto.preco,
    }

    setItensNovoPedido((prev) => [...prev, novoItem])
    setProdutoSelecionadoId(null)
    setQuantidadeProduto(1)
    message.success('Item adicionado ao pedido')
  }

  const removerItemPedido = (itemId) => {
    setItensNovoPedido((prev) => prev.filter((item) => item.id !== itemId))
    message.success('Item removido')
  }

  const salvarNovoPedido = async () => {
    try {
      const values = await formPedido.validateFields()

      if (!itensNovoPedido.length) {
        message.warning('Adicione pelo menos um item ao pedido')
        return
      }

      if (
        values.pagamento === 'Dinheiro' &&
        Number(values.trocoPara || 0) < totalNovoPedido
      ) {
        message.error('O valor de troco para precisa ser maior ou igual ao total')
        return
      }

      const novoId = Math.max(...pedidos.map((item) => item.id), 3000) + 1
      const horario = gerarHorarioAtual()

      const novoPedido = {
        id: novoId,
        clienteId: values.clienteId || null,
        cliente: values.cliente,
        telefone: values.telefone,
        endereco:
          values.origem === TIPO_ENTREGA.RETIRADA
            ? 'Retirada no balcão'
            : values.endereco,
        bairro: values.origem === TIPO_ENTREGA.RETIRADA ? '-' : values.bairro,
        referencia:
          values.origem === TIPO_ENTREGA.RETIRADA ? '' : values.referencia || '',
        origem: values.origem,
        status: STATUS_DELIVERY.RECEBIDO,
        prioridade: values.prioridade,
        pagamento: values.pagamento,
        valorTotal: totalNovoPedido,
        trocoPara: values.pagamento === 'Dinheiro' ? Number(values.trocoPara || 0) : 0,
        entregador: '',
        canal: values.canal,
        horarioCriacao: horario,
        previsaoEntrega: values.previsaoEntrega,
        tempoMin: 0,
        observacao: values.observacao || '',
        itens: itensNovoPedido,
      }

      setPedidos((prev) => [novoPedido, ...prev])

      formPedido.resetFields()
      formPedido.setFieldsValue({
        origem: TIPO_ENTREGA.DELIVERY,
        prioridade: 'normal',
        pagamento: 'PIX',
        canal: 'WhatsApp',
      })
      setClienteSelecionadoId(null)
      setItensNovoPedido([])
      setProdutoSelecionadoId(null)
      setQuantidadeProduto(1)
      setTabAtiva('pedidos')

      message.success('Pedido cadastrado com sucesso')
    } catch (error) {}
  }

  const salvarNovoCliente = async () => {
    try {
      const values = await formCliente.validateFields()

      const novoCliente = {
        id: Math.max(...clientes.map((item) => item.id), 0) + 1,
        nome: values.nome,
        telefone: values.telefone,
        endereco: values.endereco,
        bairro: values.bairro,
        referencia: values.referencia || '',
      }

      setClientes((prev) => [...prev, novoCliente])
      setModalClienteOpen(false)
      formCliente.resetFields()
      selecionarCliente(novoCliente.id)
      message.success('Cliente cadastrado com sucesso')
    } catch (error) {}
  }

  const salvarNovoEntregador = async () => {
    try {
      const values = await formEntregador.validateFields()

      const novoEntregador = {
        id: Math.max(...entregadores.map((item) => item.id), 0) + 1,
        nome: values.nome,
        telefone: values.telefone,
        status: 'disponivel',
      }

      setEntregadores((prev) => [...prev, novoEntregador])
      setModalEntregadorOpen(false)
      formEntregador.resetFields()
      message.success('Entregador cadastrado com sucesso')
    } catch (error) {}
  }

  const clientesColumns = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'Telefone', dataIndex: 'telefone' },
    { title: 'Endereço', dataIndex: 'endereco' },
    { title: 'Bairro', dataIndex: 'bairro' },
    {
      title: 'Ação',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            selecionarCliente(record.id)
            setTabAtiva('novoPedido')
          }}
        >
          Usar no pedido
        </Button>
      ),
    },
  ]

  const entregadoresColumns = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'Telefone', dataIndex: 'telefone' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'disponivel' ? 'success' : 'warning'}>
          {status === 'disponivel' ? 'Disponível' : 'Em rota'}
        </Tag>
      ),
    },
  ]

  const renderPedidoCard = (pedido) => {
    const prioridade = getPriorityTag(pedido.prioridade)
    const tempoCor = getTempoCor(pedido.tempoMin)
    const atrasado = pedido.tempoMin >= 25
    const troco =
      pedido.pagamento === 'Dinheiro'
        ? Math.max(pedido.trocoPara - pedido.valorTotal, 0)
        : 0

    return (
      <Card
        key={pedido.id}
        bordered={false}
        style={{
          background: '#171717',
          border: atrasado ? '1px solid #ff4d4f' : '1px solid #262626',
          boxShadow: atrasado ? '0 0 0 1px rgba(255,77,79,0.12)' : 'none',
        }}
        styles={{ body: { padding: 16 } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0, lineHeight: 1.1 }}>
              #{pedido.id}
            </Title>
            <Text style={{ color: '#bfbfbf' }}>{pedido.cliente}</Text>
          </div>

          <Space direction="vertical" size={6} align="end">
            <Tag color={prioridade.color} style={{ marginRight: 0 }}>
              {prioridade.label}
            </Tag>

            <Tag
              color={pedido.origem === TIPO_ENTREGA.RETIRADA ? 'gold' : 'blue'}
              style={{ marginRight: 0 }}
            >
              {getOrigemLabel(pedido.origem)}
            </Tag>

            <Badge
              status={getStatusColor(pedido.status)}
              text={<span style={{ color: '#d9d9d9' }}>{getStatusLabel(pedido.status)}</span>}
            />
          </Space>
        </div>

        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text style={{ color: '#d9d9d9' }}>
            <PhoneOutlined /> <strong>Telefone:</strong> {pedido.telefone}
          </Text>

          <Text style={{ color: '#d9d9d9' }}>
            <EnvironmentOutlined /> <strong>Endereço:</strong> {pedido.endereco}
          </Text>

          <Text style={{ color: '#d9d9d9' }}>
            <strong>Bairro:</strong> {pedido.bairro}
          </Text>

          {!!pedido.referencia && (
            <Text style={{ color: '#d9d9d9' }}>
              <strong>Referência:</strong> {pedido.referencia}
            </Text>
          )}

          <Text style={{ color: '#d9d9d9' }}>
            <ShopOutlined /> <strong>Canal:</strong> {pedido.canal}
          </Text>

          <Text style={{ color: '#d9d9d9' }}>
            <WalletOutlined /> <strong>Pagamento:</strong> {pedido.pagamento}
          </Text>

          {pedido.pagamento === 'Dinheiro' && (
            <>
              <Text style={{ color: '#d9d9d9' }}>
                <strong>Troco para:</strong> {formatCurrency(pedido.trocoPara)}
              </Text>
              <Text style={{ color: '#d9d9d9' }}>
                <strong>Troco:</strong> {formatCurrency(troco)}
              </Text>
            </>
          )}

          <Text style={{ color: '#d9d9d9' }}>
            <strong>Entregador:</strong> {pedido.entregador || '-'}
          </Text>

          <Text style={{ color: '#d9d9d9' }}>
            <strong>Previsão:</strong> {pedido.previsaoEntrega}
          </Text>

          <Space size={6}>
            <ClockCircleOutlined style={{ color: tempoCor }} />
            <Text style={{ color: tempoCor, fontWeight: 700 }}>
              {pedido.tempoMin} min
            </Text>
            {atrasado && <Tag color="error">Atrasado</Tag>}
          </Space>
        </Space>

        {!!pedido.observacao && (
          <>
            <Divider style={{ borderColor: '#262626', margin: '12px 0' }} />
            <Text style={{ color: '#faad14' }}>
              <strong>Obs.:</strong> {pedido.observacao}
            </Text>
          </>
        )}

        <Divider style={{ borderColor: '#262626', margin: '12px 0' }} />

        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          {pedido.itens.map((item) => (
            <div
              key={item.id}
              style={{
                padding: 10,
                background: '#111111',
                borderRadius: 10,
                border: '1px solid #262626',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 600 }}>
                  {item.qtd}x {item.nome}
                </Text>
                <Text style={{ color: '#fff' }}>
                  {formatCurrency(item.qtd * item.valor)}
                </Text>
              </div>
            </div>
          ))}
        </Space>

        <Divider style={{ borderColor: '#262626', margin: '16px 0 12px' }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#bfbfbf' }}>Total</Text>
          <Text style={{ color: '#fff', fontWeight: 700 }}>
            {formatCurrency(pedido.valorTotal)}
          </Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          {pedido.status === STATUS_DELIVERY.RECEBIDO && (
            <Button type="primary" block onClick={() => iniciarPreparo(pedido.id)}>
              Iniciar preparo
            </Button>
          )}

          {pedido.status === STATUS_DELIVERY.PREPARANDO && (
            <Button
              type="primary"
              block
              icon={<CarOutlined />}
              onClick={() => despacharPedido(pedido.id)}
            >
              {pedido.origem === TIPO_ENTREGA.RETIRADA
                ? 'Liberar retirada'
                : 'Despachar pedido'}
            </Button>
          )}

          {pedido.status === STATUS_DELIVERY.ROTA && (
            <>
              <Button
                type="primary"
                block
                icon={<CheckCircleOutlined />}
                onClick={() => marcarEntregue(pedido.id)}
              >
                {pedido.origem === TIPO_ENTREGA.RETIRADA
                  ? 'Marcar retirado'
                  : 'Marcar entregue'}
              </Button>

              <Button
                block
                icon={<UserOutlined />}
                onClick={() => chamarEntregador(pedido)}
              >
                {pedido.origem === TIPO_ENTREGA.RETIRADA
                  ? 'Chamar cliente'
                  : 'Chamar entregador'}
              </Button>
            </>
          )}

          {pedido.status !== STATUS_DELIVERY.ROTA &&
            pedido.status !== STATUS_DELIVERY.ENTREGUE && (
              <Button
                block
                icon={<UserOutlined />}
                onClick={() => chamarEntregador(pedido)}
              >
                {pedido.origem === TIPO_ENTREGA.RETIRADA
                  ? 'Avisar retirada'
                  : 'Acionar entrega'}
              </Button>
            )}

          {pedido.status !== STATUS_DELIVERY.RECEBIDO && (
            <Button block icon={<UndoOutlined />} onClick={() => voltarEtapa(pedido)}>
              Voltar etapa
            </Button>
          )}
        </Space>
      </Card>
    )
  }

  const renderColuna = (titulo, pedidosColuna, corTopo) => {
    const tagColor =
      corTopo === '#1677ff'
        ? 'processing'
        : corTopo === '#faad14'
        ? 'warning'
        : corTopo === '#13c2c2'
        ? 'cyan'
        : 'success'

    return (
      <Card
        bordered={false}
        style={{ height: '100%' }}
        styles={{ body: { padding: 14 } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `2px solid ${corTopo}`,
          }}
        >
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            {titulo}
          </Title>

          <Tag color={tagColor}>{pedidosColuna.length}</Tag>
        </div>

        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {pedidosColuna.length ? (
            pedidosColuna.map((pedido) => renderPedidoCard(pedido))
          ) : (
            <Card
              bordered={false}
              style={{
                background: '#141414',
                border: '1px dashed #303030',
              }}
            >
              <Empty description="Nenhum pedido aqui" />
            </Card>
          )}
        </Space>
      </Card>
    )
  }

  const itemsTabs = [
    {
      key: 'pedidos',
      label: (
        <span>
          <CarOutlined /> Pedidos
        </span>
      ),
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 4 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false}>
                <Statistic title="Pedidos delivery" value={resumo.total} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false}>
                <Statistic title="Recebidos" value={resumo.recebidos} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false}>
                <Statistic title="Em rota" value={resumo.rota} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false}>
                <Statistic title="Atrasados" value={resumo.atrasados} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <Card bordered={false}>
                <Statistic title="Delivery" value={resumo.delivery} />
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card bordered={false}>
                <Statistic title="Retirada" value={resumo.retirada} />
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#bfbfbf' }}>Som ativo</Text>
                  <Switch checked={somAtivo} onChange={setSomAtivo} />
                </div>
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={10} xl={8}>
                <Input
                  allowClear
                  size="large"
                  placeholder="Buscar por pedido, cliente, telefone, endereço ou item"
                  prefix={<SearchOutlined />}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </Col>

              <Col xs={24} md={7} xl={5}>
                <Select
                  size="large"
                  style={{ width: '100%' }}
                  value={filtroPrioridade}
                  onChange={setFiltroPrioridade}
                  options={[
                    { label: 'Todas as prioridades', value: 'todas' },
                    { label: 'Alta prioridade', value: 'alta' },
                    { label: 'Normal', value: 'normal' },
                  ]}
                />
              </Col>

              <Col xs={24} md={7} xl={5}>
                <Select
                  size="large"
                  style={{ width: '100%' }}
                  value={filtroOrigem}
                  onChange={setFiltroOrigem}
                  options={[
                    { label: 'Todos os tipos', value: 'todas' },
                    { label: 'Delivery', value: TIPO_ENTREGA.DELIVERY },
                    { label: 'Retirada', value: TIPO_ENTREGA.RETIRADA },
                  ]}
                />
              </Col>

              <Col xs={24} xl={6}>
                <Button block size="large" icon={<BellOutlined />} onClick={tocarAlerta}>
                  Testar alerta
                </Button>
              </Col>
            </Row>

            <Divider style={{ borderColor: '#262626' }} />

            <Space wrap>
              <Segmented
                options={[
                  {
                    label: (
                      <span>
                        <FilterOutlined /> Todos
                      </span>
                    ),
                    value: 'todos',
                  },
                  {
                    label: 'Atrasados',
                    value: 'atrasados',
                  },
                ]}
                value={mostrarApenasAtrasados ? 'atrasados' : 'todos'}
                onChange={(value) => setMostrarApenasAtrasados(value === 'atrasados')}
              />

              <Switch checked={mostrarEntregues} onChange={setMostrarEntregues} />
              <Text style={{ color: '#bfbfbf' }}>Mostrar entregues</Text>

              <Tag color="red">25+ min = atrasado</Tag>
              <Tag color="orange">15 a 24 min = atenção</Tag>
              <Tag color="green">0 a 14 min = dentro do prazo</Tag>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setTabAtiva('novoPedido')}
              >
                Novo pedido
              </Button>
            </Space>
          </Card>

          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} xl={6}>
              {renderColuna('Recebidos', pedidosRecebidos, '#1677ff')}
            </Col>

            <Col xs={24} xl={6}>
              {renderColuna('Preparando', pedidosPreparando, '#faad14')}
            </Col>

            <Col xs={24} xl={6}>
              {renderColuna('Em rota', pedidosRota, '#13c2c2')}
            </Col>

            <Col xs={24} xl={6}>
              {renderColuna('Entregues', pedidosEntregues, '#52c41a')}
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'novoPedido',
      label: (
        <span>
          <PlusOutlined /> Novo pedido
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card bordered={false} title="Cadastro do pedido">
              <Form
                form={formPedido}
                layout="vertical"
                initialValues={{
                  origem: TIPO_ENTREGA.DELIVERY,
                  prioridade: 'normal',
                  pagamento: 'PIX',
                  canal: 'WhatsApp',
                }}
              >
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Cliente já cadastrado" name="clienteId">
                      <Select
                        allowClear
                        placeholder="Selecionar cliente"
                        options={clientesMaisRecentes.map((item) => ({
                          label: `${item.nome} • ${item.telefone}`,
                          value: item.id,
                        }))}
                        onChange={(value) => {
                          if (!value) {
                            setClienteSelecionadoId(null)
                            return
                          }
                          selecionarCliente(value)
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space style={{ width: '100%', marginTop: 30 }}>
                      <Button onClick={() => setModalClienteOpen(true)}>
                        Novo cliente
                      </Button>
                    </Space>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Tipo"
                      name="origem"
                      rules={[{ required: true, message: 'Selecione o tipo' }]}
                    >
                      <Select
                        options={[
                          { label: 'Delivery', value: TIPO_ENTREGA.DELIVERY },
                          { label: 'Retirada', value: TIPO_ENTREGA.RETIRADA },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Canal"
                      name="canal"
                      rules={[{ required: true, message: 'Selecione o canal' }]}
                    >
                      <Select
                        options={[
                          { label: 'WhatsApp', value: 'WhatsApp' },
                          { label: 'Telefone', value: 'Telefone' },
                          { label: 'iFood', value: 'iFood' },
                          { label: 'Balcão', value: 'Balcão' },
                          { label: 'App próprio', value: 'App próprio' },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Prioridade"
                      name="prioridade"
                      rules={[{ required: true, message: 'Selecione a prioridade' }]}
                    >
                      <Select
                        options={[
                          { label: 'Normal', value: 'normal' },
                          { label: 'Alta', value: 'alta' },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Cliente"
                      name="cliente"
                      rules={[{ required: true, message: 'Informe o cliente' }]}
                    >
                      <Input placeholder="Nome do cliente" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Telefone"
                      name="telefone"
                      rules={[{ required: true, message: 'Informe o telefone' }]}
                    >
                      <Input placeholder="Telefone" />
                    </Form.Item>
                  </Col>

                  {origemPedido === TIPO_ENTREGA.DELIVERY && (
                    <>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Endereço"
                          name="endereco"
                          rules={[{ required: true, message: 'Informe o endereço' }]}
                        >
                          <Input placeholder="Rua, número..." />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Bairro"
                          name="bairro"
                          rules={[{ required: true, message: 'Informe o bairro' }]}
                        >
                          <Input placeholder="Bairro" />
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <Form.Item label="Referência" name="referencia">
                          <Input placeholder="Casa azul, esquina, perto da praça..." />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  <Col xs={24} md={6}>
                    <Form.Item
                      label="Pagamento"
                      name="pagamento"
                      rules={[{ required: true, message: 'Selecione o pagamento' }]}
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
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item
                      label="Previsão"
                      name="previsaoEntrega"
                      rules={[{ required: true, message: 'Informe a previsão' }]}
                    >
                      <Input placeholder="Ex.: 20:10" />
                    </Form.Item>
                  </Col>

                  {pagamentoPedido === 'Dinheiro' && (
                    <Col xs={24} md={6}>
                      <Form.Item
                        label="Troco para"
                        name="trocoPara"
                        rules={[{ required: true, message: 'Informe o valor do troco' }]}
                      >
                        <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  )}

                  <Col xs={24}>
                    <Form.Item label="Observação" name="observacao">
                      <TextArea rows={3} placeholder="Ex.: sem cebola, tocar campainha..." />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Card bordered={false} title="Itens do pedido">
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Select
                  placeholder="Selecionar produto"
                  value={produtoSelecionadoId}
                  onChange={setProdutoSelecionadoId}
                  options={produtosMock.map((item) => ({
                    label: `${item.nome} • ${formatCurrency(item.preco)}`,
                    value: item.id,
                  }))}
                />

                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  value={quantidadeProduto}
                  onChange={(value) => setQuantidadeProduto(value || 1)}
                  placeholder="Quantidade"
                />

                <Button type="primary" block onClick={adicionarItemPedido}>
                  Adicionar item
                </Button>

                <Divider style={{ borderColor: '#262626', margin: '8px 0' }} />

                <List
                  locale={{ emptyText: 'Nenhum item adicionado' }}
                  dataSource={itensNovoPedido}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Popconfirm
                          key="remove"
                          title="Remover item?"
                          onConfirm={() => removerItemPedido(item.id)}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />}>
                            Remover
                          </Button>
                        </Popconfirm>,
                      ]}
                    >
                      <div style={{ width: '100%' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <Text style={{ color: '#f5f5f5' }}>
                            {item.qtd}x {item.nome}
                          </Text>
                          <Text style={{ color: '#fff', fontWeight: 700 }}>
                            {formatCurrency(item.qtd * item.valor)}
                          </Text>
                        </div>

                        <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                          Unitário: {formatCurrency(item.valor)}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />

                <Divider style={{ borderColor: '#262626', margin: '8px 0' }} />

                <Card
                  size="small"
                  style={{
                    background: '#141414',
                    border: '1px solid #262626',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#bfbfbf' }}>Total do pedido</Text>
                      <Text style={{ color: '#fff', fontWeight: 700 }}>
                        {formatCurrency(totalNovoPedido)}
                      </Text>
                    </div>

                    {pagamentoPedido === 'Dinheiro' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#bfbfbf' }}>Troco para</Text>
                          <Text style={{ color: '#fff' }}>
                            {formatCurrency(trocoParaPedido || 0)}
                          </Text>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#bfbfbf' }}>Troco estimado</Text>
                          <Text style={{ color: '#fff', fontWeight: 700 }}>
                            {formatCurrency(trocoEstimadoNovoPedido)}
                          </Text>
                        </div>
                      </>
                    )}
                  </Space>
                </Card>

                <Button type="primary" size="large" block onClick={salvarNovoPedido}>
                  Salvar pedido
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'clientes',
      label: (
        <span>
          <UserOutlined /> Clientes
        </span>
      ),
      children: (
        <Card
          bordered={false}
          title="Clientes do delivery"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalClienteOpen(true)}>
              Novo cliente
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={clientesColumns}
            dataSource={clientes}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      ),
    },
    {
      key: 'entregadores',
      label: (
        <span>
          <TeamOutlined /> Entregadores
        </span>
      ),
      children: (
        <Card
          bordered={false}
          title="Equipe de entrega"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalEntregadorOpen(true)}
            >
              Novo entregador
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={entregadoresColumns}
            dataSource={entregadores}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      ),
    },
  ]

  return (
    <>
      <PageTitle
        title="Delivery"
        subtitle="Cadastro, acompanhamento de pedidos, clientes e entregadores"
      />

      <Card bordered={false}>
        <Tabs activeKey={tabAtiva} onChange={setTabAtiva} items={itemsTabs} />
      </Card>

      <Modal
        title="Novo cliente"
        open={modalClienteOpen}
        onCancel={() => setModalClienteOpen(false)}
        onOk={salvarNovoCliente}
        okText="Salvar cliente"
        cancelText="Cancelar"
      >
        <Form form={formCliente} layout="vertical">
          <Form.Item
            label="Nome"
            name="nome"
            rules={[{ required: true, message: 'Informe o nome' }]}
          >
            <Input placeholder="Nome do cliente" />
          </Form.Item>

          <Form.Item
            label="Telefone"
            name="telefone"
            rules={[{ required: true, message: 'Informe o telefone' }]}
          >
            <Input placeholder="Telefone" />
          </Form.Item>

          <Form.Item
            label="Endereço"
            name="endereco"
            rules={[{ required: true, message: 'Informe o endereço' }]}
          >
            <Input placeholder="Rua, número..." />
          </Form.Item>

          <Form.Item
            label="Bairro"
            name="bairro"
            rules={[{ required: true, message: 'Informe o bairro' }]}
          >
            <Input placeholder="Bairro" />
          </Form.Item>

          <Form.Item label="Referência" name="referencia">
            <Input placeholder="Referência" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Novo entregador"
        open={modalEntregadorOpen}
        onCancel={() => setModalEntregadorOpen(false)}
        onOk={salvarNovoEntregador}
        okText="Salvar entregador"
        cancelText="Cancelar"
      >
        <Form form={formEntregador} layout="vertical">
          <Form.Item
            label="Nome"
            name="nome"
            rules={[{ required: true, message: 'Informe o nome' }]}
          >
            <Input placeholder="Nome do entregador" />
          </Form.Item>

          <Form.Item
            label="Telefone"
            name="telefone"
            rules={[{ required: true, message: 'Informe o telefone' }]}
          >
            <Input placeholder="Telefone" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}