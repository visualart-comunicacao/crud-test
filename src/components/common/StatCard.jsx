import { Card, Statistic } from 'antd'

export default function StatCard({ title, value, prefix, suffix }) {
  return (
    <Card bordered={false}>
      <Statistic title={title} value={value} prefix={prefix} suffix={suffix} />
    </Card>
  )
}