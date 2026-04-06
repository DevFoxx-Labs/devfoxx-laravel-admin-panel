import { Head, Link, usePage } from '@inertiajs/react';
import { Button, Card, Layout, Space, Typography } from 'antd';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function Show({ page, menuPages }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title={page.meta_title || page.title}>
                {page.meta_description && (
                    <meta name="description" content={page.meta_description} />
                )}
                {page.meta_keywords && (
                    <meta name="keywords" content={page.meta_keywords} />
                )}
            </Head>

            <Layout style={{ minHeight: '100vh', background: '#f4f7fb' }}>
                <Header
                    style={{
                        height: 'auto',
                        padding: '18px 32px',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1180,
                            margin: '0 auto',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 24,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Link href="/" style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>
                            DEVFOXX
                        </Link>

                        <Space wrap size="middle">
                            {menuPages.map((menuPage) => (
                                <Link
                                    key={menuPage.id}
                                    href={menuPage.public_path}
                                    style={{ color: '#dbeafe', fontWeight: 500 }}
                                >
                                    {menuPage.title}
                                </Link>
                            ))}
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <Button type="primary">Dashboard</Button>
                                </Link>
                            ) : (
                                <Space>
                                    <Link href={route('login')}>
                                        <Button>Login</Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button type="primary">Register</Button>
                                    </Link>
                                </Space>
                            )}
                        </Space>
                    </div>
                </Header>

                <Content style={{ padding: '48px 24px 72px' }}>
                    <div style={{ maxWidth: 980, margin: '0 auto' }}>
                        <Card
                            bordered={false}
                            style={{ borderRadius: 28, overflow: 'hidden' }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <div
                                style={{
                                    padding: '56px 56px 28px',
                                    background:
                                        'radial-gradient(circle at top left, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
                                }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <Text type="secondary">{page.public_path}</Text>
                                    <Title level={1} style={{ margin: 0, maxWidth: 760 }}>
                                        {page.title}
                                    </Title>
                                    {page.excerpt && (
                                        <Paragraph
                                            style={{
                                                fontSize: 18,
                                                color: '#475569',
                                                marginBottom: 0,
                                                maxWidth: 760,
                                            }}
                                        >
                                            {page.excerpt}
                                        </Paragraph>
                                    )}
                                </Space>
                            </div>

                            <div style={{ padding: '40px 56px 56px' }}>
                                <Typography
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.85,
                                        fontSize: 16,
                                        color: '#1e293b',
                                    }}
                                >
                                    {page.content}
                                </Typography>
                            </div>
                        </Card>
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center', background: 'transparent', color: '#64748b' }}>
                    DEVFOXX dynamic pages
                </Footer>
            </Layout>
        </>
    );
}