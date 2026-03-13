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
  Statistic,
  Switch,
  Tabs,
  Table,
  Modal,
  Form,
  InputNumber,
  Divider,
  message,
  Popconfirm,
  Checkbox,
  List,
  Empty,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  AppstoreOutlined,
  TagsOutlined,
  GiftOutlined,
  ShopOutlined,
  CoffeeOutlined,
} from '@ant-design/icons'
import PageTitle from '../../components/common/PageTitle'

const { Title, Text } = Typography
const { TextArea } = Input

const categoriasIniciais = [
  { id: 1, nome: 'Espetos', ativo: true, ordem: 1 },
  { id: 2, nome: 'Porções', ativo: true, ordem: 2 },
  { id: 3, nome: 'Bebidas', ativo: true, ordem: 3 },
  { id: 4, nome: 'Acompanhamentos', ativo: true, ordem: 4 },
  { id: 5, nome: 'Entradas', ativo: true, ordem: 5 },
]

const adicionaisIniciais = [
  { id: 1, nome: 'Pimenta', preco: 0, ativo: true },
  { id: 2, nome: 'Farofa extra', preco: 3, ativo: true },
  { id: 3, nome: 'Molho barbecue', preco: 2, ativo: true },
  { id: 4, nome: 'Sem cebola', preco: 0, ativo: true },
  { id: 5, nome: 'Queijo extra', preco: 4, ativo: true },
  { id: 6, nome: 'Bacon', preco: 5, ativo: true },
]

const produtosIniciais = [
  {
    id: 1,
    nome: 'Espeto de Carne',
    descricao: 'Espeto tradicional bovino',
    categoriaId: 1,
    categoriaNome: 'Espetos',
    preco: 12,
    tempoPreparo: 12,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [1, 2, 4],
    destaque: true,
  },
  {
    id: 2,
    nome: 'Espeto de Frango',
    descricao: 'Espeto de frango temperado',
    categoriaId: 1,
    categoriaNome: 'Espetos',
    preco: 11,
    tempoPreparo: 10,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [1, 4],
    destaque: false,
  },
  {
    id: 3,
    nome: 'Espeto Medalhão',
    descricao: 'Medalhão especial da casa',
    categoriaId: 1,
    categoriaNome: 'Espetos',
    preco: 15,
    tempoPreparo: 15,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: false,
    adicionalIds: [2, 3],
    destaque: true,
  },
  {
    id: 4,
    nome: 'Porção de Fritas',
    descricao: 'Porção crocante',
    categoriaId: 2,
    categoriaNome: 'Porções',
    preco: 18.9,
    tempoPreparo: 18,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [5, 6],
    destaque: false,
  },
  {
    id: 5,
    nome: 'Linguiça Acebolada',
    descricao: 'Linguiça com cebola refogada',
    categoriaId: 2,
    categoriaNome: 'Porções',
    preco: 22,
    tempoPreparo: 20,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [4],
    destaque: false,
  },
  {
    id: 6,
    nome: 'Coca-Cola 600ml',
    descricao: 'Refrigerante gelado',
    categoriaId: 3,
    categoriaNome: 'Bebidas',
    preco: 7.5,
    tempoPreparo: 2,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
  },
]

const combosIniciais = [
  {
    id: 1,
    nome: 'Combo Casal',
    descricao: '2 espetos + 1 porção + 2 bebidas',
    preco: 44.9,
    ativo: true,
    itemIds: [1, 2, 4, 6],
  },
  {
    id: 2,
    nome: 'Combo Família',
    descricao: '4 espetos + 1 porção grande + refrigerante',
    preco: 79.9,
    ativo: true,
    itemIds: [1, 2, 3, 4, 6],
  },
]

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function Produtos() {
  const [tabAtiva, setTabAtiva] = useState('produtos')

  const [categorias, setCategorias] = useState(categoriasIniciais)
  const [adicionais, setAdicionais] = useState(adicionaisIniciais)
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [combos, setCombos] = useState(combosIniciais)

  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroCanal, setFiltroCanal] = useState('todos')

  const [modalProdutoOpen, setModalProdutoOpen] = useState(false)
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false)
  const [modalAdicionalOpen, setModalAdicionalOpen] = useState(false)
  const [modalComboOpen, setModalComboOpen] = useState(false)

  const [produtoEditando, setProdutoEditando] = useState(null)

  const [formProduto] = Form.useForm()
  const [formCategoria] = Form.useForm()
  const [formAdicional] = Form.useForm()
  const [formCombo] = Form.useForm()

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const texto = busca.toLowerCase()

      const matchBusca =
        produto.nome.toLowerCase().includes(texto) ||
        produto.descricao.toLowerCase().includes(texto) ||
        produto.categoriaNome.toLowerCase().includes(texto)

      const matchCategoria =
        filtroCategoria === 'todas'
          ? true
          : String(produto.categoriaId) === String(filtroCategoria)

      const matchStatus =
        filtroStatus === 'todos'
          ? true
          : filtroStatus === 'ativos'
          ? produto.ativo
          : !produto.ativo

      const matchCanal =
        filtroCanal === 'todos'
          ? true
          : filtroCanal === 'salao'
          ? produto.disponivelSalao
          : filtroCanal === 'delivery'
          ? produto.disponivelDelivery
          : produto.disponivelBalcao

      return matchBusca && matchCategoria && matchStatus && matchCanal
    })
  }, [produtos, busca, filtroCategoria, filtroStatus, filtroCanal])

  const resumo = useMemo(() => {
    return {
      produtos: produtos.length,
      ativos: produtos.filter((item) => item.ativo).length,
      categorias: categorias.length,
      combos: combos.length,
      adicionais: adicionais.length,
      delivery: produtos.filter((item) => item.disponivelDelivery).length,
    }
  }, [produtos, categorias, combos, adicionais])

  const abrirNovoProduto = () => {
    setProdutoEditando(null)
    formProduto.resetFields()
    formProduto.setFieldsValue({
      ativo: true,
      disponivelSalao: true,
      disponivelDelivery: true,
      disponivelBalcao: true,
      destaque: false,
      adicionalIds: [],
      tempoPreparo: 10,
    })
    setModalProdutoOpen(true)
  }

  const abrirEditarProduto = (produto) => {
    setProdutoEditando(produto)
    formProduto.resetFields()
    formProduto.setFieldsValue({
      nome: produto.nome,
      descricao: produto.descricao,
      categoriaId: produto.categoriaId,
      preco: produto.preco,
      tempoPreparo: produto.tempoPreparo,
      ativo: produto.ativo,
      disponivelSalao: produto.disponivelSalao,
      disponivelDelivery: produto.disponivelDelivery,
      disponivelBalcao: produto.disponivelBalcao,
      destaque: produto.destaque,
      adicionalIds: produto.adicionalIds || [],
    })
    setModalProdutoOpen(true)
  }

  const salvarProduto = async () => {
    try {
      const values = await formProduto.validateFields()
      const categoria = categorias.find((item) => item.id === values.categoriaId)

      if (!categoria) {
        message.error('Categoria inválida')
        return
      }

      if (produtoEditando) {
        setProdutos((prev) =>
          prev.map((item) =>
            item.id === produtoEditando.id
              ? {
                  ...item,
                  ...values,
                  categoriaNome: categoria.nome,
                }
              : item
          )
        )
        message.success('Produto atualizado com sucesso')
      } else {
        const novoProduto = {
          id: Math.max(...produtos.map((item) => item.id), 0) + 1,
          ...values,
          categoriaNome: categoria.nome,
        }

        setProdutos((prev) => [novoProduto, ...prev])
        message.success('Produto cadastrado com sucesso')
      }

      setModalProdutoOpen(false)
      setProdutoEditando(null)
      formProduto.resetFields()
    } catch (error) {}
  }

  const salvarCategoria = async () => {
    try {
      const values = await formCategoria.validateFields()

      const novaCategoria = {
        id: Math.max(...categorias.map((item) => item.id), 0) + 1,
        nome: values.nome,
        ordem: values.ordem,
        ativo: true,
      }

      setCategorias((prev) => [...prev, novaCategoria])
      setModalCategoriaOpen(false)
      formCategoria.resetFields()
      message.success('Categoria cadastrada com sucesso')
    } catch (error) {}
  }

  const salvarAdicional = async () => {
    try {
      const values = await formAdicional.validateFields()

      const novoAdicional = {
        id: Math.max(...adicionais.map((item) => item.id), 0) + 1,
        nome: values.nome,
        preco: values.preco,
        ativo: true,
      }

      setAdicionais((prev) => [...prev, novoAdicional])
      setModalAdicionalOpen(false)
      formAdicional.resetFields()
      message.success('Adicional cadastrado com sucesso')
    } catch (error) {}
  }

  const salvarCombo = async () => {
    try {
      const values = await formCombo.validateFields()

      const novoCombo = {
        id: Math.max(...combos.map((item) => item.id), 0) + 1,
        nome: values.nome,
        descricao: values.descricao,
        preco: values.preco,
        ativo: true,
        itemIds: values.itemIds || [],
      }

      setCombos((prev) => [...prev, novoCombo])
      setModalComboOpen(false)
      formCombo.resetFields()
      message.success('Combo cadastrado com sucesso')
    } catch (error) {}
  }

  const alternarStatusProduto = (produto) => {
    setProdutos((prev) =>
      prev.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              ativo: !item.ativo,
            }
          : item
      )
    )
    message.success(`Produto ${produto.ativo ? 'inativado' : 'ativado'} com sucesso`)
  }

  const alternarStatusCategoria = (categoria) => {
    setCategorias((prev) =>
      prev.map((item) =>
        item.id === categoria.id
          ? {
              ...item,
              ativo: !item.ativo,
            }
          : item
      )
    )
    message.success(`Categoria ${categoria.ativo ? 'inativada' : 'ativada'} com sucesso`)
  }

  const alternarStatusAdicional = (adicional) => {
    setAdicionais((prev) =>
      prev.map((item) =>
        item.id === adicional.id
          ? {
              ...item,
              ativo: !item.ativo,
            }
          : item
      )
    )
    message.success(`Adicional ${adicional.ativo ? 'inativado' : 'ativado'} com sucesso`)
  }

  const alternarStatusCombo = (combo) => {
    setCombos((prev) =>
      prev.map((item) =>
        item.id === combo.id
          ? {
              ...item,
              ativo: !item.ativo,
            }
          : item
      )
    )
    message.success(`Combo ${combo.ativo ? 'inativado' : 'ativado'} com sucesso`)
  }

  const produtosColumns = [
    {
      title: 'Produto',
      dataIndex: 'nome',
      render: (_, record) => (
        <div>
          <Text style={{ color: '#fff', fontWeight: 600 }}>{record.nome}</Text>
          <div>
            <Text style={{ color: '#8c8c8c', fontSize: 12 }}>{record.descricao}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoriaNome',
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: 'Preço',
      dataIndex: 'preco',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Preparo',
      dataIndex: 'tempoPreparo',
      render: (value) => `${value} min`,
    },
    {
      title: 'Canais',
      render: (_, record) => (
        <Space wrap>
          {record.disponivelSalao && <Tag color="blue">Salão</Tag>}
          {record.disponivelDelivery && <Tag color="green">Delivery</Tag>}
          {record.disponivelBalcao && <Tag color="gold">Balcão</Tag>}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      render: (ativo) => (
        <Tag color={ativo ? 'success' : 'default'}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => abrirEditarProduto(record)}>
            Editar
          </Button>

          <Popconfirm
            title={record.ativo ? 'Inativar produto?' : 'Ativar produto?'}
            onConfirm={() => alternarStatusProduto(record)}
          >
            <Button>{record.ativo ? 'Inativar' : 'Ativar'}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const categoriasColumns = [
    {
      title: 'Categoria',
      dataIndex: 'nome',
    },
    {
      title: 'Ordem',
      dataIndex: 'ordem',
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      render: (ativo) => (
        <Tag color={ativo ? 'success' : 'default'}>
          {ativo ? 'Ativa' : 'Inativa'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      render: (_, record) => (
        <Popconfirm
          title={record.ativo ? 'Inativar categoria?' : 'Ativar categoria?'}
          onConfirm={() => alternarStatusCategoria(record)}
        >
          <Button>{record.ativo ? 'Inativar' : 'Ativar'}</Button>
        </Popconfirm>
      ),
    },
  ]

  const adicionaisColumns = [
    {
      title: 'Adicional',
      dataIndex: 'nome',
    },
    {
      title: 'Preço extra',
      dataIndex: 'preco',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      render: (ativo) => (
        <Tag color={ativo ? 'success' : 'default'}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      render: (_, record) => (
        <Popconfirm
          title={record.ativo ? 'Inativar adicional?' : 'Ativar adicional?'}
          onConfirm={() => alternarStatusAdicional(record)}
        >
          <Button>{record.ativo ? 'Inativar' : 'Ativar'}</Button>
        </Popconfirm>
      ),
    },
  ]

  const combosColumns = [
    {
      title: 'Combo',
      dataIndex: 'nome',
      render: (_, record) => (
        <div>
          <Text style={{ color: '#fff', fontWeight: 600 }}>{record.nome}</Text>
          <div>
            <Text style={{ color: '#8c8c8c', fontSize: 12 }}>{record.descricao}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'preco',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Itens',
      dataIndex: 'itemIds',
      render: (itemIds) => `${itemIds?.length || 0} itens`,
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      render: (ativo) => (
        <Tag color={ativo ? 'success' : 'default'}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      render: (_, record) => (
        <Popconfirm
          title={record.ativo ? 'Inativar combo?' : 'Ativar combo?'}
          onConfirm={() => alternarStatusCombo(record)}
        >
          <Button>{record.ativo ? 'Inativar' : 'Ativar'}</Button>
        </Popconfirm>
      ),
    },
  ]

  const itemsTabs = [
    {
      key: 'produtos',
      label: (
        <span>
          <ShopOutlined /> Produtos
        </span>
      ),
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 4 }}>
            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic title="Produtos" value={resumo.produtos} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic title="Ativos" value={resumo.ativos} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic title="Categorias" value={resumo.categorias} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic title="Adicionais" value={resumo.adicionais} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic title="Combos" value={resumo.combos} />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic title="No delivery" value={resumo.delivery} />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Input
                  allowClear
                  size="large"
                  placeholder="Buscar por nome, descrição ou categoria"
                  prefix={<SearchOutlined />}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </Col>

              <Col xs={24} md={5}>
                <Select
                  size="large"
                  style={{ width: '100%' }}
                  value={filtroCategoria}
                  onChange={setFiltroCategoria}
                  options={[
                    { label: 'Todas as categorias', value: 'todas' },
                    ...categorias.map((item) => ({
                      label: item.nome,
                      value: String(item.id),
                    })),
                  ]}
                />
              </Col>

              <Col xs={24} md={5}>
                <Select
                  size="large"
                  style={{ width: '100%' }}
                  value={filtroStatus}
                  onChange={setFiltroStatus}
                  options={[
                    { label: 'Todos os status', value: 'todos' },
                    { label: 'Ativos', value: 'ativos' },
                    { label: 'Inativos', value: 'inativos' },
                  ]}
                />
              </Col>

              <Col xs={24} md={3}>
                <Select
                  size="large"
                  style={{ width: '100%' }}
                  value={filtroCanal}
                  onChange={setFiltroCanal}
                  options={[
                    { label: 'Todos canais', value: 'todos' },
                    { label: 'Salão', value: 'salao' },
                    { label: 'Delivery', value: 'delivery' },
                    { label: 'Balcão', value: 'balcao' },
                  ]}
                />
              </Col>

              <Col xs={24} md={3}>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={abrirNovoProduto}
                >
                  Produto
                </Button>
              </Col>
            </Row>
          </Card>

          <Card bordered={false}>
            <Table
              rowKey="id"
              columns={produtosColumns}
              dataSource={produtosFiltrados}
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </>
      ),
    },
    {
      key: 'categorias',
      label: (
        <span>
          <AppstoreOutlined /> Categorias
        </span>
      ),
      children: (
        <Card
          bordered={false}
          title="Categorias do cardápio"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalCategoriaOpen(true)}
            >
              Nova categoria
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={categoriasColumns}
            dataSource={categorias}
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: 'adicionais',
      label: (
        <span>
          <TagsOutlined /> Adicionais
        </span>
      ),
      children: (
        <Card
          bordered={false}
          title="Adicionais dos produtos"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalAdicionalOpen(true)}
            >
              Novo adicional
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={adicionaisColumns}
            dataSource={adicionais}
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: 'combos',
      label: (
        <span>
          <GiftOutlined /> Combos
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card
              bordered={false}
              title="Combos promocionais"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalComboOpen(true)}
                >
                  Novo combo
                </Button>
              }
            >
              <Table
                rowKey="id"
                columns={combosColumns}
                dataSource={combos}
                pagination={false}
              />
            </Card>
          </Col>

          <Col xs={24} xl={10}>
            <Card bordered={false} title="Produtos disponíveis para combo">
              <List
                locale={{ emptyText: 'Nenhum produto encontrado' }}
                dataSource={produtos.filter((item) => item.ativo)}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <Text style={{ color: '#f5f5f5' }}>{item.nome}</Text>
                        <Text style={{ color: '#fff', fontWeight: 700 }}>
                          {formatCurrency(item.preco)}
                        </Text>
                      </div>

                      <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                        {item.categoriaNome}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <>
      <PageTitle
        title="Produtos"
        subtitle="Gestão do cardápio, categorias, adicionais e combos"
      />

      <Card bordered={false}>
        <Tabs activeKey={tabAtiva} onChange={setTabAtiva} items={itemsTabs} />
      </Card>

      <Modal
        title={produtoEditando ? 'Editar produto' : 'Novo produto'}
        open={modalProdutoOpen}
        onCancel={() => {
          setModalProdutoOpen(false)
          setProdutoEditando(null)
        }}
        onOk={salvarProduto}
        okText={produtoEditando ? 'Salvar alterações' : 'Cadastrar produto'}
        cancelText="Cancelar"
        width={760}
      >
        <Form form={formProduto} layout="vertical">
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nome"
                name="nome"
                rules={[{ required: true, message: 'Informe o nome do produto' }]}
              >
                <Input placeholder="Nome do produto" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Categoria"
                name="categoriaId"
                rules={[{ required: true, message: 'Selecione a categoria' }]}
              >
                <Select
                  placeholder="Selecione a categoria"
                  options={categorias
                    .filter((item) => item.ativo)
                    .map((item) => ({
                      label: item.nome,
                      value: item.id,
                    }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Descrição" name="descricao">
                <TextArea rows={3} placeholder="Descrição do produto" />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Preço"
                name="preco"
                rules={[{ required: true, message: 'Informe o preço' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Tempo de preparo"
                name="tempoPreparo"
                rules={[{ required: true, message: 'Informe o tempo' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Adicionais permitidos" name="adicionalIds">
                <Select
                  mode="multiple"
                  placeholder="Selecionar adicionais"
                  options={adicionais
                    .filter((item) => item.ativo)
                    .map((item) => ({
                      label: `${item.nome} • ${formatCurrency(item.preco)}`,
                      value: item.id,
                    }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Divider style={{ borderColor: '#262626', margin: '8px 0 16px' }} />
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="ativo" valuePropName="checked">
                <Checkbox>Produto ativo</Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="destaque" valuePropName="checked">
                <Checkbox>Produto em destaque</Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item name="disponivelSalao" valuePropName="checked">
                <Checkbox>Salão</Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item name="disponivelDelivery" valuePropName="checked">
                <Checkbox>Delivery</Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item name="disponivelBalcao" valuePropName="checked">
                <Checkbox>Balcão</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Nova categoria"
        open={modalCategoriaOpen}
        onCancel={() => setModalCategoriaOpen(false)}
        onOk={salvarCategoria}
        okText="Salvar categoria"
        cancelText="Cancelar"
      >
        <Form form={formCategoria} layout="vertical">
          <Form.Item
            label="Nome"
            name="nome"
            rules={[{ required: true, message: 'Informe o nome da categoria' }]}
          >
            <Input placeholder="Nome da categoria" />
          </Form.Item>

          <Form.Item
            label="Ordem"
            name="ordem"
            rules={[{ required: true, message: 'Informe a ordem' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Novo adicional"
        open={modalAdicionalOpen}
        onCancel={() => setModalAdicionalOpen(false)}
        onOk={salvarAdicional}
        okText="Salvar adicional"
        cancelText="Cancelar"
      >
        <Form form={formAdicional} layout="vertical">
          <Form.Item
            label="Nome"
            name="nome"
            rules={[{ required: true, message: 'Informe o nome do adicional' }]}
          >
            <Input placeholder="Nome do adicional" />
          </Form.Item>

          <Form.Item
            label="Preço extra"
            name="preco"
            rules={[{ required: true, message: 'Informe o preço' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Novo combo"
        open={modalComboOpen}
        onCancel={() => setModalComboOpen(false)}
        onOk={salvarCombo}
        okText="Salvar combo"
        cancelText="Cancelar"
      >
        <Form form={formCombo} layout="vertical">
          <Form.Item
            label="Nome"
            name="nome"
            rules={[{ required: true, message: 'Informe o nome do combo' }]}
          >
            <Input placeholder="Nome do combo" />
          </Form.Item>

          <Form.Item label="Descrição" name="descricao">
            <TextArea rows={3} placeholder="Descrição do combo" />
          </Form.Item>

          <Form.Item
            label="Preço"
            name="preco"
            rules={[{ required: true, message: 'Informe o preço do combo' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Itens do combo"
            name="itemIds"
            rules={[{ required: true, message: 'Selecione ao menos um item' }]}
          >
            <Select
              mode="multiple"
              placeholder="Selecionar produtos"
              options={produtos
                .filter((item) => item.ativo)
                .map((item) => ({
                  label: `${item.nome} • ${formatCurrency(item.preco)}`,
                  value: item.id,
                }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}