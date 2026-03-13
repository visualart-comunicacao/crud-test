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
} from '@ant-design/icons'
import PageTitle from '../../components/common/PageTitle'

const { Title, Text } = Typography
const { TextArea } = Input

const categoriasIniciais = [
  { id: 1, nome: 'Bebidas', ativo: true, ordem: 1 },
  { id: 2, nome: 'Pratos Quentes', ativo: true, ordem: 2 },
  { id: 3, nome: 'Pratos Frios', ativo: true, ordem: 3 },
  { id: 4, nome: 'Guarnições', ativo: true, ordem: 4 },
  { id: 5, nome: 'Acompanhamentos', ativo: true, ordem: 5 },
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
    nome: 'Coca-Cola 600ml',
    descricao: 'Refrigerante gelado',
    categoriaId: 1,
    categoriaNome: 'Bebidas',
    preco: 7.5,
    tempoPreparo: 2,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    nome: 'Suco Natural',
    descricao: 'Suco natural da fruta',
    categoriaId: 1,
    categoriaNome: 'Bebidas',
    preco: 9,
    tempoPreparo: 4,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    nome: 'Espeto de Carne',
    descricao: 'Espeto tradicional bovino',
    categoriaId: 2,
    categoriaNome: 'Pratos Quentes',
    preco: 12,
    tempoPreparo: 12,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [1, 2, 4],
    destaque: true,
    imagem: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    nome: 'Linguiça Acebolada',
    descricao: 'Linguiça acebolada da casa',
    categoriaId: 2,
    categoriaNome: 'Pratos Quentes',
    preco: 22,
    tempoPreparo: 20,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [4],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    nome: 'Vinagrete',
    descricao: 'Vinagrete fresco',
    categoriaId: 3,
    categoriaNome: 'Pratos Frios',
    preco: 5,
    tempoPreparo: 3,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    nome: 'Maionese Caseira',
    descricao: 'Maionese especial da casa',
    categoriaId: 3,
    categoriaNome: 'Pratos Frios',
    preco: 8,
    tempoPreparo: 4,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: false,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 7,
    nome: 'Batata Frita',
    descricao: 'Batata crocante',
    categoriaId: 4,
    categoriaNome: 'Guarnições',
    preco: 18.9,
    tempoPreparo: 18,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [5, 6],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 8,
    nome: 'Farofa Especial',
    descricao: 'Farofa bem temperada',
    categoriaId: 4,
    categoriaNome: 'Guarnições',
    preco: 12,
    tempoPreparo: 5,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 9,
    nome: 'Molho Barbecue',
    descricao: 'Molho especial',
    categoriaId: 5,
    categoriaNome: 'Acompanhamentos',
    preco: 2,
    tempoPreparo: 1,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 10,
    nome: 'Pimenta',
    descricao: 'Pimenta extra',
    categoriaId: 5,
    categoriaNome: 'Acompanhamentos',
    preco: 0,
    tempoPreparo: 1,
    ativo: true,
    disponivelSalao: true,
    disponivelDelivery: true,
    disponivelBalcao: true,
    adicionalIds: [],
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1583225157630-5f55a4f1f4d8?auto=format&fit=crop&w=800&q=80',
  },
]

const combosIniciais = [
  {
    id: 1,
    nome: 'Combo Casal',
    descricao: '2 pratos quentes + 1 guarnição + 2 bebidas',
    preco: 44.9,
    ativo: true,
    itemIds: [1, 3, 7],
  },
  {
    id: 2,
    nome: 'Combo Família',
    descricao: 'Itens variados para compartilhar',
    preco: 79.9,
    ativo: true,
    itemIds: [2, 3, 4, 7, 8],
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
  const [categoriaVisual, setCategoriaVisual] = useState('todas')

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
        (produto.descricao || '').toLowerCase().includes(texto) ||
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

      const matchCategoriaVisual =
        categoriaVisual === 'todas'
          ? true
          : String(produto.categoriaId) === String(categoriaVisual)

      return (
        matchBusca &&
        matchCategoria &&
        matchStatus &&
        matchCanal &&
        matchCategoriaVisual
      )
    })
  }, [produtos, busca, filtroCategoria, filtroStatus, filtroCanal, categoriaVisual])

  const produtosAgrupados = useMemo(() => {
    const grupos = {}

    categorias
      .filter((categoria) => categoria.ativo)
      .sort((a, b) => a.ordem - b.ordem)
      .forEach((categoria) => {
        grupos[categoria.id] = {
          ...categoria,
          produtos: produtosFiltrados.filter(
            (produto) => produto.categoriaId === categoria.id
          ),
        }
      })

    return Object.values(grupos)
  }, [categorias, produtosFiltrados])

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
      imagem: '',
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
      imagem: produto.imagem || '',
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
    message.success(
      `Categoria ${categoria.ativo ? 'inativada' : 'ativada'} com sucesso`
    )
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
    message.success(
      `Adicional ${adicional.ativo ? 'inativado' : 'ativado'} com sucesso`
    )
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

              <Col xs={24} md={4}>
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

              <Col xs={24} md={4}>
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

            <Divider style={{ borderColor: '#262626' }} />

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Button
                type={categoriaVisual === 'todas' ? 'primary' : 'default'}
                onClick={() => setCategoriaVisual('todas')}
              >
                Todos
              </Button>

              {categorias
                .filter((item) => item.ativo)
                .sort((a, b) => a.ordem - b.ordem)
                .map((item) => (
                  <Button
                    key={item.id}
                    type={categoriaVisual === String(item.id) ? 'primary' : 'default'}
                    onClick={() => setCategoriaVisual(String(item.id))}
                  >
                    {item.nome}
                  </Button>
                ))}
            </div>
          </Card>

          <Card bordered={false}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {produtosAgrupados.map((grupo) => (
                <div key={grupo.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Title level={3} style={{ color: '#fff', margin: 0 }}>
                      {grupo.nome}
                    </Title>

                    <Tag style={{ fontSize: 14, padding: '4px 10px' }}>
                      {grupo.produtos.length} itens
                    </Tag>
                  </div>

                  {grupo.produtos.length ? (
                    <Row gutter={[16, 16]}>
                      {grupo.produtos.map((produto) => (
                        <Col xs={24} md={12} xl={8} key={produto.id}>
                          <Card
                            bordered={false}
                            style={{
                              background: '#171717',
                              border: produto.ativo
                                ? '1px solid #262626'
                                : '1px solid #434343',
                              minHeight: 380,
                            }}
                          >
                            <Space direction="vertical" size={10} style={{ width: '100%' }}>
                              <div
                                style={{
                                  width: '100%',
                                  height: 140,
                                  borderRadius: 12,
                                  overflow: 'hidden',
                                  background: '#111111',
                                  border: '1px solid #262626',
                                  marginBottom: 4,
                                }}
                              >
                                {produto.imagem ? (
                                  <img
                                    src={produto.imagem}
                                    alt={produto.nome}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#8c8c8c',
                                      fontSize: 14,
                                    }}
                                  >
                                    Sem imagem
                                  </div>
                                )}
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: 12,
                                  alignItems: 'flex-start',
                                }}
                              >
                                <div>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 18,
                                      fontWeight: 700,
                                      display: 'block',
                                    }}
                                  >
                                    {produto.nome}
                                  </Text>
                                  <Text style={{ color: '#8c8c8c' }}>
                                    {produto.descricao}
                                  </Text>
                                </div>

                                <Tag color={produto.ativo ? 'success' : 'default'}>
                                  {produto.ativo ? 'Ativo' : 'Inativo'}
                                </Tag>
                              </div>

                              <div>
                                <Text style={{ color: '#bfbfbf' }}>Preço</Text>
                                <div>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 22,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {formatCurrency(produto.preco)}
                                  </Text>
                                </div>
                              </div>

                              <div>
                                <Text style={{ color: '#bfbfbf' }}>Tempo de preparo</Text>
                                <div>
                                  <Text style={{ color: '#fff' }}>
                                    {produto.tempoPreparo} min
                                  </Text>
                                </div>
                              </div>

                              <Space wrap>
                                {produto.disponivelSalao && <Tag color="blue">Salão</Tag>}
                                {produto.disponivelDelivery && (
                                  <Tag color="green">Delivery</Tag>
                                )}
                                {produto.disponivelBalcao && (
                                  <Tag color="gold">Balcão</Tag>
                                )}
                                {produto.destaque && (
                                  <Tag color="magenta">Destaque</Tag>
                                )}
                              </Space>

                              <Space style={{ marginTop: 8 }}>
                                <Button
                                  icon={<EditOutlined />}
                                  onClick={() => abrirEditarProduto(produto)}
                                >
                                  Editar
                                </Button>

                                <Popconfirm
                                  title={
                                    produto.ativo
                                      ? 'Inativar produto?'
                                      : 'Ativar produto?'
                                  }
                                  onConfirm={() => alternarStatusProduto(produto)}
                                >
                                  <Button>{produto.ativo ? 'Inativar' : 'Ativar'}</Button>
                                </Popconfirm>
                              </Space>
                            </Space>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Card
                      bordered={false}
                      style={{
                        background: '#141414',
                        border: '1px dashed #303030',
                      }}
                    >
                      <Empty description={`Nenhum produto em ${grupo.nome}`} />
                    </Card>
                  )}
                </div>
              ))}
            </Space>
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

            <Col xs={24}>
              <Form.Item label="Imagem (URL ou caminho)" name="imagem">
                <Input placeholder="https://... ou /produtos/espeto-carne.jpg" />
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