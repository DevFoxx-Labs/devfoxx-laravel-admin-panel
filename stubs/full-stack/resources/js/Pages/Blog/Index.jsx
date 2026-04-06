import { Head, Link } from '@inertiajs/react';
import { Avatar, Badge, Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { CalendarOutlined, EyeOutlined, MessageOutlined, TagsOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function BlogIndex({ blogs, categories }) {
    return (
        <>
            <Head title="Blog" />

            <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
                {/* Hero */}
                <div style={{
                    background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                    padding: '64px 24px',
                    textAlign: 'center',
                    color: '#fff',
                }}>
                    <Title level={1} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>Blog</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginTop: 8, display: 'block' }}>
                        Latest articles, updates and insights
                    </Text>
                </div>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
                    <Row gutter={[32, 32]}>
                        {/* Posts grid */}
                        <Col xs={24} lg={17}>
                            <Row gutter={[24, 24]}>
                                {(blogs.data ?? []).map(blog => (
                                    <Col xs={24} md={12} key={blog.id}>
                                        <Link href={route('blog.show', blog.slug)} style={{ textDecoration: 'none' }}>
                                            <Card
                                                hoverable
                                                cover={
                                                    blog.featured_image ? (
                                                        <img
                                                            alt={blog.title}
                                                            src={blog.featured_image}
                                                            style={{ height: 200, objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            height: 200,
                                                            background: 'linear-gradient(135deg,#667eea,#764ba2)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <Title level={2} style={{ color: '#fff', margin: 0 }}>
                                                                {blog.title.charAt(0)}
                                                            </Title>
                                                        </div>
                                                    )
                                                }
                                                style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
                                                bodyStyle={{ padding: '20px' }}
                                            >
                                                <Space wrap style={{ marginBottom: 8 }}>
                                                    {blog.categories?.map(c => (
                                                        <Tag key={c.id} color={c.color} style={{ borderRadius: 20, fontSize: 11 }}>
                                                            {c.name}
                                                        </Tag>
                                                    ))}
                                                </Space>

                                                <Title level={4} style={{ margin: '0 0 8px', fontSize: 16, lineHeight: 1.4 }}>
                                                    {blog.title}
                                                </Title>

                                                {blog.excerpt && (
                                                    <Paragraph type="secondary" style={{ fontSize: 13, margin: '0 0 16px' }} ellipsis={{ rows: 2 }}>
                                                        {blog.excerpt}
                                                    </Paragraph>
                                                )}

                                                <Space split={<Text type="secondary">·</Text>} wrap>
                                                    <Space size={4}>
                                                        <Avatar size={18} style={{ background: '#667eea', fontSize: 10 }}>
                                                            {blog.author?.name?.charAt(0)}
                                                        </Avatar>
                                                        <Text style={{ fontSize: 12 }}>{blog.author?.name}</Text>
                                                    </Space>
                                                    <Space size={4}>
                                                        <CalendarOutlined style={{ fontSize: 11, color: '#aaa' }} />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ''}
                                                        </Text>
                                                    </Space>
                                                    <Space size={4}>
                                                        <MessageOutlined style={{ fontSize: 11, color: '#aaa' }} />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>{blog.comments_count}</Text>
                                                    </Space>
                                                    <Space size={4}>
                                                        <EyeOutlined style={{ fontSize: 11, color: '#aaa' }} />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>{blog.views_count}</Text>
                                                    </Space>
                                                </Space>
                                            </Card>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>

                            {(blogs.data ?? []).length === 0 && (
                                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                                    <Text type="secondary" style={{ fontSize: 16 }}>No blog posts yet.</Text>
                                </div>
                            )}
                        </Col>

                        {/* Sidebar */}
                        <Col xs={24} lg={7}>
                            <Card
                                title={<Space><TagsOutlined /><span>Categories</span></Space>}
                                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)', marginBottom: 24 }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {categories.map(c => (
                                        <div key={c.id} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', padding: '8px 0',
                                            borderBottom: '1px solid #f0f0f0',
                                        }}>
                                            <Space size={8}>
                                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                                                <Text>{c.name}</Text>
                                            </Space>
                                            <Badge count={c.blogs_count} color="#667eea" showZero />
                                        </div>
                                    ))}
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
}
