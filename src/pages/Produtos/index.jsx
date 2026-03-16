import { useEffect, useMemo, useState } from 'react'
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
  Spin,
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
import http from '@/api/http'

const { Title, Text } = Typography
const { TextArea } = Input

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function Produtos() {
  const [tabAtiva, setTabAtiva] = useState('produtos')

  const [categorias, setCategorias] = useState([])
  const [adicionais, setAdicionais] = useState([])
  const [produtos, setProdutos] = useState([])
  const [combos, setCombos] = useState([])

  const [loadingPage, setLoadingPage] = useState(true)
  const [savingProduto, setSavingProduto] = useState(false)
  const [savingCategoria, setSavingCategoria] = useState(false)
  const [savingAdicional, setSavingAdicional] = useState(false)
  const [savingCombo, setSavingCombo] = useState(false)

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

  async function carregarTudo() {
    try {
      setLoadingPage(true)

      const [categoriasRes, adicionaisRes, produtosRes, combosRes] = await Promise.all([
        http.get('/categories'),
        http.get('/additionals'),
        http.get('/products'),
        http.get('/combos'),
      ])

      setCategorias(categoriasRes.data || [])
      setAdicionais(adicionaisRes.data || [])
      setProdutos(produtosRes.data || [])
      setCombos(combosRes.data || [])
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível carregar os dados.')
    } finally {
      setLoadingPage(false)
    }
  }

  useEffect(() => {
    carregarTudo()
  }, [])

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const texto = busca.toLowerCase()

      const matchBusca =
        produto.nome?.toLowerCase().includes(texto) ||
        (produto.descricao || '').toLowerCase().includes(texto) ||
        (produto.categoriaNome || '').toLowerCase().includes(texto)

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
      .filter((categoria) => categoria.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .forEach((categoria) => {
        grupos[categoria.id] = {
          id: categoria.id,
          nome: categoria.name,
          ordem: categoria.sortOrder,
          ativo: categoria.isActive,
          produtos: produtosFiltrados.filter(
            (produto) => String(produto.categoriaId) === String(categoria.id),
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
      setSavingProduto(true)

      const payload = {
        nome: values.nome,
        descricao: values.descricao || '',
        categoriaId: values.categoriaId,
        preco: values.preco,
        tempoPreparo: values.tempoPreparo,
        ativo: values.ativo,
        disponivelSalao: values.disponivelSalao,
        disponivelDelivery: values.disponivelDelivery,
        disponivelBalcao: values.disponivelBalcao,
        destaque: values.destaque,
        adicionalIds: values.adicionalIds || [],
        imagem: values.imagem || '',
      }

      if (produtoEditando) {
        const { data } = await http.put(`/products/${produtoEditando.id}`, payload)
        setProdutos((prev) =>
          prev.map((item) => (item.id === produtoEditando.id ? data : item)),
        )
        message.success('Produto atualizado com sucesso')
      } else {
        const { data } = await http.post('/products', payload)
        setProdutos((prev) => [data, ...prev])
        message.success('Produto cadastrado com sucesso')
      }

      setModalProdutoOpen(false)
      setProdutoEditando(null)
      formProduto.resetFields()
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível salvar o produto.')
      }
    } finally {
      setSavingProduto(false)
    }
  }

  const salvarCategoria = async () => {
    try {
      const values = await formCategoria.validateFields()
      setSavingCategoria(true)

      const { data } = await http.post('/categories', {
        nome: values.nome,
        ordem: values.ordem,
      })

      setCategorias((prev) => [...prev, data])
      setModalCategoriaOpen(false)
      formCategoria.resetFields()
      message.success('Categoria cadastrada com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível salvar a categoria.')
      }
    } finally {
      setSavingCategoria(false)
    }
  }

  const salvarAdicional = async () => {
    try {
      const values = await formAdicional.validateFields()
      setSavingAdicional(true)

      const { data } = await http.post('/additionals', {
        nome: values.nome,
        preco: values.preco,
      })

      setAdicionais((prev) => [...prev, data])
      setModalAdicionalOpen(false)
      formAdicional.resetFields()
      message.success('Adicional cadastrado com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível salvar o adicional.')
      }
    } finally {
      setSavingAdicional(false)
    }
  }

  const salvarCombo = async () => {
    try {
      const values = await formCombo.validateFields()
      setSavingCombo(true)

      const { data } = await http.post('/combos', {
        nome: values.nome,
        descricao: values.descricao,
        preco: values.preco,
        itemIds: values.itemIds || [],
      })

      setCombos((prev) => [...prev, data])
      setModalComboOpen(false)
      formCombo.resetFields()
      message.success('Combo cadastrado com sucesso')
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.response?.data?.message || 'Não foi possível salvar o combo.')
      }
    } finally {
      setSavingCombo(false)
    }
  }

  const alternarStatusProduto = async (produto) => {
    try {
      const { data } = await http.patch(`/products/${produto.id}/status`)
      setProdutos((prev) => prev.map((item) => (item.id === produto.id ? data : item)))
      message.success(`Produto ${produto.ativo ? 'inativado' : 'ativado'} com sucesso`)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível alterar o produto.')
    }
  }

  const alternarStatusCategoria = async (categoria) => {
    try {
      const { data } = await http.patch(`/categories/${categoria.id}/status`)
      setCategorias((prev) =>
        prev.map((item) => (item.id === categoria.id ? data : item)),
      )
      message.success(
        `Categoria ${categoria.isActive ? 'inativada' : 'ativada'} com sucesso`,
      )
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível alterar a categoria.')
    }
  }

  const alternarStatusAdicional = async (adicional) => {
    try {
      const { data } = await http.patch(`/additionals/${adicional.id}/status`)
      setAdicionais((prev) =>
        prev.map((item) => (item.id === adicional.id ? data : item)),
      )
      message.success(
        `Adicional ${adicional.isActive ? 'inativado' : 'ativado'} com sucesso`,
      )
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível alterar o adicional.')
    }
  }

  const alternarStatusCombo = async (combo) => {
    try {
      const { data } = await http.patch(`/combos/${combo.id}/status`)
      setCombos((prev) => prev.map((item) => (item.id === combo.id ? data : item)))
      message.success(`Combo ${combo.ativo ? 'inativado' : 'ativado'} com sucesso`)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Não foi possível alterar o combo.')
    }
  }

  const categoriasColumns = [
    {
      title: 'Categoria',
      dataIndex: 'name',
    },
    {
      title: 'Ordem',
      dataIndex: 'sortOrder',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
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
          title={record.isActive ? 'Inativar categoria?' : 'Ativar categoria?'}
          onConfirm={() => alternarStatusCategoria(record)}
        >
          <Button>{record.isActive ? 'Inativar' : 'Ativar'}</Button>
        </Popconfirm>
      ),
    },
  ]

  const adicionaisColumns = [
    {
      title: 'Adicional',
      dataIndex: 'name',
    },
    {
      title: 'Preço extra',
      dataIndex: 'price',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
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
          title={record.isActive ? 'Inativar adicional?' : 'Ativar adicional?'}
          onConfirm={() => alternarStatusAdicional(record)}
        >
          <Button>{record.isActive ? 'Inativar' : 'Ativar'}</Button>
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
                      label: item.name,
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
                .filter((item) => item.isActive)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((item) => (
                  <Button
                    key={item.id}
                    type={categoriaVisual === String(item.id) ? 'primary' : 'default'}
                    onClick={() => setCategoriaVisual(String(item.id))}
                  >
                    {item.name}
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
                                {produto.destaque && <Tag color="magenta">Destaque</Tag>}
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
                                    produto.ativo ? 'Inativar produto?' : 'Ativar produto?'
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

  if (loadingPage) {
    return (
      <>
        <PageTitle
          title="Produtos"
          subtitle="Gestão do cardápio, categorias, adicionais e combos"
        />
        <Card bordered={false}>
          <div
            style={{
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        </Card>
      </>
    )
  }

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
        confirmLoading={savingProduto}
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
                    .filter((item) => item.isActive)
                    .map((item) => ({
                      label: item.name,
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
                    .filter((item) => item.isActive)
                    .map((item) => ({
                      label: `${item.name} • ${formatCurrency(item.price)}`,
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
        confirmLoading={savingCategoria}
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
        confirmLoading={savingAdicional}
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
        confirmLoading={savingCombo}
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