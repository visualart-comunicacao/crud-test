import { Typography } from 'antd'

const { Title, Text } = Typography

export default function PageTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Title level={3} style={{ color: '#fff', marginBottom: 0 }}>
        {title}
      </Title>
      {subtitle && <Text style={{ color: '#bfbfbf' }}>{subtitle}</Text>}
    </div>
  )
}