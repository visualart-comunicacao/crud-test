import { Card } from 'antd'
import PageTitle from '../../components/common/PageTitle'

export default function Configuracoes() {
  return (
    <>
      <PageTitle
        title="Configurações"
        subtitle="Parâmetros gerais do sistema"
      />
      <Card bordered={false}>Tela de configurações</Card>
    </>
  )
}