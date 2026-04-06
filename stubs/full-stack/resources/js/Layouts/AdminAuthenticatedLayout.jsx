import { Link, usePage } from '@inertiajs/react';
import {
    DashboardOutlined,
    LogoutOutlined,
    SettingOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    SearchOutlined,
    HomeOutlined,
    TeamOutlined,
    FileOutlined,
    BarChartOutlined,
    EditOutlined,
    TagsOutlined,
    CommentOutlined,
    FileTextOutlined,
    PictureOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { StarOutlined } from '@ant-design/icons';
import {
    Button,
    Dropdown,
    Layout,
    Menu,
    Space,
    Typography,
    Input,
    Badge,
    Avatar,
    Divider,
} from 'antd';
import { useState } from 'react';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function AdminAuthenticatedLayout({ title, breadcrumb, children }) {
    const user = usePage().props.auth.user;
    const roles = user?.roles ?? [];
    const permissions = user?.permissions ?? [];
    const [collapsed, setCollapsed] = useState(false);
    const [activeNav, setActiveNav] = useState('dashboard');

    // Top Navigation Items
    const topNavItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { key: 'users', label: 'Users', icon: <TeamOutlined /> },
        { key: 'reports', label: 'Reports', icon: <BarChartOutlined /> },
    ];

    // Sidebar Menu Items
    const sidebarMenuItems = [
        {
            key: 'group1',
            icon: <HomeOutlined />,
            label: 'Dashboard',
            children: [
                { key: 'overview', label: 'Overview', icon: <DashboardOutlined style={{ fontSize: '12px' }} /> },
                { key: 'analytics', label: 'Analytics', icon: <BarChartOutlined style={{ fontSize: '12px' }} /> },
            ],
        },
        {
            key: 'group2',
            icon: <TeamOutlined />,
            label: 'User Management',
            children: [
                        {
                            key: 'access-control',
                            label: (
                                <Link href={route('admin.access-control.index')}>
                                    Access Control
                                </Link>
                            ),
                            icon: <UserOutlined style={{ fontSize: '12px' }} />,
                        },
                        { key: 'roles', label: 'Roles', icon: <FileOutlined style={{ fontSize: '12px' }} /> },
                { key: 'permissions', label: 'Permissions', icon: <SettingOutlined style={{ fontSize: '12px' }} /> },
            ],
        },
        {
            key: 'group3',
            icon: <EditOutlined />,
            label: 'Blog Management',
            children: [
                {
                    key: 'blogs',
                    label: <Link href={route('admin.blogs.index')}>All Posts</Link>,
                    icon: <FileOutlined style={{ fontSize: '12px' }} />,
                },
                {
                    key: 'blogs-create',
                    label: <Link href={route('admin.blogs.create')}>New Post</Link>,
                    icon: <EditOutlined style={{ fontSize: '12px' }} />,
                },
                {
                    key: 'categories',
                    label: <Link href={route('admin.categories.index')}>Categories</Link>,
                    icon: <TagsOutlined style={{ fontSize: '12px' }} />,
                },
            ],
        },
        {
            key: 'group_testimonials',
            icon: <StarOutlined />,
            label: 'Testimonials',
            children: [
                {
                    key: 'testimonials',
                    label: <Link href={route('admin.testimonials.index')}>All Testimonials</Link>,
                    icon: <StarOutlined style={{ fontSize: '12px' }} />,
                },
            ],
        },
        {
            key: 'group_gallery',
            icon: <PictureOutlined />,
            label: 'Gallery',
            children: [
                {
                    key: 'gallery-items',
                    label: <Link href={route('admin.gallery.index')}>Media Library</Link>,
                    icon: <PictureOutlined style={{ fontSize: '12px' }} />,
                },
                {
                    key: 'gallery-videos',
                    label: <Link href={route('admin.gallery.index', { media_type: 'video' })}>Videos</Link>,
                    icon: <VideoCameraOutlined style={{ fontSize: '12px' }} />,
                },
            ],
        },
        {
            key: 'group4',
            icon: <SettingOutlined />,
            label: 'System Settings',
            children: [
                        {
                            key: 'settings',
                            label: (
                                <Link href={route('admin.settings.index')}>
                                    General Settings
                                </Link>
                            ),
                            icon: <SettingOutlined style={{ fontSize: '12px' }} />,
                        },
                { key: 'audit', label: 'Audit Logs', icon: <FileOutlined style={{ fontSize: '12px' }} /> },
            ],
        },
        {
            key: 'group_notifications',
            icon: <BellOutlined />,
            label: 'Notifications',
            children: [
                {
                    key: 'notifications',
                    label: <Link href={route('admin.notifications.index')}>Campaigns</Link>,
                    icon: <BellOutlined style={{ fontSize: '12px' }} />,
                },
            ],
        },
        {
            key: 'group5',
            icon: <FileTextOutlined />,
            label: 'Pages',
            children: [
                {
                    key: 'pages',
                    label: <Link href={route('admin.pages.index')}>All Pages</Link>,
                    icon: <FileTextOutlined style={{ fontSize: '12px' }} />,
                },
                {
                    key: 'pages-create',
                    label: <Link href={route('admin.pages.create')}>Create Page</Link>,
                    icon: <EditOutlined style={{ fontSize: '12px' }} />,
                },
            ],
        },
    ];

    const accountItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link href={route('profile.edit')}>My Profile</Link>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: (
                <Link href={route('logout')} method="post" as="button">
                    Log Out
                </Link>
            ),
            danger: true,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            {/* Fixed Top Navigation */}
            <Header
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    height: '70px',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                }}
            >
                {/* Left Section */}
                <Space size="large" align="center">
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined style={{ fontSize: '20px', color: '#fff' }} />
                            ) : (
                                <MenuFoldOutlined style={{ fontSize: '20px', color: '#fff' }} />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                    />
                    <Title 
                        level={3} 
                        style={{ 
                            margin: 0, 
                            color: '#fff', 
                            fontWeight: 'bold',
                            letterSpacing: '1px'
                        }}
                    >
                        DEVFOXX
                    </Title>
                </Space>

                {/* Center Section - Top Navigation */}
                <Space size="middle">
                    {topNavItems.map((item) => (
                        <Button
                            key={item.key}
                            type={activeNav === item.key ? 'primary' : 'text'}
                            onClick={() => setActiveNav(item.key)}
                            icon={item.icon}
                            style={{
                                color: activeNav === item.key ? '#fff' : 'rgba(255,255,255,0.7)',
                                background: activeNav === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                                border: 'none',
                                fontWeight: activeNav === item.key ? '600' : '400',
                                borderRadius: '6px',
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Space>

                {/* Right Section */}
                <Space size="middle" align="center">
                    <Input
                        placeholder="Search..."
                        prefix={<SearchOutlined />}
                        style={{
                            width: '200px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                        }}
                    />

                    <Button
                        type="text"
                        icon={
                            <Badge count={3} color="#ff4d4f">
                                <BellOutlined style={{ fontSize: '18px', color: '#fff' }} />
                            </Badge>
                        }
                    />

                    <Divider type="vertical" style={{ height: '24px', borderColor: 'rgba(255,255,255,0.2)' }} />

                    <Dropdown
                        menu={{ items: accountItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button type="text" style={{ padding: '0 8px' }}>
                            <Space size="small" align="center">
                                <Avatar
                                    size={32}
                                    style={{
                                        background: 'rgba(255,255,255,0.3)',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Text style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                                    {user.name}
                                </Text>
                            </Space>
                        </Button>
                    </Dropdown>
                </Space>
            </Header>

            {/* Main Layout with Sidebar */}
            <Layout style={{ marginTop: '70px', minHeight: 'calc(100vh - 70px)' }}>
                {/* Fixed Sidebar */}
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    width={280}
                    style={{
                        background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
                        boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
                        position: 'fixed',
                        left: 0,
                        top: 70,
                        bottom: 0,
                        zIndex: 100,
                        overflowY: 'auto',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    {/* Sidebar Menu */}
                    <Menu
                        theme="dark"
                        mode="inline"
                        items={sidebarMenuItems}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            marginTop: '24px',
                        }}
                        itemLabelStyle={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '14px',
                            fontWeight: '500',
                        }}
                    />
                </Sider>

                {/* Content Layout */}
                <Layout style={{ 
                    marginLeft: collapsed ? 0 : 280, 
                    transition: 'margin-left 0.2s',
                    background: '#f5f7fa',
                }}>
                    {/* Page Header with Title */}
                    {title && (
                        <div
                            style={{
                                padding: '24px 32px',
                                background: '#fff',
                                borderBottom: '1px solid #e8eef7',
                                boxShadow: '0 2px 4px rgba(102, 126, 234, 0.04)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <Title 
                                        level={2} 
                                        style={{ 
                                            margin: '0 0 8px 0',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {title}
                                    </Title>
                                    {breadcrumb && (
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            {breadcrumb}
                                        </Text>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <Content style={{ padding: '32px', minHeight: 360 }}>
                        {children}
                    </Content>

                    {/* Footer */}
                    <Footer
                        style={{
                            textAlign: 'center',
                            background: '#fff',
                            borderTop: '1px solid #e8eef7',
                            color: '#8c8c8c',
                            fontSize: '13px',
                            padding: '24px',
                        }}
                    >
                        <Space split={<Divider type="vertical" />} size="small">
                            <Text type="secondary">© 2026 DEVFOXX. All rights reserved.</Text>
                            <Link href="#" style={{ color: '#667eea' }}>Documentation</Link>
                            <Link href="#" style={{ color: '#667eea' }}>Support</Link>
                            <Link href="#" style={{ color: '#667eea' }}>Status</Link>
                        </Space>
                    </Footer>
                </Layout>
            </Layout>
        </Layout>
    );
}
