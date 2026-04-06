import { Link, usePage } from '@inertiajs/react';
import {
    EyeOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function PackageAdminLayout({ title, breadcrumb, children }) {
    const user = usePage().props?.auth?.user;
    const [collapsed, setCollapsed] = useState(false);

    const items = useMemo(() => ([
        {
            key: 'gallery',
            icon: <PictureOutlined />,
            label: <Link href={route('admin-panel.gallery.index')}>Gallery Manager</Link>,
        },
        {
            key: 'public-gallery',
            icon: <EyeOutlined />,
            label: <Link href={route('admin-panel.gallery.public')}>Public Gallery</Link>,
        },
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link href="/">Home</Link>,
        },
    ]), []);

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
            <Header
                style={{
                    position: 'fixed',
                    insetInline: 0,
                    top: 0,
                    zIndex: 1000,
                    height: 72,
                    padding: '0 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.18)',
                }}
            >
                <Space size="middle" align="center">
                    <Button
                        type="text"
                        onClick={() => setCollapsed((value) => !value)}
                        icon={collapsed ? <MenuUnfoldOutlined style={{ color: '#fff' }} /> : <MenuFoldOutlined style={{ color: '#fff' }} />}
                    />
                    <div>
                        <Title level={4} style={{ color: '#fff', margin: 0 }}>
                            DevFoxx Admin Panel
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.82)' }}>
                            {breadcrumb || 'Package UI'}
                        </Text>
                    </div>
                </Space>

                <Space size="middle">
                    <Text style={{ color: '#fff' }}>{user?.name || 'Guest'}</Text>
                    <Avatar style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                        {(user?.name || 'G').charAt(0).toUpperCase()}
                    </Avatar>
                </Space>
            </Header>

            <Layout style={{ marginTop: 72 }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    trigger={null}
                    width={250}
                    theme="light"
                    style={{
                        background: '#fff',
                        borderRight: '1px solid #eef2f7',
                        minHeight: 'calc(100vh - 72px)',
                    }}
                >
                    <Menu mode="inline" items={items} style={{ borderInlineEnd: 0, paddingTop: 12 }} />
                </Sider>

                <Content style={{ padding: 24 }}>
                    <div style={{ marginBottom: 20 }}>
                        <Title level={2} style={{ marginBottom: 4 }}>
                            {title || 'Admin Panel'}
                        </Title>
                        <Text type="secondary">
                            Manage package-powered content from a shared React/Inertia UI.
                        </Text>
                    </div>

                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
