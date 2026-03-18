import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  ReloadOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  CarOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import PageTitle from '../../components/common/PageTitle'
import StatCard from '../../components/common/StatCard'
import api from '@/api/http'

const { Text } = Typography

const ENDPOINTS = {
  orders: '/orders',
  tables: '/tables',
  payments: '/payments',
  cashRegister: '/cash-registers/current',
}

function getResponseData(response) {
  return response?.data ?? null
}

function getArrayFromResponse(responseData, possibleKeys = []) {
  if (Array.isArray(responseData)) return responseData

  for (const key of possibleKeys) {
    if (Array.isArray(responseData?.[key])) return responseData[key]
  }

  return []
}

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function isToday(date) {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

function normalizeOrder(order) {
  const id = order?.id ?? order?.orderId ?? order?.code ?? Math.random()
  const number =
    order?.number ??
    order?.codigo ??
    order?.code ??
    (typeof order?.id === 'string' ? order.id.slice(-6).toUpperCase() : id)

  const customerName =
    order?.customerName ||
    order?.customer?.name ||
    order?.cliente?.nome ||
    null

  const tableNumber =
    order?.tableNumber ||
    order?.table?.number ||
    order?.mesa?.numero ||
    null

  const type =
    order?.type ||
    order?.serviceType ||
    order?.origin ||
    order?.channel ||
    'LOCAL'

  const status = order?.status || order?.kitchenStatus || 'ABERTA'

  const total =
    order?.total ??
    order?.totalAmount ??
    order?.amount ??
    order?.valorTotal ??
    0

  const createdAt = order?.createdAt || order?.openedAt || order?.date || null

  const labelCliente = tableNumber
    ? `Mesa ${String(tableNumber).padStart(2, '0')}`
    : customerName
      ? customerName
      : type === 'DELIVERY'
        ? 'Delivery'
        : 'Balcão'

  return {
    id,
    pedido: `#${number}`,
    cliente: labelCliente,
    status,
    tipo: type,
    total: toNumber(total),
    createdAt,
    raw: order,
  }
}

function normalizeTableItem(table) {
  return {
    id: table?.id,
    status: table?.status || 'LIVRE',
    isActive: table?.isActive ?? table?.ativo ?? true,
  }
}

function mapStatusLabel(status, tipo) {
  const normalized = String(status || '').toUpperCase()

  if (normalized === 'NOVO') return 'Novo'
  if (normalized === 'PREPARO' || normalized === 'EM_PREPARO') return 'Preparo'
  if (normalized === 'PRONTO') return 'Pronto'
  if (normalized === 'ENTREGA' || normalized === 'SAIU_PARA_ENTREGA') return 'Entrega'
  if (normalized === 'ABERTA') return tipo === 'DELIVERY' ? 'Entrega' : 'Novo'
  if (normalized === 'FECHADA') return 'Finalizado'
  if (normalized === 'CANCELADA') return 'Cancelado'

  return status || 'Novo'
}

function getTagColor(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'novo') return 'gold'
  if (normalized === 'preparo') return 'orange'
  if (normalized === 'pronto') return 'green'
  if (normalized === 'entrega') return 'blue'
  if (normalized === 'finalizado') return 'default'
  if (normalized === 'cancelado') return 'red'

  return 'default'
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)

  const [stats, setStats] = useState({
    faturamentoDia: 0,
    pedidosHoje: 0,
    comandasAbertas: 0,
    deliveryAndamento: 0,
  })

  const [pedidosAndamento, setPedidosAndamento] = useState([])

  const columns = useMemo(
    () => [
      {
        title: 'Pedido',
        dataIndex: 'pedido',
        key: 'pedido',
        width: 120,
      },
      {
        title: 'Cliente/Mesa',
        dataIndex: 'cliente',
        key: 'cliente',
      },
      {
        title: 'Tipo',
        dataIndex: 'tipo',
        key: 'tipo',
        width: 120,
        render: (tipo) => {
          const normalized = String(tipo || '').toUpperCase()

          if (normalized === 'DELIVERY') return <Tag color="blue">Delivery</Tag>
          if (normalized === 'BALCAO') return <Tag color="purple">Balcão</Tag>
          return <Tag color="default">Mesa</Tag>
        },
      },
      {
        title: 'Status',
        dataIndex: 'statusLabel',
        key: 'statusLabel',
        width: 140,
        render: (statusLabel) => (
          <Tag color={getTagColor(statusLabel)}>{statusLabel}</Tag>
        ),
      },
      {
        title: 'Valor',
        dataIndex: 'total',
        key: 'total',
        width: 140,
        align: 'right',
        render: (value) =>
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(toNumber(value)),
      },
    ],
    []
  )

  const fetchDashboard = useCallback(async (isManual = false) => {
    try {
      setError('')

      if (isManual) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const results = await Promise.allSettled([
        api.get(ENDPOINTS.orders),
        api.get(ENDPOINTS.tables),
        api.get(ENDPOINTS.payments),
        api.get(ENDPOINTS.cashRegister),
      ])

      const ordersResponse =
        results[0].status === 'fulfilled' ? getResponseData(results[0].value) : null
      const tablesResponse =
        results[1].status === 'fulfilled' ? getResponseData(results[1].value) : null
      const paymentsResponse =
        results[2].status === 'fulfilled' ? getResponseData(results[2].value) : null
      const cashRegisterResponse =
        results[3].status === 'fulfilled' ? getResponseData(results[3].value) : null

      const orders = getArrayFromResponse(ordersResponse, [
        'items',
        'data',
        'orders',
        'rows',
      ]).map(normalizeOrder)

      const tables = getArrayFromResponse(tablesResponse, [
        'items',
        'data',
        'tables',
        'rows',
      ]).map(normalizeTableItem)

      const payments = getArrayFromResponse(paymentsResponse, [
        'items',
        'data',
        'payments',
        'rows',
      ])

      const pedidosHoje = orders.filter((order) => isToday(order.createdAt)).length

      const comandasAbertas = orders.filter(
        (order) => String(order.raw?.status || '').toUpperCase() === 'ABERTA'
      ).length

      const deliveryAndamento = orders.filter((order) => {
        const tipo = String(order.tipo || '').toUpperCase()
        const status = String(order.raw?.status || '').toUpperCase()

        return (
          tipo === 'DELIVERY' &&
          status !== 'FECHADA' &&
          status !== 'CANCELADA'
        )
      }).length

      let faturamentoDia = 0

      if (payments.length > 0) {
        faturamentoDia = payments
          .filter((payment) => {
            const status = String(payment?.status || '').toUpperCase()
            const paidAt = payment?.paidAt || payment?.createdAt || payment?.date
            return status === 'PAGO' && isToday(paidAt)
          })
          .reduce((sum, payment) => {
            const value =
              payment?.amount ??
              payment?.value ??
              payment?.valor ??
              payment?.total ??
              0
            return sum + toNumber(value)
          }, 0)
      } else {
        faturamentoDia = orders
          .filter((order) => {
            const status = String(order.raw?.status || '').toUpperCase()
            return status === 'FECHADA' && isToday(order.raw?.updatedAt || order.createdAt)
          })
          .reduce((sum, order) => sum + toNumber(order.total), 0)
      }

      if (!faturamentoDia && cashRegisterResponse) {
        faturamentoDia =
          toNumber(cashRegisterResponse?.salesToday) ||
          toNumber(cashRegisterResponse?.todaySales) ||
          toNumber(cashRegisterResponse?.faturamentoDia) ||
          faturamentoDia
      }

      const andamento = orders
        .filter((order) => {
          const status = String(order.raw?.status || '').toUpperCase()
          return status !== 'FECHADA' && status !== 'CANCELADA'
        })
        .map((order) => ({
          key: order.id,
          pedido: order.pedido,
          cliente: order.cliente,
          tipo: order.tipo,
          total: order.total,
          statusLabel: mapStatusLabel(order.status, order.tipo),
          createdAt: order.createdAt,
        }))
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 10)

      setStats({
        faturamentoDia,
        pedidosHoje,
        comandasAbertas:
          comandasAbertas ||
          tables.filter(
            (table) =>
              table.isActive && String(table.status || '').toUpperCase() === 'OCUPADA'
          ).length,
        deliveryAndamento,
      })

      setPedidosAndamento(andamento)
      setLastUpdate(dayjs())
    } catch (err) {
      setError('Não foi possível carregar a dashboard.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()

    const interval = setInterval(() => {
      fetchDashboard(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchDashboard])

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Visão geral da operação da espetaria"
      />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card bordered={false}>
            <Space
              style={{
                width: '100%',
                justifyContent: 'space-between',
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              <Space direction="vertical" size={0}>
                <Text strong>Painel em tempo real</Text>
                <Text type="secondary">
                  {lastUpdate
                    ? `Última atualização: ${lastUpdate.format('DD/MM/YYYY HH:mm:ss')}`
                    : 'Carregando dados...'}
                </Text>
              </Space>

              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchDashboard(true)}
                loading={refreshing}
              >
                Atualizar
              </Button>
            </Space>
          </Card>
        </Col>

        {error ? (
          <Col span={24}>
            <Alert
              type="error"
              message="Erro ao carregar dashboard"
              description={error}
              showIcon
            />
          </Col>
        ) : null}

        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Faturamento do dia"
            value={stats.faturamentoDia}
            prefix={<DollarOutlined />}
            precision={2}
            loading={loading}
          />
        </Col>

        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Pedidos hoje"
            value={stats.pedidosHoje}
            prefix={<ShoppingCartOutlined />}
            loading={loading}
          />
        </Col>

        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Comandas abertas"
            value={stats.comandasAbertas}
            prefix={<AppstoreOutlined />}
            loading={loading}
          />
        </Col>

        <Col xs={24} md={12} xl={6}>
          <StatCard
            title="Delivery em andamento"
            value={stats.deliveryAndamento}
            prefix={<CarOutlined />}
            loading={loading}
          />
        </Col>

        <Col span={24}>
          <Card title="Pedidos em andamento" bordered={false}>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={pedidosAndamento}
              loading={loading}
              pagination={false}
              locale={{
                emptyText: loading ? 'Carregando...' : <Empty description="Nenhum pedido em andamento" />,
              }}
              scroll={{ x: 760 }}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}