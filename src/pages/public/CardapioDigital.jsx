import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  FloatButton,
  Image,
  Input,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  SearchOutlined,
  ShoppingCartOutlined,
  WhatsAppOutlined,
  PlusOutlined,
  MinusOutlined,
  FireOutlined,
} from '@ant-design/icons'
import http from '@/api/http'

const { Title, Text, Paragraph } = Typography

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function normalizePhone(phone) {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '')
}

export default function CardapioDigital() {
  const [loading, setLoading] = useState(true)
  const [menu, setMenu] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('TODOS')
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([])

  useEffect(() => {
    loadMenu()
  }, [])

  async function loadMenu() {
    try {
      setLoading(true)
      const { data } = await http.get('/public/menu')
      setMenu(data)
    } catch (error) {
      console.error(error)
      message.error('Não foi possível carregar o cardápio')
    } finally {
      setLoading(false)
    }
  }

  const allCategories = useMemo(() => {
    const categories = menu?.categories || []
    return [
      { id: 'TODOS', name: 'Todos' },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    ]
  }, [menu])

  const filteredCategories = useMemo(() => {
    if (!menu?.categories?.length) return []

    const term = search.trim().toLowerCase()

    let categories = menu.categories

    if (selectedCategory !== 'TODOS') {
      categories = categories.filter((category) => category.id === selectedCategory)
    }

    return categories
      .map((category) => {
        let products = category.products || []

        if (term) {
          products = products.filter((product) => {
            const content = [
              product.name,
              product.description,
              category.name,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()

            return content.includes(term)
          })
        }

        return {
          ...category,
          products,
        }
      })
      .filter((category) => category.products.length > 0)
  }, [menu, search, selectedCategory])

  const highlightedProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    const items = menu?.highlights || []

    if (!term) return items

    return items.filter((item) => {
      const content = [item.name, item.description, item.categoryName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return content.includes(term)
    })
  }, [menu, search])

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  )

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    [cart]
  )

  function addToCart(product, categoryName) {
    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.id === product.id)

      if (existingIndex >= 0) {
        const clone = [...current]
        clone[existingIndex] = {
          ...clone[existingIndex],
          quantity: clone[existingIndex].quantity + 1,
        }
        return clone
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price || 0),
          quantity: 1,
          categoryName,
        },
      ]
    })

    message.success(`${product.name} adicionado ao pedido`)
  }

  function decreaseItem(itemId) {
    setCart((current) => {
      const item = current.find((entry) => entry.id === itemId)
      if (!item) return current

      if (item.quantity <= 1) {
        return current.filter((entry) => entry.id !== itemId)
      }

      return current.map((entry) =>
        entry.id === itemId
          ? { ...entry, quantity: entry.quantity - 1 }
          : entry
      )
    })
  }

  function increaseItem(itemId) {
    setCart((current) =>
      current.map((entry) =>
        entry.id === itemId
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry
      )
    )
  }

  function buildWhatsAppMessage() {
    if (!cart.length) {
      message.warning('Adicione pelo menos um item ao pedido')
      return ''
    }

    const companyName = menu?.company?.nomeFantasia || 'Restaurante'

    const lines = [
      `Olá! Quero fazer um pedido no *${companyName}*:`,
      '',
    ]

    cart.forEach((item, index) => {
      const subtotal = Number(item.price || 0) * item.quantity
      lines.push(
        `${index + 1}. *${item.name}*`,
        `   Quantidade: ${item.quantity}`,
        `   Unitário: ${formatMoney(item.price)}`,
        `   Subtotal: ${formatMoney(subtotal)}`
      )

      if (item.description) {
        lines.push(`   Obs.: ${item.description}`)
      }

      lines.push('')
    })

    lines.push(`*Total do pedido: ${formatMoney(cartTotal)}*`)
    lines.push('')
    lines.push('Pode me atender, por favor?')

    return lines.join('\n')
  }

  function sendToWhatsApp() {
    const whatsapp = normalizePhone(menu?.company?.whatsapp || menu?.company?.telefone)

    if (!whatsapp) {
      message.error('WhatsApp da empresa não configurado nas configurações')
      return
    }

    const text = buildWhatsAppMessage()
    if (!text) return

    const url = `https://wa.me/55${whatsapp}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const pageStyle = {
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #1c120d 0%, #241711 35%, #2b1c15 100%)',
    color: '#fff',
  }

  const sectionContainerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 16px',
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#1c120d',
        }}
      >
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text style={{ color: '#f5e6d3' }}>Carregando cardápio...</Text>
        </Space>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ ...sectionContainerStyle, paddingTop: 20, paddingBottom: 20 }}>
          <Space
            direction="vertical"
            size={18}
            style={{ width: '100%', textAlign: 'center' }}
          >
            <div>
              <Image
                src="/logo.jpeg"
                alt="Logo"
                preview={false}
                width={110}
                style={{
                  borderRadius: 999,
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
                  background: '#fff',
                }}
                fallback="/logo.jpeg"
              />
            </div>

            <Space direction="vertical" size={2}>
              <Title
                level={2}
                style={{
                  color: '#fff4e8',
                  margin: 0,
                }}
              >
                {menu?.company?.nomeFantasia || 'Cardápio Digital'}
              </Title>

              {!!menu?.company?.horarioFuncionamento && (
                <Text style={{ color: '#e8c9a8' }}>
                  {menu.company.horarioFuncionamento}
                </Text>
              )}

              {!!menu?.company?.enderecoCompleto && (
                <Text style={{ color: '#cfae8b' }}>
                  {menu.company.enderecoCompleto}
                </Text>
              )}
            </Space>

            <Input
              allowClear
              size="large"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Buscar espetos, porções, bebidas..."
              style={{
                maxWidth: 560,
                margin: '0 auto',
                borderRadius: 999,
                background: '#fffaf5',
              }}
            />
          </Space>
        </div>
      </div>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(28,18,13,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ ...sectionContainerStyle, paddingTop: 12, paddingBottom: 12 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'thin',
            }}
          >
            {allCategories.map((category) => {
              const active =
                selectedCategory === 'TODOS'
                  ? category.id === 'TODOS'
                  : selectedCategory === category.id

              return (
                <Button
                  key={category.id}
                  type={active ? 'primary' : 'default'}
                  shape="round"
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    flex: '0 0 auto',
                    fontWeight: 600,
                    borderColor: active ? '#d97706' : 'rgba(255,255,255,0.16)',
                    background: active ? '#d97706' : '#3a261d',
                    color: '#fff',
                    boxShadow: 'none',
                  }}
                >
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ ...sectionContainerStyle, paddingTop: 20, paddingBottom: 120 }}>
        {!!highlightedProducts.length && selectedCategory === 'TODOS' && !search && (
          <div style={{ marginBottom: 28 }}>
            <Space
              align="center"
              size={8}
              style={{ marginBottom: 14 }}
            >
              <FireOutlined style={{ color: '#f59e0b' }} />
              <Title level={3} style={{ color: '#fff1e5', margin: 0 }}>
                Destaques da brasa
              </Title>
            </Space>

            <Row gutter={[16, 16]}>
              {highlightedProducts.map((product) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={`highlight-${product.id}`}>
                  <Card
                    hoverable
                    styles={{ body: { padding: 14 } }}
                    style={{
                      borderRadius: 18,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background:
                        'linear-gradient(180deg, #3a2419 0%, #2d1c14 100%)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    }}
                    cover={
                      <div
                        style={{
                          height: 180,
                          background: '#20130f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              color: '#d9b38c',
                              fontSize: 15,
                              fontWeight: 600,
                            }}
                          >
                            {product.categoryName}
                          </div>
                        )}
                      </div>
                    }
                  >
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                      <div>
                        <Tag
                          color="orange"
                          style={{ borderRadius: 999, fontWeight: 600 }}
                        >
                          Destaque
                        </Tag>
                      </div>

                      <div>
                        <Text
                          strong
                          style={{ fontSize: 17, color: '#fff4e8', display: 'block' }}
                        >
                          {product.name}
                        </Text>
                        {!!product.description && (
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ color: '#d8b596', marginTop: 6, marginBottom: 0 }}
                          >
                            {product.description}
                          </Paragraph>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <Text
                          strong
                          style={{ fontSize: 18, color: '#ffd39b' }}
                        >
                          {formatMoney(product.price)}
                        </Text>

                        <Button
                          type="primary"
                          shape="round"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            addToCart(product, product.categoryName || 'Destaques')
                          }
                          style={{
                            background: '#b45309',
                            borderColor: '#b45309',
                            fontWeight: 700,
                          }}
                        >
                          Pedir
                        </Button>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {!filteredCategories.length ? (
          <Card
            style={{
              borderRadius: 18,
              background: '#2d1c14',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Empty
              description={
                <span style={{ color: '#eed4bc' }}>
                  Nenhum produto encontrado
                </span>
              }
            />
          </Card>
        ) : (
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <div
                  style={{
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <Title level={3} style={{ color: '#fff1e5', margin: 0 }}>
                    {category.name}
                  </Title>

                  <Tag
                    style={{
                      background: '#4a2f23',
                      borderColor: '#69402d',
                      color: '#f6d1a8',
                      borderRadius: 999,
                      paddingInline: 10,
                    }}
                  >
                    {category.products.length} item(ns)
                  </Tag>
                </div>

                <Row gutter={[16, 16]}>
                  {category.products.map((product) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                      <Card
                        hoverable
                        styles={{ body: { padding: 14 } }}
                        style={{
                          borderRadius: 18,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.08)',
                          background:
                            'linear-gradient(180deg, #352116 0%, #2a1a13 100%)',
                          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        }}
                        cover={
                          <div
                            style={{
                              height: 180,
                              background: '#20130f',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  color: '#d9b38c',
                                  fontSize: 15,
                                  fontWeight: 600,
                                }}
                              >
                                {category.name}
                              </div>
                            )}
                          </div>
                        }
                      >
                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                          <div style={{ minHeight: 58 }}>
                            <Text
                              strong
                              style={{ fontSize: 17, color: '#fff4e8', display: 'block' }}
                            >
                              {product.name}
                            </Text>

                            {!!product.description && (
                              <Paragraph
                                ellipsis={{ rows: 2 }}
                                style={{ color: '#d8b596', marginTop: 6, marginBottom: 0 }}
                              >
                                {product.description}
                              </Paragraph>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {product.isFeatured && (
                              <Tag color="orange" style={{ borderRadius: 999 }}>
                                Destaque
                              </Tag>
                            )}
                            {!!product.prepTimeMinutes && (
                              <Tag style={{ borderRadius: 999 }}>
                                {product.prepTimeMinutes} min
                              </Tag>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 12,
                            }}
                          >
                            <Text
                              strong
                              style={{ fontSize: 18, color: '#ffd39b' }}
                            >
                              {formatMoney(product.price)}
                            </Text>

                            <Button
                              type="primary"
                              shape="round"
                              icon={<PlusOutlined />}
                              onClick={() => addToCart(product, category.name)}
                              style={{
                                background: '#b45309',
                                borderColor: '#b45309',
                                fontWeight: 700,
                              }}
                            >
                              Pedir
                            </Button>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Space>
        )}
      </div>

      <FloatButton
        type="primary"
        icon={
          <Badge count={cartCount} size="small" offset={[2, -2]}>
            <ShoppingCartOutlined />
          </Badge>
        }
        onClick={() => setCartOpen(true)}
        style={{
          insetInlineEnd: 20,
          bottom: 24,
        }}
      />

      <Drawer
        title="Seu pedido"
        placement="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        width={420}
      >
        {!cart.length ? (
          <Empty description="Seu pedido está vazio" />
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {cart.map((item) => {
              const subtotal = Number(item.price || 0) * item.quantity

              return (
                <Card key={item.id} size="small">
                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ display: 'block' }}>
                        {item.name}
                      </Text>
                      {!!item.categoryName && (
                        <Text type="secondary">{item.categoryName}</Text>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Space>
                        <Button
                          shape="circle"
                          icon={<MinusOutlined />}
                          onClick={() => decreaseItem(item.id)}
                        />
                        <Text strong>{item.quantity}</Text>
                        <Button
                          shape="circle"
                          icon={<PlusOutlined />}
                          onClick={() => increaseItem(item.id)}
                        />
                      </Space>

                      <Text strong>{formatMoney(subtotal)}</Text>
                    </div>
                  </Space>
                </Card>
              )
            })}

            <Card>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <Text strong>Total</Text>
                <Text strong style={{ fontSize: 18 }}>
                  {formatMoney(cartTotal)}
                </Text>
              </div>
            </Card>

            <Button
              type="primary"
              size="large"
              block
              icon={<WhatsAppOutlined />}
              onClick={sendToWhatsApp}
              style={{
                background: '#16a34a',
                borderColor: '#16a34a',
                fontWeight: 700,
              }}
            >
              Finalizar no WhatsApp
            </Button>
          </Space>
        )}
      </Drawer>
    </div>
  )
}