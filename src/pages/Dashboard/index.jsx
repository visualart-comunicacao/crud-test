import { Row, Col, Card, Table, Tag } from 'antd'
import PageTitle from '../../components/common/PageTitle'
import StatCard from '../../components/common/StatCard'

export default function Dashboard() {
  const columns = [
    {
      title: 'Pedido',
      dataIndex: 'pedido',
    },
    {
      title: 'Cliente/Mesa',
      dataIndex: 'cliente',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        const colorMap = {
          Novo: 'gold',
          Preparo: 'orange',
          Pronto: 'green',
          Entrega: 'blue',
        }

        return <Tag color={colorMap[status]}>{status}</Tag>
      },
    },
  ]

  const data = [
    { key: 1, pedido: '#1024', cliente: 'Mesa 03', status: 'Novo' },
    { key: 2, pedido: '#1025', cliente: 'Mesa 07', status: 'Preparo' },
    { key: 3, pedido: '#1026', cliente: 'João - Delivery', status: 'Entrega' },
  ]

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Visão geral da operação da espetaria"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <StatCard title="Faturamento do dia" value={2450.9} prefix="R$" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatCard title="Pedidos hoje" value={87} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatCard title="Comandas abertas" value={14} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatCard title="Delivery em andamento" value={6} />
        </Col>

        <Col span={24}>
          <Card title="Pedidos em andamento" bordered={false}>
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}