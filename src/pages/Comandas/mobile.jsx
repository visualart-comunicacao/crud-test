import { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
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

const { Title, Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

const STATUS_COMANDA = {
  LIVRE: 'livre',
  ABERTA: 'aberta',
  PREPARO: 'preparo',
  PRONTA: 'pronta',
  FECHAMENTO: 'fechamento',
  FINALIZADA: 'finalizada',
}

const STATUS_ITEM = {
  LANCADO: 'lancado',
  ENVIADO_COZINHA: 'enviado_cozinha',
  EM_PREPARO: 'em_preparo',
  PRONTO: 'pronto',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado',
}

const produtosMock = [
  {
    id: 1,
    categoria: 'Espetos',
    nome: 'Espeto de Carne',
    preco: 12,
    adicionais: ['Pimenta', 'Farofa extra', 'Sem cebola'],
  },
  {
    id: 2,
    categoria: 'Espetos',
    nome: 'Espeto de Frango',
    preco: 11,
    adicionais: ['Molho especial', 'Pimenta', 'Sem alho'],
  },
  {
    id: 3,
    categoria: 'Espetos',
    nome: 'Espeto Medalhão',
    preco: 15,
    adicionais: ['Molho barbecue', 'Farofa extra'],
  },
  {
    id: 4,
    categoria: 'Porções',
    nome: 'Porção de Fritas',
    preco: 18.9,
    adicionais: ['Cheddar', 'Bacon', 'Sem sal'],
  },
  {
    id: 5,
    categoria: 'Porções',
    nome: 'Linguiça Acebolada',
    preco: 22,
    adicionais: ['Mais cebola', 'Sem cebola'],
  },
  {
    id: 6,
    categoria: 'Bebidas',
    nome: 'Coca-Cola 600ml',
    preco: 7.5,
    adicionais: ['Com gelo', 'Sem gelo'],
  },
  {
    id: 7,
    categoria: 'Bebidas',
    nome: 'Heineken 600ml',
    preco: 16.5,
    adicionais: ['Balde com gelo'],
  },
  {
    id: 8,
    categoria: 'Bebidas',
    nome: 'Suco Natural',
    preco: 9,
    adicionais: ['Sem açúcar', 'Com açúcar', 'Mais gelo'],
  },
  {
    id: 9,
    categoria: 'Acompanhamentos',
    nome: 'Farofa Especial',
    preco: 12,
    adicionais: ['Sem bacon'],
  },
  {
    id: 10,
    categoria: 'Acompanhamentos',
    nome: 'Vinagrete',
    preco: 5,
    adicionais: ['Sem cebola'],
  },
  {
    id: 11,
    categoria: 'Entradas',
    nome: 'Pão de Alho',
    preco: 8.5,
    adicionais: ['Com queijo extra'],
  },
]

const comandasIniciais = [
  {
    id: 1,
    mesa: '01',
    cliente: 'Carlos',
    pessoas: 2,
    status: STATUS_COMANDA.ABERTA,
    total: 50.4,
    criadaEm: '19:02',
    ultimaAtualizacao: '19:02',
    garcom: 'João',
    tipoAtendimento: 'salao',
    itens: [
      {
        id: 1,
        produtoId: 1,
        nome: 'Espeto de Carne',
        qtd: 2,
        valor: 12,
        adicionais: ['Pimenta'],
        observacao: '',
        statusItem: STATUS_ITEM.LANCADO,
      },
      {
        id: 2,
        produtoId: 6,
        nome: 'Coca-Cola 600ml',
        qtd: 1,
        valor: 7.5,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.LANCADO,
      },
      {
        id: 3,
        produtoId: 10,
        nome: 'Vinagrete',
        qtd: 2,
        valor: 5,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.LANCADO,
      },
    ],
  },
  {
    id: 2,
    mesa: '02',
    cliente: 'Fernanda',
    pessoas: 4,
    status: STATUS_COMANDA.PREPARO,
    total: 87,
    criadaEm: '19:15',
    ultimaAtualizacao: '19:19',
    garcom: 'Marcos',
    tipoAtendimento: 'salao',
    itens: [
      {
        id: 1,
        produtoId: 2,
        nome: 'Espeto de Frango',
        qtd: 4,
        valor: 11,
        adicionais: ['Molho especial'],
        observacao: '',
        statusItem: STATUS_ITEM.EM_PREPARO,
      },
      {
        id: 2,
        produtoId: 8,
        nome: 'Suco Natural',
        qtd: 2,
        valor: 9,
        adicionais: ['Sem açúcar'],
        observacao: '',
        statusItem: STATUS_ITEM.LANCADO,
      },
      {
        id: 3,
        produtoId: 9,
        nome: 'Farofa Especial',
        qtd: 2,
        valor: 12,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.LANCADO,
      },
    ],
  },
  {
    id: 3,
    mesa: '03',
    cliente: 'Juliana',
    pessoas: 3,
    status: STATUS_COMANDA.PRONTA,
    total: 58.5,
    criadaEm: '19:21',
    ultimaAtualizacao: '19:33',
    garcom: 'Lucas',
    tipoAtendimento: 'salao',
    itens: [
      {
        id: 1,
        produtoId: 3,
        nome: 'Espeto Medalhão',
        qtd: 3,
        valor: 15,
        adicionais: ['Molho barbecue'],
        observacao: '',
        statusItem: STATUS_ITEM.PRONTO,
      },
      {
        id: 2,
        produtoId: 10,
        nome: 'Vinagrete',
        qtd: 1,
        valor: 5,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.PRONTO,
      },
      {
        id: 3,
        produtoId: 11,
        nome: 'Pão de Alho',
        qtd: 1,
        valor: 8.5,
        adicionais: ['Com queijo extra'],
        observacao: 'Mandar primeiro',
        statusItem: STATUS_ITEM.PRONTO,
      },
    ],
  },
  {
    id: 4,
    mesa: '04',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
  {
    id: 5,
    mesa: '05',
    cliente: 'Roberto',
    pessoas: 5,
    status: STATUS_COMANDA.FECHAMENTO,
    total: 101.5,
    criadaEm: '18:58',
    ultimaAtualizacao: '19:40',
    garcom: 'João',
    tipoAtendimento: 'salao',
    itens: [
      {
        id: 1,
        produtoId: 5,
        nome: 'Linguiça Acebolada',
        qtd: 2,
        valor: 22,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.ENTREGUE,
      },
      {
        id: 2,
        produtoId: 7,
        nome: 'Heineken 600ml',
        qtd: 3,
        valor: 16.5,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.ENTREGUE,
      },
      {
        id: 3,
        produtoId: 10,
        nome: 'Vinagrete',
        qtd: 1,
        valor: 5,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.ENTREGUE,
      },
      {
        id: 4,
        produtoId: 11,
        nome: 'Pão de Alho',
        qtd: 1,
        valor: 8.5,
        adicionais: [],
        observacao: '',
        statusItem: STATUS_ITEM.ENTREGUE,
      },
    ],
  },
  {
    id: 6,
    mesa: '06',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
  {
    id: 7,
    mesa: '07',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
  {
    id: 8,
    mesa: '08',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
  {
    id: 9,
    mesa: '09',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
  {
    id: 10,
    mesa: '10',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
  {
    id: 11,
    mesa: '11',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
  {
    id: 12,
    mesa: '12',
    cliente: '',
    pessoas: 0,
    status: STATUS_COMANDA.LIVRE,
    total: 0,
    criadaEm: '',
    ultimaAtualizacao: '',
    garcom: '',
    tipoAtendimento: '',
    itens: [],
  },
]

const statusConfig = {
  [STATUS_COMANDA.LIVRE]: {
    label: 'Livre',
    color: 'default',
    borderColor: '#9e9e9e',
    bg: '#8c8c8c',
    badge: 'default',
  },
  [STATUS_COMANDA.ABERTA]: {
    label: 'Aberta',
    color: 'warning',
    borderColor: '#faad14',
    bg: '#faad14',
    badge: 'warning',
  },
  [STATUS_COMANDA.PREPARO]: {
    label: 'Em preparo',
    color: 'orange',
    borderColor: '#d48806',
    bg: '#d48806',
    badge: 'warning',
  },
  [STATUS_COMANDA.PRONTA]: {
    label: 'Pronta',
    color: 'success',
    borderColor: '#389e0d',
    bg: '#389e0d',
    badge: 'success',
  },
  [STATUS_COMANDA.FECHAMENTO]: {
    label: 'Fechamento',
    color: 'error',
    borderColor: '#cf1322',
    bg: '#cf1322',
    badge: 'error',
  },
  [STATUS_COMANDA.FINALIZADA]: {
    label: 'Finalizada',
    color: 'default',
    borderColor: '#434343',
    bg: '#434343',
    badge: 'default',
  },
}

const etapasStatus = [
  STATUS_COMANDA.ABERTA,
  STATUS_COMANDA.PREPARO,
  STATUS_COMANDA.PRONTA,
  STATUS_COMANDA.FECHAMENTO,
]

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function calcularTotal(itens) {
  return itens.reduce((acc, item) => acc + Number(item.qtd) * Number(item.valor), 0)
}

function gerarHorarioAtual() {
  const agora = new Date()
  const horas = String(agora.getHours()).padStart(2, '0')
  const minutos = String(agora.getMinutes()).padStart(2, '0')
  return `${horas}:${minutos}`
}

function getStatusItemTag(statusItem) {
  const map = {
    [STATUS_ITEM.LANCADO]: { color: 'default', label: 'Lançado' },
    [STATUS_ITEM.ENVIADO_COZINHA]: { color: 'processing', label: 'Enviado' },
    [STATUS_ITEM.EM_PREPARO]: { color: 'warning', label: 'Em preparo' },
    [STATUS_ITEM.PRONTO]: { color: 'success', label: 'Pronto' },
    [STATUS_ITEM.ENTREGUE]: { color: 'cyan', label: 'Entregue' },
    [STATUS_ITEM.CANCELADO]: { color: 'error', label: 'Cancelado' },
  }

  return map[statusItem] || { color: 'default', label: statusItem }
}

function MesaButton({ comanda, onClick }) {
  const status = statusConfig[comanda.status]

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
        padding: livre ? '10px 8px' : '10px 8px 8px',
        cursor: 'pointer',
        boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
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
        {comanda.mesa}
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
            {comanda.cliente || 'Sem nome'}
          </div>

          <div style={{ fontSize: 10, marginTop: 6 }}>
            {formatCurrency(comanda.total)}
          </div>

          <div style={{ fontSize: 10, opacity: 0.95 }}>
            {comanda.ultimaAtualizacao || '--:--'}
          </div>
        </>
      )}
    </button>
  )
}

export default function ComandasMobile() {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [comandas, setComandas] = useState(comandasIniciais)
  const [view, setView] = useState('lista')
  const [busca, setBusca] = useState('')

  const primeiraAtiva =
    comandas.find((item) => item.status !== STATUS_COMANDA.LIVRE) || null

  const [comandaSelecionadaId, setComandaSelecionadaId] = useState(
    primeiraAtiva?.id || null
  )

  const [drawerNovaComandaOpen, setDrawerNovaComandaOpen] = useState(false)
  const [drawerAdicionarItemOpen, setDrawerAdicionarItemOpen] = useState(false)
  const [modalEditarItemOpen, setModalEditarItemOpen] = useState(false)
  const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false)
  const [modalFechamentoOpen, setModalFechamentoOpen] = useState(false)

  const [itemEditando, setItemEditando] = useState(null)

  const [formNovaComanda] = Form.useForm()
  const [formAdicionarItem] = Form.useForm()
  const [formEditarItem] = Form.useForm()
  const [formTransferencia] = Form.useForm()
  const [formFechamento] = Form.useForm()

  const comandaSelecionada =
    comandas.find((item) => item.id === comandaSelecionadaId) || null

  const produtosPorCategoria = useMemo(() => {
    return produtosMock.reduce((acc, produto) => {
      if (!acc[produto.categoria]) acc[produto.categoria] = []
      acc[produto.categoria].push(produto)
      return acc
    }, {})
  }, [])

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
        comanda.mesa.toLowerCase().includes(texto) ||
        (comanda.cliente || '').toLowerCase().includes(texto) ||
        String(comanda.id).includes(texto) ||
        (comanda.garcom || '').toLowerCase().includes(texto)
      )
    })
  }, [comandas, busca])

  const comandasLivresFiltradas = useMemo(() => {
    const texto = busca.toLowerCase().trim()

    return comandas.filter((comanda) => {
      if (comanda.status !== STATUS_COMANDA.LIVRE) return false
      return comanda.mesa.toLowerCase().includes(texto)
    })
  }, [comandas, busca])

  const mesasLivres = useMemo(() => {
    return comandas.filter((item) => item.status === STATUS_COMANDA.LIVRE)
  }, [comandas])

  const produtoSelecionadoId = Form.useWatch('produtoId', formAdicionarItem)
  const produtoSelecionado = produtosMock.find(
    (produto) => produto.id === produtoSelecionadoId
  )

  const produtoEditandoSelecionadoId = Form.useWatch('produtoId', formEditarItem)
  const produtoEditandoSelecionado = produtosMock.find(
    (produto) => produto.id === produtoEditandoSelecionadoId
  )

  const pagamentoFechamento = Form.useWatch('pagamento', formFechamento)
  const valorRecebidoFechamento = Form.useWatch('valorRecebido', formFechamento)

  const totalSelecionado = Number(comandaSelecionada?.total || 0)
  const trocoFechamento =
    pagamentoFechamento === 'Dinheiro'
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

      const mesaExistente = comandas.find((item) => item.mesa === values.mesa)
      if (!mesaExistente) {
        message.error('Mesa não encontrada')
        return
      }

      if (mesaExistente.status !== STATUS_COMANDA.LIVRE) {
        message.error('Essa mesa já está ocupada')
        return
      }

      const novoId = Math.max(...comandas.map((item) => Number(item.id)), 0) + 1
      const horario = gerarHorarioAtual()

      setComandas((prev) =>
        prev.map((item) =>
          item.mesa === values.mesa
            ? {
                ...item,
                id: novoId,
                cliente: values.cliente || 'Mesa sem identificação',
                pessoas: values.pessoas,
                status: STATUS_COMANDA.ABERTA,
                criadaEm: horario,
                ultimaAtualizacao: horario,
                garcom: values.garcom,
                tipoAtendimento: values.tipoAtendimento,
                itens: [],
                total: 0,
              }
            : item
        )
      )

      setComandaSelecionadaId(novoId)
      setDrawerNovaComandaOpen(false)
      setView('detalhe')
      message.success('Comanda aberta com sucesso')
    } catch {}
  }

  const abrirAdicionarItem = () => {
    if (!comandaSelecionada || comandaSelecionada.status === STATUS_COMANDA.LIVRE) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    formAdicionarItem.resetFields()
    formAdicionarItem.setFieldsValue({
      qtd: 1,
      adicionais: [],
      observacao: '',
    })
    setDrawerAdicionarItemOpen(true)
  }

  const salvarNovoItem = async () => {
    try {
      const values = await formAdicionarItem.validateFields()
      const produto = produtosMock.find((item) => item.id === values.produtoId)

      if (!produto || !comandaSelecionada) return

      const novoItem = {
        id: Date.now(),
        produtoId: produto.id,
        nome: produto.nome,
        qtd: values.qtd,
        valor: produto.preco,
        adicionais: values.adicionais || [],
        observacao: values.observacao || '',
        statusItem: STATUS_ITEM.LANCADO,
      }

      setComandas((prev) =>
        prev.map((item) => {
          if (item.id !== comandaSelecionada.id) return item

          const novosItens = [...item.itens, novoItem]

          return {
            ...item,
            itens: novosItens,
            total: calcularTotal(novosItens),
            ultimaAtualizacao: gerarHorarioAtual(),
          }
        })
      )

      setDrawerAdicionarItemOpen(false)
      message.success('Item adicionado à comanda')
    } catch {}
  }

  const abrirEditarItem = (item) => {
    if (!comandaSelecionada) return

    setItemEditando(item)

    const produtoOriginal = produtosMock.find((p) => p.id === item.produtoId)

    formEditarItem.resetFields()
    formEditarItem.setFieldsValue({
      categoria: produtoOriginal?.categoria,
      produtoId: item.produtoId,
      qtd: item.qtd,
      adicionais: item.adicionais || [],
      observacao: item.observacao || '',
      statusItem: item.statusItem,
    })

    setModalEditarItemOpen(true)
  }

  const salvarEdicaoItem = async () => {
    try {
      const values = await formEditarItem.validateFields()
      if (!comandaSelecionada || !itemEditando) return

      const produto = produtosMock.find((item) => item.id === values.produtoId)
      if (!produto) return

      setComandas((prev) =>
        prev.map((comanda) => {
          if (comanda.id !== comandaSelecionada.id) return comanda

          const novosItens = comanda.itens.map((item) =>
            item.id === itemEditando.id
              ? {
                  ...item,
                  produtoId: produto.id,
                  nome: produto.nome,
                  qtd: values.qtd,
                  valor: produto.preco,
                  adicionais: values.adicionais || [],
                  observacao: values.observacao || '',
                  statusItem: values.statusItem,
                }
              : item
          )

          return {
            ...comanda,
            itens: novosItens,
            total: calcularTotal(novosItens),
            ultimaAtualizacao: gerarHorarioAtual(),
          }
        })
      )

      setItemEditando(null)
      setModalEditarItemOpen(false)
      message.success('Item atualizado com sucesso')
    } catch {}
  }

  const removerItem = (itemId) => {
    if (!comandaSelecionada) return

    setComandas((prev) =>
      prev.map((item) => {
        if (item.id !== comandaSelecionada.id) return item

        const novosItens = item.itens.filter((i) => i.id !== itemId)

        return {
          ...item,
          itens: novosItens,
          total: calcularTotal(novosItens),
          ultimaAtualizacao: gerarHorarioAtual(),
        }
      })
    )

    message.success('Item removido')
  }

  const enviarParaCozinha = () => {
    if (!comandaSelecionada) return

    if (!comandaSelecionada.itens.length) {
      message.warning('Adicione itens antes de enviar para a cozinha')
      return
    }

    setComandas((prev) =>
      prev.map((item) => {
        if (item.id !== comandaSelecionada.id) return item

        return {
          ...item,
          status: STATUS_COMANDA.PREPARO,
          ultimaAtualizacao: gerarHorarioAtual(),
          itens: item.itens.map((produto) =>
            produto.statusItem === STATUS_ITEM.LANCADO
              ? { ...produto, statusItem: STATUS_ITEM.ENVIADO_COZINHA }
              : produto
          ),
        }
      })
    )

    message.success('Pedido enviado para a cozinha')
  }

  const avancarStatus = () => {
    if (!comandaSelecionada) return
    if (comandaSelecionada.status === STATUS_COMANDA.LIVRE) return

    const indice = etapasStatus.indexOf(comandaSelecionada.status)
    if (indice === -1 || indice === etapasStatus.length - 1) {
      message.info('Essa comanda já está na última etapa operacional')
      return
    }

    const novoStatus = etapasStatus[indice + 1]

    setComandas((prev) =>
      prev.map((item) => {
        if (item.id !== comandaSelecionada.id) return item

        let itensAtualizados = item.itens

        if (novoStatus === STATUS_COMANDA.PREPARO) {
          itensAtualizados = item.itens.map((produto) => ({
            ...produto,
            statusItem:
              produto.statusItem === STATUS_ITEM.LANCADO
                ? STATUS_ITEM.EM_PREPARO
                : produto.statusItem,
          }))
        }

        if (novoStatus === STATUS_COMANDA.PRONTA) {
          itensAtualizados = item.itens.map((produto) => ({
            ...produto,
            statusItem:
              produto.statusItem === STATUS_ITEM.EM_PREPARO ||
              produto.statusItem === STATUS_ITEM.ENVIADO_COZINHA
                ? STATUS_ITEM.PRONTO
                : produto.statusItem,
          }))
        }

        if (novoStatus === STATUS_COMANDA.FECHAMENTO) {
          itensAtualizados = item.itens.map((produto) => ({
            ...produto,
            statusItem:
              produto.statusItem === STATUS_ITEM.PRONTO
                ? STATUS_ITEM.ENTREGUE
                : produto.statusItem,
          }))
        }

        return {
          ...item,
          status: novoStatus,
          ultimaAtualizacao: gerarHorarioAtual(),
          itens: itensAtualizados,
        }
      })
    )

    message.success('Status atualizado com sucesso')
  }

  const abrirTransferencia = () => {
    if (!comandaSelecionada || comandaSelecionada.status === STATUS_COMANDA.LIVRE) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    formTransferencia.resetFields()
    setModalTransferenciaOpen(true)
  }

  const confirmarTransferencia = async () => {
    try {
      const values = await formTransferencia.validateFields()
      if (!comandaSelecionada) return

      const destino = comandas.find((item) => item.mesa === values.novaMesa)

      if (!destino) {
        message.error('Mesa de destino não encontrada')
        return
      }

      if (destino.status !== STATUS_COMANDA.LIVRE) {
        message.error('A mesa de destino já está ocupada')
        return
      }

      const mesaAtual = comandaSelecionada.mesa
      const horario = gerarHorarioAtual()

      setComandas((prev) =>
        prev.map((item) => {
          if (item.id === comandaSelecionada.id) {
            return {
              ...item,
              mesa: values.novaMesa,
              ultimaAtualizacao: horario,
            }
          }

          if (item.mesa === values.novaMesa && item.status === STATUS_COMANDA.LIVRE) {
            return {
              ...item,
              mesa: mesaAtual,
              cliente: '',
              pessoas: 0,
              status: STATUS_COMANDA.LIVRE,
              total: 0,
              criadaEm: '',
              ultimaAtualizacao: '',
              garcom: '',
              tipoAtendimento: '',
              itens: [],
            }
          }

          return item
        })
      )

      setModalTransferenciaOpen(false)
      message.success('Mesa transferida com sucesso')
    } catch {}
  }

  const abrirFechamento = () => {
    if (!comandaSelecionada || comandaSelecionada.status === STATUS_COMANDA.LIVRE) {
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
    })
    setModalFechamentoOpen(true)
  }

  const confirmarFechamento = async () => {
    try {
      const values = await formFechamento.validateFields()
      if (!comandaSelecionada) return

      const total = Number(comandaSelecionada.total)
      const valorRecebido = Number(values.valorRecebido || 0)
      const pagamentoDinheiro = values.pagamento === 'Dinheiro'

      if (pagamentoDinheiro && valorRecebido < total) {
        message.error('O valor recebido é menor que o total da comanda')
        return
      }

      setComandas((prev) =>
        prev.map((item) =>
          item.id === comandaSelecionada.id
            ? {
                ...item,
                cliente: '',
                pessoas: 0,
                status: STATUS_COMANDA.LIVRE,
                total: 0,
                criadaEm: '',
                ultimaAtualizacao: '',
                garcom: '',
                tipoAtendimento: '',
                itens: [],
              }
            : item
        )
      )

      const proximaComanda =
        comandas.find(
          (item) =>
            item.id !== comandaSelecionada.id && item.status !== STATUS_COMANDA.LIVRE
        ) || null

      setComandaSelecionadaId(proximaComanda?.id || null)
      setModalFechamentoOpen(false)
      setView('lista')
      message.success('Conta fechada com sucesso')
    } catch {}
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
              Mesas/Comandas livres ({comandasLivresFiltradas.length})
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
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space align="center">
                <Button
                  shape="circle"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setView('lista')}
                />
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    Mesa {comandaSelecionada?.mesa}
                  </Title>
                  <Text type="secondary">
                    Comanda #{comandaSelecionada?.id}
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

                    <Descriptions.Item label="Atendimento">
                      {comandaSelecionada.tipoAtendimento === 'balcao'
                        ? 'Balcão'
                        : 'Salão'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Pessoas">
                      {comandaSelecionada.pessoas || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Abertura">
                      {comandaSelecionada.criadaEm || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Última atualização">
                      {comandaSelecionada.ultimaAtualizacao || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                      <Badge
                        status={statusConfig[comandaSelecionada.status].badge}
                        text={statusConfig[comandaSelecionada.status].label}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Ações rápidas"
                  style={{ borderRadius: 12 }}
                  extra={
                    <Button type="primary" size="small" onClick={abrirAdicionarItem}>
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
                      >
                        Cozinha
                      </Button>
                    </Col>

                    <Col span={12}>
                      <Button
                        block
                        size="large"
                        onClick={avancarStatus}
                      >
                        Avançar
                      </Button>
                    </Col>

                    <Col span={12}>
                      <Button
                        block
                        size="large"
                        icon={<SwapOutlined />}
                        onClick={abrirTransferencia}
                      >
                        Transferir
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
                      const statusItemConfig = getStatusItemTag(item.statusItem)

                      return (
                        <List.Item
                          style={{ paddingInline: 0 }}
                          actions={[
                            <Button
                              key="edit"
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => abrirEditarItem(item)}
                            >
                              Editar
                            </Button>,
                            <Popconfirm
                              key="remove"
                              title="Remover item?"
                              onConfirm={() => removerItem(item.id)}
                            >
                              <Button type="link" danger>
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
                                marginBottom: 4,
                              }}
                            >
                              <Text strong>
                                {item.qtd}x {item.nome}
                              </Text>

                              <Text strong>
                                {formatCurrency(item.qtd * item.valor)}
                              </Text>
                            </div>

                            <Space wrap size={[6, 6]}>
                              <Tag color={statusItemConfig.color}>
                                {statusItemConfig.label}
                              </Tag>
                            </Space>

                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Unitário: {formatCurrency(item.valor)}
                              </Text>
                            </div>

                            {!!item.adicionais?.length && (
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Adicionais: {item.adicionais.join(', ')}
                                </Text>
                              </div>
                            )}

                            {!!item.observacao && (
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Obs.: {item.observacao}
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
          <Button type="primary" onClick={salvarNovaComanda}>
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
        </Form>
      </Drawer>

      <Drawer
        title="Adicionar item"
        open={drawerAdicionarItemOpen}
        onClose={() => setDrawerAdicionarItemOpen(false)}
        placement="bottom"
        height="92vh"
        extra={
          <Button type="primary" onClick={salvarNovoItem}>
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
                  adicionais: [],
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

          <Form.Item label="Quantidade" name="qtd">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Adicionais" name="adicionais">
            <Select
              mode="multiple"
              placeholder="Selecione adicionais"
              disabled={!produtoSelecionado}
              options={(produtoSelecionado?.adicionais || []).map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </Form.Item>

          <Form.Item label="Observação" name="observacao">
            <TextArea
              rows={4}
              placeholder="Ex.: sem cebola, mandar junto, ponto da carne..."
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Editar item"
        open={modalEditarItemOpen}
        onCancel={() => {
          setModalEditarItemOpen(false)
          setItemEditando(null)
        }}
        onOk={salvarEdicaoItem}
        okText="Salvar alterações"
        cancelText="Cancelar"
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
                  adicionais: [],
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

          <Form.Item label="Adicionais" name="adicionais">
            <Select
              mode="multiple"
              placeholder="Selecione adicionais"
              disabled={!produtoEditandoSelecionado}
              options={(produtoEditandoSelecionado?.adicionais || []).map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </Form.Item>

          <Form.Item label="Observação" name="observacao">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Status do item" name="statusItem">
            <Select
              options={[
                { label: 'Lançado', value: STATUS_ITEM.LANCADO },
                { label: 'Enviado cozinha', value: STATUS_ITEM.ENVIADO_COZINHA },
                { label: 'Em preparo', value: STATUS_ITEM.EM_PREPARO },
                { label: 'Pronto', value: STATUS_ITEM.PRONTO },
                { label: 'Entregue', value: STATUS_ITEM.ENTREGUE },
                { label: 'Cancelado', value: STATUS_ITEM.CANCELADO },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Transferir mesa"
        open={modalTransferenciaOpen}
        onCancel={() => setModalTransferenciaOpen(false)}
        onOk={confirmarTransferencia}
        okText="Transferir"
        cancelText="Cancelar"
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
              options={mesasLivres.map((item) => ({
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

          {pagamentoFechamento === 'Dinheiro' && (
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