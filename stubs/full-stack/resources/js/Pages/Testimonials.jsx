import { Head } from '@inertiajs/react';
import { Avatar, Card, Col, Empty, Row, Space, Tag, Typography } from 'antd';
import { StarFilled, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function StarRating({ value }) {
    return (
        <Space size={2}>
            {[1, 2, 3, 4, 5].map((s) => (
                <StarFilled key={s} style={{ color: s <= value ? '#fadb14' : '#e0e0e0', fontSize: 14 }} />
            ))}
        </Space>
    );
}

export default function Testimonials({ testimonials }) {
    const featured = testimonials.filter((t) => t.is_featured);
    const rest = testimonials.filter((t) => !t.is_featured);

    return (
        <>
            <Head title="Testimonials" />

            <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '48px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <Tag color="geekblue" style={{ marginBottom: 12, borderRadius: 20, padding: '2px 14px' }}>
                            Testimonials
                        </Tag>
                        <Title level={1} style={{ margin: 0, fontWeight: 800 }}>
                            What People Say
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16, marginTop: 8, display: 'block' }}>
                            Trusted by professionals who share their experience
                        </Text>
                    </div>

                    {testimonials.length === 0 && (
                        <Card style={{ borderRadius: 16 }}>
                            <Empty description="No testimonials yet" />
                        </Card>
                    )}

                    {/* Featured testimonials — full width highlight cards */}
                    {featured.length > 0 && (
                        <>
                            <Title level={4} style={{ marginBottom: 20, color: '#667eea' }}>
                                ⭐ Featured Reviews
                            </Title>
                            <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
                                {featured.map((t) => (
                                    <Col xs={24} md={12} key={t.id}>
                                        <Card
                                            style={{
                                                borderRadius: 16,
                                                border: '2px solid #667eea',
                                                background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)',
                                                height: '100%',
                                            }}
                                            bodyStyle={{ padding: 28 }}
                                        >
                                            <StarRating value={t.rating} />
                                            <Paragraph
                                                style={{
                                                    marginTop: 16,
                                                    fontSize: 15,
                                                    fontStyle: 'italic',
                                                    color: '#434343',
                                                    lineHeight: 1.7,
                                                }}
                                            >
                                                "{t.content}"
                                            </Paragraph>
                                            <Space style={{ marginTop: 20 }}>
                                                <Avatar
                                                    src={t.avatar}
                                                    icon={!t.avatar && <UserOutlined />}
                                                    style={{ background: '#667eea' }}
                                                    size={48}
                                                >
                                                    {!t.avatar && t.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <div>
                                                    <Text strong style={{ fontSize: 15, display: 'block' }}>
                                                        {t.name}
                                                    </Text>
                                                    {(t.designation || t.company) && (
                                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                                            {[t.designation, t.company].filter(Boolean).join(' · ')}
                                                        </Text>
                                                    )}
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {/* All other testimonials — 3-column grid */}
                    {rest.length > 0 && (
                        <>
                            {featured.length > 0 && (
                                <Title level={4} style={{ marginBottom: 20, color: '#595959' }}>
                                    More Reviews
                                </Title>
                            )}
                            <Row gutter={[20, 20]}>
                                {rest.map((t) => (
                                    <Col xs={24} sm={12} lg={8} key={t.id}>
                                        <Card
                                            style={{
                                                borderRadius: 14,
                                                border: '1px solid #f0f0f0',
                                                height: '100%',
                                                transition: 'box-shadow 0.2s',
                                            }}
                                            hoverable
                                            bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
                                        >
                                            <StarRating value={t.rating} />
                                            <Paragraph
                                                ellipsis={{ rows: 4, expandable: true, symbol: 'more' }}
                                                style={{
                                                    marginTop: 14,
                                                    flex: 1,
                                                    fontStyle: 'italic',
                                                    color: '#595959',
                                                    lineHeight: 1.7,
                                                }}
                                            >
                                                "{t.content}"
                                            </Paragraph>
                                            <Space style={{ marginTop: 18 }}>
                                                <Avatar
                                                    src={t.avatar}
                                                    icon={!t.avatar && <UserOutlined />}
                                                    style={{ background: '#764ba2' }}
                                                    size={40}
                                                >
                                                    {!t.avatar && t.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <div>
                                                    <Text strong style={{ display: 'block', lineHeight: 1.3 }}>
                                                        {t.name}
                                                    </Text>
                                                    {(t.designation || t.company) && (
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {[t.designation, t.company].filter(Boolean).join(' · ')}
                                                        </Text>
                                                    )}
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
