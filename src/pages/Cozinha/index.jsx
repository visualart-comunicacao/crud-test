import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Spin,
  Alert,
} from 'antd'
import {
  SearchOutlined,
  FireOutlined,
  CheckCircleOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  BellOutlined,
  FullscreenOutlined,
  FilterOutlined,
  ReloadOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import PageTitle from '../../components/common/PageTitle'
import http from '@/api/http'

const { Title, Text } = Typography

const STATUS_PEDIDO = {
  NOVO: 'novo',
  PREPARO: 'preparo',
  PRONTO: 'pronto',
}

const STORAGE_KEYS = {
  SOM_ATIVO: 'cozinha_som_ativo',
  MODO_TV: 'cozinha_modo_tv',
  INTERVALO_ATUALIZACAO: 'cozinha_intervalo_atualizacao',
}

function getPriorityTag(prioridade) {
  if (prioridade === 'alta') return { color: 'error', label: 'Alta prioridade' }
  return { color: 'default', label: 'Normal' }
}

function getTempoCor(tempoMin) {
  if (tempoMin >= 15) return '#ff4d4f'
  if (tempoMin >= 10) return '#faad14'
  return '#52c41a'
}

function getStatusColor(status) {
  if (status === STATUS_PEDIDO.NOVO) return 'processing'
  if (status === STATUS_PEDIDO.PREPARO) return 'warning'
  if (status === STATUS_PEDIDO.PRONTO) return 'success'
  return 'default'
}

function getStatusLabel(status) {
  if (status === STATUS_PEDIDO.NOVO) return 'Novo'
  if (status === STATUS_PEDIDO.PREPARO) return 'Em preparo'
  if (status === STATUS_PEDIDO.PRONTO) return 'Pronto'
  return status
}

function getSetorLabel(setor) {
  const map = {
    geral: 'Geral',
    churrasqueira: 'Churrasqueira',
    bebidas: 'Bebidas',
    montagem: 'Montagem',
  }
  return map[setor] || setor
}

function readBooleanStorage(key, defaultValue = false) {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return defaultValue
    return value === 'true'
  } catch {
    return defaultValue
  }
}

function readNumberStorage(key, defaultValue) {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return defaultValue
    const parsed = Number(value)
    return Number.isNaN(parsed) ? defaultValue : parsed
  } catch {
    return defaultValue
  }
}

function hasFlag(text, flag) {
  return String(text || '').includes(flag)
}

function removeKitchenFlags(notes) {
  return String(notes || '')
    .replace(/\[KITCHEN_SENT\]/g, '')
    .replace(/\[KITCHEN_PREPARO\]/g, '')
    .replace(/\[KITCHEN_READY\]/g, '')
    .replace(/\[KITCHEN_FINISHED\]/g, '')
    .trim()
}

function getItemQtd(item) {
  const value = Number(item?.qtd ?? item?.quantity ?? 0)
  return Number.isNaN(value) ? 0 : value
}

function getItemNome(item) {
  return item?.nome || item?.productName || 'Item'
}

function getItemObservacao(item) {
  return item?.observacao ?? item?.notes ?? ''
}

function isItemAtivo(item) {
  return String(item?.status || 'ATIVO') !== 'CANCELADO'
}

function isItemNovoCozinha(item) {
  const notes = getItemObservacao(item)

  return (
    isItemAtivo(item) &&
    hasFlag(notes, '[KITCHEN_SENT]') &&
    !hasFlag(notes, '[KITCHEN_PREPARO]') &&
    !hasFlag(notes, '[KITCHEN_READY]') &&
    !hasFlag(notes, '[KITCHEN_FINISHED]')
  )
}

function isItemEmPreparo(item) {
  const notes = getItemObservacao(item)

  return (
    isItemAtivo(item) &&
    hasFlag(notes, '[KITCHEN_PREPARO]') &&
    !hasFlag(notes, '[KITCHEN_READY]') &&
    !hasFlag(notes, '[KITCHEN_FINISHED]')
  )
}

function isItemPronto(item) {
  const notes = getItemObservacao(item)

  return (
    isItemAtivo(item) &&
    hasFlag(notes, '[KITCHEN_READY]') &&
    !hasFlag(notes, '[KITCHEN_FINISHED]')
  )
}

function getItensNovosCozinha(pedido) {
  return (pedido?.itens || []).filter(isItemNovoCozinha)
}

function getItensPreparoCozinha(pedido) {
  return (pedido?.itens || []).filter(isItemEmPreparo)
}

function getItensProntosCozinha(pedido) {
  return (pedido?.itens || []).filter(isItemPronto)
}

function getStatusPedidoByItens(pedido) {
  const itensNovos = getItensNovosCozinha(pedido)
  const itensPreparo = getItensPreparoCozinha(pedido)
  const itensProntos = getItensProntosCozinha(pedido)

  if (itensNovos.length > 0) return STATUS_PEDIDO.NOVO
  if (itensPreparo.length > 0) return STATUS_PEDIDO.PREPARO
  if (itensProntos.length > 0) return STATUS_PEDIDO.PRONTO

  return pedido?.status || STATUS_PEDIDO.NOVO
}

function normalizePedidoKitchen(pedido) {
  return {
    ...pedido,
    status: getStatusPedidoByItens({
      ...pedido,
      itens: (pedido?.itens || []).map((item) => ({
        ...item,
        qtd: getItemQtd(item),
        nome: getItemNome(item),
        observacao: getItemObservacao(item),
      })),
    }),
    itens: (pedido?.itens || []).map((item) => ({
      ...item,
      qtd: getItemQtd(item),
      nome: getItemNome(item),
      observacao: getItemObservacao(item),
    })),
  }
}

function buildPedidosSnapshot(listaPedidos) {
  const snapshot = new Map()

  for (const pedido of listaPedidos) {
    const itensNovos = getItensNovosCozinha(pedido)

    const hashNovos = itensNovos
      .map((item) => `${item.id}:${getItemQtd(item)}:${getItemObservacao(item)}`)
      .sort()
      .join('|')

    const totalNovos = itensNovos.reduce((acc, item) => acc + getItemQtd(item), 0)

    snapshot.set(String(pedido.id), {
      id: String(pedido.id),
      hashNovos,
      totalNovos,
    })
  }

  return snapshot
}

export default function Cozinha() {
  const [pedidos, setPedidos] = useState([])
  const [resumo, setResumo] = useState({})
  const [loading, setLoading] = useState(false)

  const [busca, setBusca] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
  const [filtroSetor, setFiltroSetor] = useState('todos')
  const [somAtivo, setSomAtivo] = useState(() =>
    readBooleanStorage(STORAGE_KEYS.SOM_ATIVO, true),
  )
  const [modoTV, setModoTV] = useState(() =>
    readBooleanStorage(STORAGE_KEYS.MODO_TV, false),
  )
  const [mostrarApenasAtrasados, setMostrarApenasAtrasados] = useState(false)
  const [ordenacaoTempo, setOrdenacaoTempo] = useState('desc')
  const [intervaloAtualizacao, setIntervaloAtualizacao] = useState(() =>
    readNumberStorage(STORAGE_KEYS.INTERVALO_ATUALIZACAO, 15000),
  )

  const pedidosSnapshotRef = useRef(new Map())
  const primeiraCargaRef = useRef(true)
  const audioRef = useRef(null)
  const audioContextRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOM_ATIVO, String(somAtivo))
    } catch {}
  }, [somAtivo])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MODO_TV, String(modoTV))
    } catch {}
  }, [modoTV])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.INTERVALO_ATUALIZACAO,
        String(intervaloAtualizacao),
      )
    } catch {}
  }, [intervaloAtualizacao])

  const tocarBeepFallback = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if (!AudioContextClass) return false
        audioContextRef.current = new AudioContextClass()
      }

      const ctx = audioContextRef.current

      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)

      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.35)

      return true
    } catch (error) {
      console.error('Erro ao tocar beep fallback:', error)
      return false
    }
  }, [])

  const tocarSomNovoItem = useCallback(async () => {
    if (!somAtivo) return false

    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        await audioRef.current.play()
        return true
      }

      return await tocarBeepFallback()
    } catch (error) {
      console.warn('Falha ao tocar áudio principal. Usando fallback.', error)
      return await tocarBeepFallback()
    }
  }, [somAtivo, tocarBeepFallback])

  const testarSom = useCallback(async () => {
    const tocou = await tocarSomNovoItem()

    if (tocou) {
      message.success('Som testado com sucesso')
    } else {
      message.warning(
        'Não foi possível tocar o som agora. Em alguns navegadores, é preciso interagir com a página antes.',
      )
    }
  }, [tocarSomNovoItem])

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)

      const [pedidosRes, resumoRes] = await Promise.all([
        http.get('/kitchen', {
          params: {
            busca,
            prioridade: filtroPrioridade,
            setor: filtroSetor,
            atrasados: mostrarApenasAtrasados,
          },
        }),
        http.get('/kitchen/summary'),
      ])

      const listaPedidosBruta = pedidosRes.data || []
      const listaPedidos = listaPedidosBruta.map(normalizePedidoKitchen)

      setPedidos(listaPedidos)
      setResumo(resumoRes.data || {})

      const snapshotAnterior = pedidosSnapshotRef.current
      const snapshotAtual = buildPedidosSnapshot(listaPedidos)

      if (!primeiraCargaRef.current && somAtivo) {
        const pedidosComNovidade = []

        for (const pedido of listaPedidos) {
          const id = String(pedido.id)
          const anterior = snapshotAnterior.get(id)
          const atual = snapshotAtual.get(id)

          const hashAnterior = anterior?.hashNovos || ''
          const hashAtual = atual?.hashNovos || ''
          const totalAtual = atual?.totalNovos || 0

          if (hashAtual !== hashAnterior && totalAtual > 0) {
            pedidosComNovidade.push(pedido)
          }
        }

        if (pedidosComNovidade.length > 0) {
          await tocarSomNovoItem()

          if (pedidosComNovidade.length === 1) {
            message.info(
              `Novidade na cozinha no pedido #${String(pedidosComNovidade[0].id).slice(-6)}.`,
            )
          } else {
            message.info(
              `${pedidosComNovidade.length} pedidos com novidades na cozinha.`,
            )
          }
        }
      }

      pedidosSnapshotRef.current = snapshotAtual

      if (primeiraCargaRef.current) {
        primeiraCargaRef.current = false
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Erro ao carregar cozinha')
    } finally {
      setLoading(false)
    }
  }, [
    busca,
    filtroPrioridade,
    filtroSetor,
    mostrarApenasAtrasados,
    somAtivo,
    tocarSomNovoItem,
  ])

  useEffect(() => {
    const audio = new Audio('/sounds/novo-pedido.mp3')
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  useEffect(() => {
    if (!intervaloAtualizacao) return

    const interval = setInterval(() => {
      carregarDados()
    }, intervaloAtualizacao)

    return () => clearInterval(interval)
  }, [carregarDados, intervaloAtualizacao])

  const iniciarPreparo = async (id) => {
    try {
      await http.patch(`/kitchen/${id}/start`)
      message.success('Pedido em preparo')
      carregarDados()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erro ao iniciar preparo')
    }
  }

  const marcarPronto = async (id) => {
    try {
      await http.patch(`/kitchen/${id}/ready`)
      message.success('Pedido pronto')
      carregarDados()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erro ao marcar como pronto')
    }
  }

  const voltarEtapa = async (id) => {
    try {
      await http.patch(`/kitchen/${id}/back`)
      message.success('Etapa atualizada')
      carregarDados()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erro ao voltar etapa')
    }
  }

  const finalizarPedido = async (id) => {
    try {
      const res = await http.patch(`/kitchen/${id}/finish`)
      message.success(res.data?.message || 'Pedido finalizado')
      carregarDados()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erro ao finalizar pedido')
    }
  }

  const chamarGarcom = async (id) => {
    try {
      const res = await http.post(`/kitchen/${id}/call-waiter`)
      message.info(res.data?.message || 'Garçom chamado')
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erro ao chamar garçom')
    }
  }

  const pedidosOrdenados = useMemo(() => {
    const sorted = [...pedidos].sort((a, b) => {
      return ordenacaoTempo === 'desc'
        ? Number(b.tempoMin || 0) - Number(a.tempoMin || 0)
        : Number(a.tempoMin || 0) - Number(b.tempoMin || 0)
    })

    return sorted
  }, [pedidos, ordenacaoTempo])

  const pedidosNovos = useMemo(
    () => pedidosOrdenados.filter((p) => getStatusPedidoByItens(p) === STATUS_PEDIDO.NOVO),
    [pedidosOrdenados],
  )

  const pedidosPreparo = useMemo(
    () => pedidosOrdenados.filter((p) => getStatusPedidoByItens(p) === STATUS_PEDIDO.PREPARO),
    [pedidosOrdenados],
  )

  const pedidosProntos = useMemo(
    () => pedidosOrdenados.filter((p) => getStatusPedidoByItens(p) === STATUS_PEDIDO.PRONTO),
    [pedidosOrdenados],
  )

  const renderPedidoCard = (pedido) => {
    const prioridade = getPriorityTag(pedido.prioridade)
    const tempoCor = getTempoCor(Number(pedido.tempoMin || 0))
    const temNovidadeCozinha = getItensNovosCozinha(pedido).length > 0

    return (
      <Card
        key={pedido.id}
        style={{
          background: '#171717',
          border: temNovidadeCozinha
            ? '2px solid #faad14'
            : pedido.prioridade === 'alta'
              ? '1px solid #ff4d4f'
              : '1px solid #262626',
          marginBottom: 16,
          boxShadow: temNovidadeCozinha
            ? '0 0 0 2px rgba(250, 173, 20, 0.12), 0 0 18px rgba(250, 173, 20, 0.18)'
            : 'none',
        }}
        bodyStyle={{ padding: modoTV ? 22 : 16 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'flex-start',
            marginBottom: 10,
          }}
        >
          <div>
            <Title level={modoTV ? 3 : 4} style={{ color: '#fff', margin: 0 }}>
              #{String(pedido.id).slice(-6)}
            </Title>
            <Text style={{ color: '#8c8c8c' }}>{pedido.code}</Text>
          </div>

          <Space direction="vertical" align="end" size={6}>
            <Tag color={prioridade.color}>{prioridade.label}</Tag>
            <Tag color="blue">{getSetorLabel(pedido.setor)}</Tag>
            {temNovidadeCozinha && <Tag color="gold">Novidade</Tag>}
          </Space>
        </div>

        <Space size={8} style={{ marginBottom: 10 }}>
          <Badge
            status={getStatusColor(getStatusPedidoByItens(pedido))}
            text={
              <span style={{ color: '#d9d9d9' }}>
                {getStatusLabel(getStatusPedidoByItens(pedido))}
              </span>
            }
          />
        </Space>

        <Divider style={{ borderColor: '#262626', margin: '10px 0' }} />

        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text style={{ color: '#fff' }}>
            <strong>Cliente:</strong> {pedido.cliente}
          </Text>
          <Text style={{ color: '#fff' }}>
            <strong>Mesa:</strong> {pedido.mesa}
          </Text>
          <Text style={{ color: '#fff' }}>
            <strong>Origem:</strong> {pedido.origem}
          </Text>
          <Text style={{ color: tempoCor, fontWeight: 700 }}>
            <ClockCircleOutlined /> {pedido.tempoMin} min
          </Text>
        </Space>

        <Divider style={{ borderColor: '#262626', margin: '12px 0' }} />

        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {pedido.itens.filter(isItemAtivo).map((item) => {
            const itemNovo = isItemNovoCozinha(item)

            return (
              <div
                key={item.id}
                style={{
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: itemNovo ? 'rgba(250, 173, 20, 0.10)' : 'transparent',
                  border: itemNovo
                    ? '1px solid rgba(250, 173, 20, 0.35)'
                    : '1px solid transparent',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    alignItems: 'flex-start',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: modoTV ? 16 : 14 }}>
                    {item.qtd}x {item.nome}
                  </Text>

                  {itemNovo && <Tag color="gold">Novo</Tag>}
                </div>

                {!!removeKitchenFlags(item.observacao) && (
                  <div>
                    <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                      Obs.: {removeKitchenFlags(item.observacao)}
                    </Text>
                  </div>
                )}
              </div>
            )
          })}
        </Space>

        <Divider style={{ borderColor: '#262626', margin: '12px 0' }} />

        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          {getStatusPedidoByItens(pedido) === STATUS_PEDIDO.NOVO && (
            <Button
              type="primary"
              icon={<FireOutlined />}
              onClick={() => iniciarPreparo(pedido.id)}
              block
            >
              Iniciar preparo
            </Button>
          )}

          {getStatusPedidoByItens(pedido) === STATUS_PEDIDO.PREPARO && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => marcarPronto(pedido.id)}
              block
            >
              Marcar como pronto
            </Button>
          )}

          <Button icon={<UndoOutlined />} onClick={() => voltarEtapa(pedido.id)} block>
            Voltar etapa
          </Button>

          <Button icon={<BellOutlined />} onClick={() => chamarGarcom(pedido.id)} block>
            Chamar garçom
          </Button>

          {getStatusPedidoByItens(pedido) === STATUS_PEDIDO.PRONTO && (
            <Button danger onClick={() => finalizarPedido(pedido.id)} block>
              Finalizar na cozinha
            </Button>
          )}
        </Space>
      </Card>
    )
  }

  return (
    <>
      <PageTitle
        title="Cozinha"
        subtitle="Painel de produção, preparo e liberação dos pedidos"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Total" value={resumo.total || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Novos" value={pedidosNovos.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Preparo" value={pedidosPreparo.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Prontos" value={pedidosProntos.length} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Buscar por mesa, cliente, comanda ou item"
              prefix={<SearchOutlined />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </Col>

          <Col xs={24} md={4}>
            <Select
              value={filtroPrioridade}
              onChange={setFiltroPrioridade}
              style={{ width: '100%' }}
              options={[
                { label: 'Todas prioridades', value: 'todas' },
                { label: 'Alta', value: 'alta' },
                { label: 'Normal', value: 'normal' },
              ]}
            />
          </Col>

          <Col xs={24} md={4}>
            <Select
              value={filtroSetor}
              onChange={setFiltroSetor}
              style={{ width: '100%' }}
              options={[
                { label: 'Todos setores', value: 'todos' },
                { label: 'Geral', value: 'geral' },
                { label: 'Churrasqueira', value: 'churrasqueira' },
                { label: 'Bebidas', value: 'bebidas' },
                { label: 'Montagem', value: 'montagem' },
              ]}
            />
          </Col>

          <Col xs={24} md={4}>
            <Segmented
              block
              value={ordenacaoTempo}
              onChange={setOrdenacaoTempo}
              options={[
                { label: 'Mais tempo', value: 'desc' },
                { label: 'Menos tempo', value: 'asc' },
              ]}
            />
          </Col>

          <Col xs={24} md={4}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={carregarDados}>
                Atualizar
              </Button>

              <Button icon={<SoundOutlined />} onClick={testarSom}>
                Testar som
              </Button>
            </Space>
          </Col>

          <Col xs={24} md={6}>
            <Select
              value={intervaloAtualizacao}
              onChange={setIntervaloAtualizacao}
              style={{ width: '100%' }}
              options={[
                { label: 'Tempo real (15s)', value: 15000 },
                { label: '30 segundos', value: 30000 },
                { label: '1 minuto', value: 60000 },
                { label: 'Manual', value: 0 },
              ]}
            />
          </Col>

          <Col xs={24}>
            <Divider style={{ margin: '8px 0 0', borderColor: '#262626' }} />
          </Col>

          <Col xs={24} md={8}>
            <Space>
              <FilterOutlined />
              <Text style={{ color: '#d9d9d9' }}>Som</Text>
              <Switch checked={somAtivo} onChange={setSomAtivo} />
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <Space>
              <FullscreenOutlined />
              <Text style={{ color: '#d9d9d9' }}>Modo TV</Text>
              <Switch checked={modoTV} onChange={setModoTV} />
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <Space>
              <ClockCircleOutlined />
              <Text style={{ color: '#d9d9d9' }}>Só atrasados</Text>
              <Switch
                checked={mostrarApenasAtrasados}
                onChange={setMostrarApenasAtrasados}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      <Alert
        showIcon
        type="info"
        style={{ marginBottom: 16 }}
        message="Pedidos com novos itens enviados para a cozinha voltam automaticamente para a coluna de Novos, tocam alerta sonoro e ficam destacados."
      />

      {loading ? (
        <Card bordered={false}>
          <div
            style={{
              minHeight: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={8}>
            <Card
              bordered={false}
              title={
                <Space>
                  <Badge status="processing" />
                  <span>Novos</span>
                  <Tag>{pedidosNovos.length}</Tag>
                </Space>
              }
            >
              {pedidosNovos.length ? (
                pedidosNovos.map(renderPedidoCard)
              ) : (
                <Empty description="Nenhum pedido novo" />
              )}
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card
              bordered={false}
              title={
                <Space>
                  <Badge status="warning" />
                  <span>Preparo</span>
                  <Tag>{pedidosPreparo.length}</Tag>
                </Space>
              }
            >
              {pedidosPreparo.length ? (
                pedidosPreparo.map(renderPedidoCard)
              ) : (
                <Empty description="Nenhum pedido em preparo" />
              )}
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card
              bordered={false}
              title={
                <Space>
                  <Badge status="success" />
                  <span>Prontos</span>
                  <Tag>{pedidosProntos.length}</Tag>
                </Space>
              }
            >
              {pedidosProntos.length ? (
                pedidosProntos.map(renderPedidoCard)
              ) : (
                <Empty description="Nenhum pedido pronto" />
              )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  )
}