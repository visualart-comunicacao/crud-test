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
} from 'antd'
import {
  SearchOutlined,
  FireOutlined,
  CheckCircleOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  BellOutlined,
  SoundOutlined,
  FullscreenOutlined,
  UserSwitchOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import PageTitle from '../../components/common/PageTitle'

const { Title, Text } = Typography

const STATUS_PEDIDO = {
  NOVO: 'novo',
  PREPARO: 'preparo',
  PRONTO: 'pronto',
}

const SETOR = {
  GERAL: 'geral',
  CHURRASQUEIRA: 'churrasqueira',
  BEBIDAS: 'bebidas',
  MONTAGEM: 'montagem',
}

const pedidosIniciais = [
  {
    id: 1024,
    origem: 'Mesa 01',
    cliente: 'Carlos',
    garcom: 'João',
    horario: '19:02',
    tempoMin: 8,
    prioridade: 'normal',
    status: STATUS_PEDIDO.NOVO,
    setor: SETOR.CHURRASQUEIRA,
    observacaoGeral: 'Mandar a bebida primeiro',
    retiradaPor: '',
    itens: [
      {
        id: 1,
        nome: 'Espeto de Carne',
        qtd: 2,
        observacao: 'Um sem cebola',
      },
      {
        id: 2,
        nome: 'Pão de Alho',
        qtd: 1,
        observacao: '',
      },
    ],
  },
  {
    id: 1025,
    origem: 'Mesa 02',
    cliente: 'Fernanda',
    garcom: 'Marcos',
    horario: '19:08',
    tempoMin: 14,
    prioridade: 'alta',
    status: STATUS_PEDIDO.PREPARO,
    setor: SETOR.CHURRASQUEIRA,
    observacaoGeral: '',
    retiradaPor: '',
    itens: [
      {
        id: 1,
        nome: 'Espeto de Frango',
        qtd: 4,
        observacao: '',
      },
      {
        id: 2,
        nome: 'Farofa Especial',
        qtd: 2,
        observacao: '',
      },
    ],
  },
  {
    id: 1026,
    origem: 'Mesa 03',
    cliente: 'Juliana',
    garcom: 'Lucas',
    horario: '19:15',
    tempoMin: 18,
    prioridade: 'alta',
    status: STATUS_PEDIDO.PRONTO,
    setor: SETOR.MONTAGEM,
    observacaoGeral: 'Cliente com pressa',
    retiradaPor: '',
    itens: [
      {
        id: 1,
        nome: 'Espeto Medalhão',
        qtd: 3,
        observacao: '',
      },
      {
        id: 2,
        nome: 'Vinagrete',
        qtd: 1,
        observacao: '',
      },
    ],
  },
  {
    id: 1027,
    origem: 'Balcão',
    cliente: 'Retirada',
    garcom: 'Caixa',
    horario: '19:18',
    tempoMin: 5,
    prioridade: 'normal',
    status: STATUS_PEDIDO.NOVO,
    setor: SETOR.GERAL,
    observacaoGeral: 'Levar separado',
    retiradaPor: '',
    itens: [
      {
        id: 1,
        nome: 'Linguiça Acebolada',
        qtd: 1,
        observacao: 'Caprichar na cebola',
      },
    ],
  },
  {
    id: 1028,
    origem: 'Mesa 04',
    cliente: 'Patrícia',
    garcom: 'João',
    horario: '19:20',
    tempoMin: 11,
    prioridade: 'normal',
    status: STATUS_PEDIDO.PREPARO,
    setor: SETOR.BEBIDAS,
    observacaoGeral: '',
    retiradaPor: '',
    itens: [
      {
        id: 1,
        nome: 'Suco Natural',
        qtd: 2,
        observacao: 'Sem açúcar',
      },
      {
        id: 2,
        nome: 'Coca-Cola 600ml',
        qtd: 1,
        observacao: 'Sem gelo',
      },
    ],
  },
  {
    id: 1029,
    origem: 'Mesa 05',
    cliente: 'Roberto',
    garcom: 'Lucas',
    horario: '19:11',
    tempoMin: 21,
    prioridade: 'alta',
    status: STATUS_PEDIDO.PREPARO,
    setor: SETOR.CHURRASQUEIRA,
    observacaoGeral: 'Mesa VIP',
    retiradaPor: '',
    itens: [
      {
        id: 1,
        nome: 'Espeto de Carne',
        qtd: 5,
        observacao: 'Dois bem passados',
      },
      {
        id: 2,
        nome: 'Linguiça Acebolada',
        qtd: 2,
        observacao: '',
      },
    ],
  },
]

function getPriorityTag(prioridade) {
  if (prioridade === 'alta') {
    return { color: 'error', label: 'Alta prioridade' }
  }

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
    [SETOR.GERAL]: 'Geral',
    [SETOR.CHURRASQUEIRA]: 'Churrasqueira',
    [SETOR.BEBIDAS]: 'Bebidas',
    [SETOR.MONTAGEM]: 'Montagem',
  }

  return map[setor] || setor
}

export default function Cozinha() {
  const [pedidos, setPedidos] = useState(pedidosIniciais)
  const [busca, setBusca] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
  const [filtroSetor, setFiltroSetor] = useState('todos')
  const [somAtivo, setSomAtivo] = useState(true)
  const [modoTV, setModoTV] = useState(false)
  const [mostrarApenasAtrasados, setMostrarApenasAtrasados] = useState(false)

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const texto = busca.toLowerCase()

      const matchBusca =
        String(pedido.id).includes(texto) ||
        pedido.origem.toLowerCase().includes(texto) ||
        pedido.cliente.toLowerCase().includes(texto) ||
        pedido.garcom.toLowerCase().includes(texto) ||
        pedido.setor.toLowerCase().includes(texto) ||
        pedido.itens.some((item) => item.nome.toLowerCase().includes(texto))

      const matchPrioridade =
        filtroPrioridade === 'todas'
          ? true
          : pedido.prioridade === filtroPrioridade

      const matchSetor =
        filtroSetor === 'todos' ? true : pedido.setor === filtroSetor

      const matchAtrasado = mostrarApenasAtrasados ? pedido.tempoMin >= 15 : true

      return matchBusca && matchPrioridade && matchSetor && matchAtrasado
    })
  }, [pedidos, busca, filtroPrioridade, filtroSetor, mostrarApenasAtrasados])

  const pedidosNovos = useMemo(
    () => pedidosFiltrados.filter((item) => item.status === STATUS_PEDIDO.NOVO),
    [pedidosFiltrados]
  )

  const pedidosPreparo = useMemo(
    () => pedidosFiltrados.filter((item) => item.status === STATUS_PEDIDO.PREPARO),
    [pedidosFiltrados]
  )

  const pedidosProntos = useMemo(
    () => pedidosFiltrados.filter((item) => item.status === STATUS_PEDIDO.PRONTO),
    [pedidosFiltrados]
  )

  const resumo = useMemo(() => {
    return {
      total: pedidos.length,
      novos: pedidos.filter((item) => item.status === STATUS_PEDIDO.NOVO).length,
      preparo: pedidos.filter((item) => item.status === STATUS_PEDIDO.PREPARO).length,
      prontos: pedidos.filter((item) => item.status === STATUS_PEDIDO.PRONTO).length,
      atrasados: pedidos.filter((item) => item.tempoMin >= 15).length,
      churrasqueira: pedidos.filter((item) => item.setor === SETOR.CHURRASQUEIRA).length,
      bebidas: pedidos.filter((item) => item.setor === SETOR.BEBIDAS).length,
      montagem: pedidos.filter((item) => item.setor === SETOR.MONTAGEM).length,
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
    atualizarStatus(pedidoId, STATUS_PEDIDO.PREPARO)
    message.success('Pedido movido para preparo')
  }

  const marcarPronto = (pedidoId) => {
    atualizarStatus(pedidoId, STATUS_PEDIDO.PRONTO)
    message.success('Pedido marcado como pronto')
  }

  const voltarEtapa = (pedido) => {
    if (pedido.status === STATUS_PEDIDO.PRONTO) {
      atualizarStatus(pedido.id, STATUS_PEDIDO.PREPARO)
      message.success('Pedido voltou para preparo')
      return
    }

    if (pedido.status === STATUS_PEDIDO.PREPARO) {
      atualizarStatus(pedido.id, STATUS_PEDIDO.NOVO)
      message.success('Pedido voltou para novos')
      return
    }

    message.info('Esse pedido já está na primeira etapa')
  }

  const finalizarPedido = (pedidoId) => {
    setPedidos((prev) => prev.filter((item) => item.id !== pedidoId))
    message.success('Pedido retirado da tela da cozinha')
  }

  const chamarGarcom = (pedido) => {
    message.info(`Garçom ${pedido.garcom} chamado para o pedido #${pedido.id}`)
  }

  const tocarAlerta = () => {
    message.info(somAtivo ? 'Alerta sonoro simulado' : 'O som está desativado')
  }

  const alternarModoTV = (checked) => {
    setModoTV(checked)
    message.success(checked ? 'Modo TV ativado' : 'Modo TV desativado')
  }

  const renderPedidoCard = (pedido) => {
    const prioridade = getPriorityTag(pedido.prioridade)
    const tempoCor = getTempoCor(pedido.tempoMin)
    const atrasado = pedido.tempoMin >= 15

    return (
      <Card
        key={pedido.id}
        bordered={false}
        style={{
          background: '#171717',
          border: atrasado ? '1px solid #ff4d4f' : '1px solid #262626',
          boxShadow: atrasado ? '0 0 0 1px rgba(255,77,79,0.12)' : 'none',
        }}
        styles={{
          body: {
            padding: modoTV ? 20 : 16,
          },
        }}
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
            <Title
              level={modoTV ? 3 : 4}
              style={{ color: '#fff', margin: 0, lineHeight: 1.1 }}
            >
              #{pedido.id}
            </Title>
            <Text style={{ color: '#bfbfbf', fontSize: modoTV ? 15 : 14 }}>
              {pedido.origem}
            </Text>
          </div>

          <Space direction="vertical" size={6} align="end">
            <Tag color={prioridade.color} style={{ marginRight: 0 }}>
              {prioridade.label}
            </Tag>

            <Tag color="blue" style={{ marginRight: 0 }}>
              {getSetorLabel(pedido.setor)}
            </Tag>

            <Badge
              status={getStatusColor(pedido.status)}
              text={
                <span style={{ color: '#d9d9d9' }}>
                  {getStatusLabel(pedido.status)}
                </span>
              }
            />
          </Space>
        </div>

        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text style={{ color: '#d9d9d9', fontSize: modoTV ? 15 : 14 }}>
            <strong>Cliente:</strong> {pedido.cliente}
          </Text>

          <Text style={{ color: '#d9d9d9', fontSize: modoTV ? 15 : 14 }}>
            <strong>Garçom:</strong> {pedido.garcom}
          </Text>

          <Text style={{ color: '#d9d9d9', fontSize: modoTV ? 15 : 14 }}>
            <strong>Horário:</strong> {pedido.horario}
          </Text>

          <Space size={6}>
            <ClockCircleOutlined style={{ color: tempoCor }} />
            <Text
              style={{
                color: tempoCor,
                fontWeight: 700,
                fontSize: modoTV ? 16 : 14,
              }}
            >
              {pedido.tempoMin} min
            </Text>
            {atrasado && <Tag color="error">Atrasado</Tag>}
          </Space>
        </Space>

        {!!pedido.observacaoGeral && (
          <>
            <Divider style={{ borderColor: '#262626', margin: '12px 0' }} />
            <Text style={{ color: '#faad14', fontSize: modoTV ? 15 : 14 }}>
              <strong>Obs. geral:</strong> {pedido.observacaoGeral}
            </Text>
          </>
        )}

        <Divider style={{ borderColor: '#262626', margin: '12px 0' }} />

        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          {pedido.itens.map((item) => (
            <div
              key={item.id}
              style={{
                padding: modoTV ? 12 : 10,
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
                <Text style={{ color: '#fff', fontWeight: 600, fontSize: modoTV ? 16 : 14 }}>
                  {item.qtd}x {item.nome}
                </Text>
              </div>

              {!!item.observacao && (
                <Text style={{ color: '#8c8c8c', fontSize: modoTV ? 13 : 12 }}>
                  Obs.: {item.observacao}
                </Text>
              )}
            </div>
          ))}
        </Space>

        <Divider style={{ borderColor: '#262626', margin: '16px 0 12px' }} />

        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          {pedido.status === STATUS_PEDIDO.NOVO && (
            <Button
              type="primary"
              block
              icon={<FireOutlined />}
              onClick={() => iniciarPreparo(pedido.id)}
            >
              Iniciar preparo
            </Button>
          )}

          {pedido.status === STATUS_PEDIDO.PREPARO && (
            <Button
              type="primary"
              block
              icon={<CheckCircleOutlined />}
              onClick={() => marcarPronto(pedido.id)}
            >
              Marcar como pronto
            </Button>
          )}

          {pedido.status === STATUS_PEDIDO.PRONTO && (
            <>
              <Button
                type="primary"
                block
                icon={<UserSwitchOutlined />}
                onClick={() => chamarGarcom(pedido)}
              >
                Chamar garçom
              </Button>

              <Button
                block
                icon={<CheckCircleOutlined />}
                onClick={() => finalizarPedido(pedido.id)}
              >
                Retirar da tela
              </Button>
            </>
          )}

          {pedido.status !== STATUS_PEDIDO.PRONTO && (
            <Button
              block
              icon={<UserSwitchOutlined />}
              onClick={() => chamarGarcom(pedido)}
            >
              Chamar garçom
            </Button>
          )}

          <Button block icon={<UndoOutlined />} onClick={() => voltarEtapa(pedido)}>
            Voltar etapa
          </Button>
        </Space>
      </Card>
    )
  }

  const renderColuna = (titulo, pedidosColuna, corTopo) => {
    const tagColor =
      corTopo === '#1677ff' ? 'processing' : corTopo === '#faad14' ? 'warning' : 'success'

    return (
      <Card
        bordered={false}
        style={{ height: '100%' }}
        styles={{
          body: {
            padding: modoTV ? 18 : 14,
          },
        }}
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
          <Title level={modoTV ? 3 : 4} style={{ color: '#fff', margin: 0 }}>
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

  return (
    <>
      <PageTitle
        title="Cozinha"
        subtitle="Painel operacional de pedidos em preparo da espetaria"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 4 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Pedidos na cozinha" value={resumo.total} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Novos pedidos" value={resumo.novos} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Em preparo" value={resumo.preparo} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Atrasados" value={resumo.atrasados} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8} xl={6}>
          <Card bordered={false}>
            <Statistic title="Churrasqueira" value={resumo.churrasqueira} />
          </Card>
        </Col>

        <Col xs={24} md={8} xl={6}>
          <Card bordered={false}>
            <Statistic title="Bebidas" value={resumo.bebidas} />
          </Card>
        </Col>

        <Col xs={24} md={8} xl={6}>
          <Card bordered={false}>
            <Statistic title="Montagem" value={resumo.montagem} />
          </Card>
        </Col>

        <Col xs={24} md={24} xl={6}>
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#bfbfbf' }}>Modo TV</Text>
                <Switch checked={modoTV} onChange={alternarModoTV} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#bfbfbf' }}>Som ativo</Text>
                <Switch checked={somAtivo} onChange={setSomAtivo} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={10} xl={8}>
            <Input
              allowClear
              size="large"
              placeholder="Buscar por pedido, mesa, cliente, garçom ou item"
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
              value={filtroSetor}
              onChange={setFiltroSetor}
              options={[
                { label: 'Todos os setores', value: 'todos' },
                { label: 'Churrasqueira', value: SETOR.CHURRASQUEIRA },
                { label: 'Bebidas', value: SETOR.BEBIDAS },
                { label: 'Montagem', value: SETOR.MONTAGEM },
                { label: 'Geral', value: SETOR.GERAL },
              ]}
            />
          </Col>

          <Col xs={24} xl={6}>
            <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button icon={<BellOutlined />} onClick={tocarAlerta}>
                Testar alerta
              </Button>

              <Button icon={<FullscreenOutlined />} onClick={() => alternarModoTV(!modoTV)}>
                {modoTV ? 'Sair do TV' : 'Modo TV'}
              </Button>
            </Space>
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

          <Tag color="red">15+ min = atrasado</Tag>
          <Tag color="orange">10 a 14 min = atenção</Tag>
          <Tag color="green">0 a 9 min = dentro do prazo</Tag>
        </Space>
      </Card>

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={8}>
          {renderColuna('Novos pedidos', pedidosNovos, '#1677ff')}
        </Col>

        <Col xs={24} xl={8}>
          {renderColuna('Em preparo', pedidosPreparo, '#faad14')}
        </Col>

        <Col xs={24} xl={8}>
          {renderColuna('Prontos', pedidosProntos, '#52c41a')}
        </Col>
      </Row>
    </>
  )
}