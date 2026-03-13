import { useMemo, useState } from 'react'
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
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  PrinterOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  HistoryOutlined,
  TableOutlined,
  FireOutlined,
  WalletOutlined,
  EditOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import PageTitle from '../../components/common/PageTitle'

const { Text, Title } = Typography
const { TextArea } = Input

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
    mesa: 'Mesa 01',
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
    mesa: 'Mesa 02',
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
    mesa: 'Mesa 03',
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
    mesa: 'Mesa 04',
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
    mesa: 'Mesa 05',
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
    mesa: 'Mesa 06',
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
    mesa: 'Mesa 07',
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
    mesa: 'Mesa 08',
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

const historicoInicial = [
  {
    id: 9001,
    mesa: 'Mesa 10',
    cliente: 'Marcos',
    total: 132.4,
    pagamento: 'PIX',
    fechadoEm: '18:40',
    divisao: 1,
    valorRecebido: 132.4,
    troco: 0,
  },
  {
    id: 9002,
    mesa: 'Mesa 11',
    cliente: 'Camila',
    total: 89.9,
    pagamento: 'Cartão de crédito',
    fechadoEm: '18:55',
    divisao: 2,
    valorRecebido: 89.9,
    troco: 0,
  },
]

const statusConfig = {
  [STATUS_COMANDA.LIVRE]: {
    label: 'Livre',
    color: 'default',
    borderColor: '#303030',
    bg: '#141414',
    badge: 'default',
  },
  [STATUS_COMANDA.ABERTA]: {
    label: 'Aberta',
    color: 'processing',
    borderColor: '#1677ff',
    bg: '#111a2c',
    badge: 'processing',
  },
  [STATUS_COMANDA.PREPARO]: {
    label: 'Em preparo',
    color: 'warning',
    borderColor: '#faad14',
    bg: '#2b2111',
    badge: 'warning',
  },
  [STATUS_COMANDA.PRONTA]: {
    label: 'Pronta',
    color: 'success',
    borderColor: '#52c41a',
    bg: '#162312',
    badge: 'success',
  },
  [STATUS_COMANDA.FECHAMENTO]: {
    label: 'Fechamento',
    color: 'error',
    borderColor: '#ff4d4f',
    bg: '#2a1215',
    badge: 'error',
  },
  [STATUS_COMANDA.FINALIZADA]: {
    label: 'Finalizada',
    color: 'default',
    borderColor: '#434343',
    bg: '#141414',
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

export default function Comandas() {
  const [comandas, setComandas] = useState(comandasIniciais)
  const [historico, setHistorico] = useState(historicoInicial)

  const [tabAtiva, setTabAtiva] = useState('comandas')
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const primeiraAtiva =
    comandasIniciais.find((item) => item.status !== STATUS_COMANDA.LIVRE) || null

  const [comandaSelecionadaId, setComandaSelecionadaId] = useState(
    primeiraAtiva?.id || null
  )

  const [modalNovaComandaOpen, setModalNovaComandaOpen] = useState(false)
  const [modalAdicionarItemOpen, setModalAdicionarItemOpen] = useState(false)
  const [modalEditarItemOpen, setModalEditarItemOpen] = useState(false)
  const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false)
  const [modalFechamentoOpen, setModalFechamentoOpen] = useState(false)
  const [modalDividirContaOpen, setModalDividirContaOpen] = useState(false)

  const [itemEditando, setItemEditando] = useState(null)

  const [formNovaComanda] = Form.useForm()
  const [formAdicionarItem] = Form.useForm()
  const [formEditarItem] = Form.useForm()
  const [formTransferencia] = Form.useForm()
  const [formFechamento] = Form.useForm()
  const [formDividirConta] = Form.useForm()

  const comandaSelecionada =
    comandas.find((item) => item.id === comandaSelecionadaId) || null

  const produtosPorCategoria = useMemo(() => {
    return produtosMock.reduce((acc, produto) => {
      if (!acc[produto.categoria]) acc[produto.categoria] = []
      acc[produto.categoria].push(produto)
      return acc
    }, {})
  }, [])

  const comandasFiltradas = useMemo(() => {
    return comandas.filter((comanda) => {
      const texto = busca.toLowerCase()

      const matchBusca =
        comanda.mesa.toLowerCase().includes(texto) ||
        (comanda.cliente || '').toLowerCase().includes(texto) ||
        String(comanda.id).includes(texto) ||
        (comanda.garcom || '').toLowerCase().includes(texto)

      const matchStatus =
        filtroStatus === 'todos' ? true : comanda.status === filtroStatus

      return matchBusca && matchStatus
    })
  }, [comandas, busca, filtroStatus])

  const resumo = useMemo(() => {
    return {
      ativas: comandas.filter((item) => item.status !== STATUS_COMANDA.LIVRE).length,
      preparo: comandas.filter((item) => item.status === STATUS_COMANDA.PREPARO).length,
      prontas: comandas.filter((item) => item.status === STATUS_COMANDA.PRONTA).length,
      livres: comandas.filter((item) => item.status === STATUS_COMANDA.LIVRE).length,
    }
  }, [comandas])

  const totaisCaixa = useMemo(() => {
    const totalDia = historico.reduce((acc, item) => acc + item.total, 0)
    const pix = historico
      .filter((item) => item.pagamento === 'PIX')
      .reduce((acc, item) => acc + item.total, 0)
    const credito = historico
      .filter((item) => item.pagamento === 'Cartão de crédito')
      .reduce((acc, item) => acc + item.total, 0)
    const debito = historico
      .filter((item) => item.pagamento === 'Cartão de débito')
      .reduce((acc, item) => acc + item.total, 0)
    const dinheiro = historico
      .filter((item) => item.pagamento === 'Dinheiro')
      .reduce((acc, item) => acc + item.total, 0)

    return { totalDia, pix, credito, debito, dinheiro }
  }, [historico])

  const mesasLivres = useMemo(() => {
    return comandas.filter((item) => item.status === STATUS_COMANDA.LIVRE)
  }, [comandas])

  const mesasOcupadas = useMemo(() => {
    return comandas.filter((item) => item.status !== STATUS_COMANDA.LIVRE)
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

  const atualizarComanda = (id, atualizacao) => {
    setComandas((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...atualizacao,
              ultimaAtualizacao: gerarHorarioAtual(),
            }
          : item
      )
    )
  }

  const selecionarComanda = (comanda) => {
    setComandaSelecionadaId(comanda.id)
    setTabAtiva('comandas')
  }

  const abrirModalNovaComanda = () => {
    formNovaComanda.resetFields()
    formNovaComanda.setFieldsValue({
      pessoas: 1,
      tipoAtendimento: 'salao',
    })
    setModalNovaComandaOpen(true)
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
      setModalNovaComandaOpen(false)
      message.success('Nova comanda aberta com sucesso')
    } catch (error) {}
  }

  const abrirModalAdicionarItem = () => {
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
    setModalAdicionarItemOpen(true)
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

      setModalAdicionarItemOpen(false)
      message.success('Item adicionado à comanda')
    } catch (error) {}
  }

  const abrirModalEditarItem = (item) => {
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
    } catch (error) {}
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

  const voltarStatus = () => {
    if (!comandaSelecionada) return
    if (comandaSelecionada.status === STATUS_COMANDA.LIVRE) return

    const indice = etapasStatus.indexOf(comandaSelecionada.status)
    if (indice <= 0) {
      message.info('Essa comanda já está na primeira etapa')
      return
    }

    const novoStatus = etapasStatus[indice - 1]
    atualizarComanda(comandaSelecionada.id, { status: novoStatus })
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
    } catch (error) {}
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
      divisao: 1,
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

      const troco = pagamentoDinheiro ? valorRecebido - total : 0

      const registroHistorico = {
        id: Date.now(),
        mesa: comandaSelecionada.mesa,
        cliente: comandaSelecionada.cliente || 'Mesa sem identificação',
        total,
        pagamento: values.pagamento,
        fechadoEm: gerarHorarioAtual(),
        divisao: Number(values.divisao || 1),
        valorRecebido: pagamentoDinheiro ? valorRecebido : total,
        troco,
      }

      setHistorico((prev) => [registroHistorico, ...prev])

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
      message.success('Conta fechada com sucesso')
    } catch (error) {}
  }

  const abrirDividirConta = () => {
    if (!comandaSelecionada || comandaSelecionada.status === STATUS_COMANDA.LIVRE) {
      message.warning('Selecione uma comanda ativa')
      return
    }

    formDividirConta.resetFields()
    formDividirConta.setFieldsValue({
      qtdPessoas: comandaSelecionada.pessoas || 1,
    })
    setModalDividirContaOpen(true)
  }

  const mesasTabColumns = [
    {
      title: 'Mesa',
      dataIndex: 'mesa',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      render: (_, record) => record.cliente || '-',
    },
    {
      title: 'Garçom',
      dataIndex: 'garcom',
      render: (value) => value || '-',
    },
    {
      title: 'Pessoas',
      dataIndex: 'pessoas',
      render: (value) => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
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
        <Button type="link" onClick={() => selecionarComanda(record)}>
          Ver comanda
        </Button>
      ),
    },
  ]

  const caixaColumns = [
    {
      title: 'Comanda',
      dataIndex: 'id',
      render: (id) => `#${id}`,
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
      render: (id) => `#${id}`,
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

                <Col xs={24} md={8}>
                  <Select
                    size="large"
                    style={{ width: '100%' }}
                    value={filtroStatus}
                    onChange={setFiltroStatus}
                    options={[
                      { label: 'Todos os status', value: 'todos' },
                      { label: 'Livre', value: STATUS_COMANDA.LIVRE },
                      { label: 'Aberta', value: STATUS_COMANDA.ABERTA },
                      { label: 'Em preparo', value: STATUS_COMANDA.PREPARO },
                      { label: 'Pronta', value: STATUS_COMANDA.PRONTA },
                      { label: 'Fechamento', value: STATUS_COMANDA.FECHAMENTO },
                    ]}
                  />
                </Col>

                <Col xs={24} md={6}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlusOutlined />}
                    onClick={abrirModalNovaComanda}
                  >
                    Nova comanda
                  </Button>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                {comandasFiltradas.map((comanda) => {
                  const status = statusConfig[comanda.status]
                  const selecionada = comandaSelecionada?.id === comanda.id

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
                              Comanda #{comanda.id}
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
                            <strong>Atendimento:</strong>{' '}
                            {comanda.tipoAtendimento === 'balcao' ? 'Balcão' : 'Salão'}
                          </Text>

                          <Text style={{ color: '#d9d9d9' }}>
                            <strong>Pessoas:</strong> {comanda.pessoas || '-'}
                          </Text>

                          <Text style={{ color: '#d9d9d9' }}>
                            <strong>Atualização:</strong>{' '}
                            {comanda.ultimaAtualizacao || '-'}
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
                    ? `${comandaSelecionada.mesa} • Comanda #${comandaSelecionada.id}`
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
                    <Descriptions.Item label="Tipo de atendimento">
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
                        text={
                          <span style={{ color: '#d9d9d9' }}>
                            {statusConfig[comandaSelecionada.status].label}
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
                        current={Math.max(
                          etapasStatus.indexOf(comandaSelecionada.status),
                          0
                        )}
                        items={[
                          { title: 'Aberta' },
                          { title: 'Preparo' },
                          { title: 'Pronta' },
                          { title: 'Fechamento' },
                        ]}
                      />

                      <Space style={{ marginTop: 12 }}>
                        <Button onClick={voltarStatus}>Voltar etapa</Button>
                        <Button type="primary" onClick={avancarStatus}>
                          Avançar etapa
                        </Button>
                      </Space>
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
                      const statusItemConfig = getStatusItemTag(item.statusItem)

                      return (
                        <List.Item
                          style={{
                            padding: '12px 0',
                            borderBottom: '1px solid #262626',
                          }}
                          actions={
                            comandaSelecionada.status !== STATUS_COMANDA.LIVRE
                              ? [
                                  <Button
                                    key="edit"
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => abrirModalEditarItem(item)}
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
                                {item.qtd}x {item.nome}
                              </Text>
                              <Text style={{ color: '#f5f5f5', fontWeight: 600 }}>
                                {formatCurrency(item.qtd * item.valor)}
                              </Text>
                            </div>

                            <Space wrap size={[6, 6]}>
                              <Tag color={statusItemConfig.color}>
                                {statusItemConfig.label}
                              </Tag>
                            </Space>

                            <div>
                              <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                                Unitário: {formatCurrency(item.valor)}
                              </Text>
                            </div>

                            {!!item.adicionais?.length && (
                              <div>
                                <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                                  Adicionais: {item.adicionais.join(', ')}
                                </Text>
                              </div>
                            )}

                            {!!item.observacao && (
                              <div>
                                <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                                  Obs.: {item.observacao}
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
                      icon={<SwapOutlined />}
                      onClick={abrirTransferencia}
                      disabled={comandaSelecionada.status === STATUS_COMANDA.LIVRE}
                    >
                      Transferir mesa
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
          <Col xs={24} xl={14}>
            <Card bordered={false} title="Visão geral das mesas">
              <Table
                rowKey={(record) => `${record.mesa}-${record.id}`}
                columns={mesasTabColumns}
                dataSource={comandas}
                pagination={false}
              />
            </Card>
          </Col>

          <Col xs={24} xl={10}>
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
                      <Tag key={mesa.mesa} style={{ padding: '6px 10px' }}>
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
              <Statistic
                title="PIX"
                value={totaisCaixa.pix}
                precision={2}
                prefix="R$"
              />
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
            <Statistic title="Em preparo" value={resumo.preparo} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Prontas" value={resumo.prontas} />
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
        title="Nova comanda"
        open={modalNovaComandaOpen}
        onCancel={() => setModalNovaComandaOpen(false)}
        onOk={salvarNovaComanda}
        okText="Abrir comanda"
        cancelText="Cancelar"
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
      </Modal>

      <Modal
        title="Adicionar item à comanda"
        open={modalAdicionarItemOpen}
        onCancel={() => setModalAdicionarItemOpen(false)}
        onOk={salvarNovoItem}
        okText="Adicionar item"
        cancelText="Cancelar"
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
              rows={3}
              placeholder="Ex.: sem cebola, mandar junto, ponto da carne..."
            />
          </Form.Item>
        </Form>
      </Modal>

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
      >
        <Form form={formFechamento} layout="vertical">
          <Form.Item label="Total da comanda">
            <Input value={comandaSelecionada ? formatCurrency(comandaSelecionada.total) : ''} disabled />
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