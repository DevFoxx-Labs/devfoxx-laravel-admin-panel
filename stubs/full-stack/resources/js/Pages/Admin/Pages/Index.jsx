import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import DeleteActionButton from '@/Components/Admin/DeleteActionButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    App,
    Button,
    Card,
    Col,
    Empty,
    Input,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

const { Text } = Typography;

export default function PagesIndex({ pages, filters, stats }) {
    const { flash } = usePage().props;
    const { message } = App.useApp();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash, message]);

    const columns = useMemo(
        () => [
            {
                title: 'Page',
                dataIndex: 'title',
                key: 'title',
                render: (_, record) => (
                    <Space direction="vertical" size={2}>
                        <Space wrap>
                            <Text strong>{record.title}</Text>
                            {record.is_homepage && <Tag color="gold">Homepage</Tag>}
                            {record.show_in_menu && <Tag color="blue">Menu</Tag>}
                        </Space>
                        <Text type="secondary">{record.public_path}</Text>
                        {record.excerpt && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.excerpt}
                            </Text>
                        )}
                    </Space>
                ),
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 140,
                render: (value) => {
                    const color =
                        value === 'published'
                            ? 'success'
                            : value === 'draft'
                              ? 'default'
                              : 'warning';

                    return <Tag color={color}>{value}</Tag>;
                },
            },
            {
                title: 'Updated',
                dataIndex: 'updated_at',
                key: 'updated_at',
                width: 190,
                render: (value) =>
                    value ? new Date(value).toLocaleString() : 'Not updated',
            },
            {
                title: 'Actions',
                key: 'actions',
                width: 210,
                render: (_, record) => (
                    <Space wrap>
                        <Link href={route('admin.pages.edit', record.id)}>
                            <Button icon={<EditOutlined />}>Edit</Button>
                        </Link>
                        <Button
                            icon={<EyeOutlined />}
                            href={record.public_path}
                            target="_blank"
                        >
                            View
                        </Button>
                        <DeleteActionButton
                            title="Delete this page?"
                            description="The page route will stop working immediately."
                            onConfirm={() => router.delete(route('admin.pages.destroy', record.id))}
                            buttonSize="middle"
                        />
                    </Space>
                ),
            },
        ],
        [],
    );

    const applyFilters = () => {
        router.get(
            route('admin.pages.index'),
            {
                search: search || undefined,
                status: status || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        router.get(route('admin.pages.index'));
    };

    return (
        <AdminAuthenticatedLayout
            title="Page Management"
            breadcrumb="Admin / Pages"
        >
            <Head title="Page Management" />

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[
                    { title: 'Total Pages', value: stats.total, color: '#1677ff' },
                    { title: 'Published', value: stats.published, color: '#52c41a' },
                    { title: 'Draft', value: stats.draft, color: '#faad14' },
                    { title: 'In Menu', value: stats.menu, color: '#722ed1' },
                ].map((item) => (
                    <Col xs={12} md={6} key={item.title}>
                        <Card bordered={false} style={{ borderRadius: 16 }}>
                            <Statistic
                                title={item.title}
                                value={item.value}
                                valueStyle={{ color: item.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card
                bordered={false}
                style={{ borderRadius: 20 }}
                bodyStyle={{ padding: 20 }}
            >
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    <Space
                        style={{
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                        wrap
                    >
                        <Space wrap>
                            <Input
                                allowClear
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onPressEnter={applyFilters}
                                prefix={<SearchOutlined />}
                                placeholder="Search pages"
                                style={{ width: 260 }}
                            />
                            <Select
                                allowClear
                                placeholder="Filter by status"
                                value={status || undefined}
                                onChange={(value) => setStatus(value ?? '')}
                                style={{ width: 180 }}
                                options={[
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'published', label: 'Published' },
                                    { value: 'archived', label: 'Archived' },
                                ]}
                            />
                            <Button onClick={applyFilters}>Apply</Button>
                            <Button onClick={resetFilters}>Reset</Button>
                        </Space>

                        <Link href={route('admin.pages.create')}>
                            <Button type="primary" icon={<PlusOutlined />}>
                                New Page
                            </Button>
                        </Link>
                    </Space>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={pages.data}
                        pagination={{
                            current: pages.current_page,
                            pageSize: pages.per_page,
                            total: pages.total,
                            onChange: (page) =>
                                router.get(
                                    route('admin.pages.index'),
                                    {
                                        page,
                                        search: search || undefined,
                                        status: status || undefined,
                                    },
                                    { preserveState: true, replace: true },
                                ),
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No pages created yet"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                >
                                    <Link href={route('admin.pages.create')}>
                                        <Button
                                            type="primary"
                                            icon={<FileTextOutlined />}
                                        >
                                            Create Your First Page
                                        </Button>
                                    </Link>
                                </Empty>
                            ),
                        }}
                    />
                </Space>
            </Card>
        </AdminAuthenticatedLayout>
    );
}