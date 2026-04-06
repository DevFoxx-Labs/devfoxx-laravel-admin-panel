import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import DeleteActionButton from '@/Components/Admin/DeleteActionButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Button, Card, Input, Select, Space, Table, Tag,
    Tooltip, Typography, message,
} from 'antd';
import {
    CommentOutlined, EditOutlined,
    EyeOutlined, FileTextOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

const { Text } = Typography;
const { Search } = Input;

const STATUS_COLORS = { published: 'green', draft: 'orange', archived: 'default' };

export default function BlogIndex({ blogs, categories }) {
    const { flash } = usePage().props;
    const [messageApi, contextHolder] = message.useMessage();
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState(null);

    useEffect(() => {
        if (flash?.message) messageApi[flash.type ?? 'success'](flash.message);
    }, [flash]);

    const filtered = (blogs.data ?? []).filter(b => {
        const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const columns = [
        {
            title: 'Title', dataIndex: 'title',
            render: (title, row) => (
                <Space direction="vertical" size={2}>
                    <Text strong style={{ fontSize: 14 }}>{title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>by {row.author?.name}</Text>
                </Space>
            ),
        },
        {
            title: 'Categories', dataIndex: 'categories',
            render: cats => (
                <Space wrap>
                    {cats?.map(c => <Tag key={c.id} color={c.color}>{c.name}</Tag>)}
                </Space>
            ),
        },
        {
            title: 'Status', dataIndex: 'status', align: 'center',
            render: s => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
        },
        {
            title: 'Comments', dataIndex: 'comments_count', align: 'center',
            render: v => <Tag color="blue" icon={<CommentOutlined />}>{v}</Tag>,
        },
        {
            title: 'Published', dataIndex: 'published_at', align: 'center',
            render: v => v ? new Date(v).toLocaleDateString() : <Text type="secondary">—</Text>,
        },
        {
            title: 'Actions', key: 'actions', align: 'center', width: 160,
            render: (_, row) => (
                <Space>
                    <Tooltip title="View on site">
                        <Button size="small" icon={<EyeOutlined />}
                            href={`/blog/${row.slug}`} target="_blank" />
                    </Tooltip>
                    <Tooltip title="Manage comments">
                        <Link href={route('admin.blogs.comments.index', row.id)}>
                            <Button size="small" icon={<CommentOutlined />} />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Link href={route('admin.blogs.edit', row.id)}>
                            <Button type="primary" ghost size="small" icon={<EditOutlined />} />
                        </Link>
                    </Tooltip>
                    <DeleteActionButton
                        title="Delete this blog post?"
                        description={`"${row.title}" will be moved out of the active list.`}
                        onConfirm={() => router.delete(route('admin.blogs.destroy', row.id))}
                    />
                </Space>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout title="Blog Posts" breadcrumb="Admin / Blog / All Posts">
            <Head title="Blog Posts" />
            {contextHolder}

            <Card
                title={<Space><FileTextOutlined /><span>All Blog Posts</span></Space>}
                extra={
                    <Space>
                        <Select
                            allowClear placeholder="Filter status"
                            style={{ width: 140 }}
                            onChange={setStatus}
                            options={[
                                { value: 'published', label: 'Published' },
                                { value: 'draft', label: 'Draft' },
                                { value: 'archived', label: 'Archived' },
                            ]}
                        />
                        <Search
                            placeholder="Search posts..."
                            style={{ width: 220 }}
                            onSearch={setSearch}
                            allowClear
                        />
                        <Link href={route('admin.blogs.create')}>
                            <Button type="primary" icon={<PlusOutlined />}
                                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' }}>
                                New Post
                            </Button>
                        </Link>
                    </Space>
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
            >
                <Table
                    dataSource={filtered}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 15, total: blogs.total, showTotal: t => `${t} posts` }}
                />
            </Card>
        </AdminAuthenticatedLayout>
    );
}
