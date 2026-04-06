import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import DeleteActionButton from '@/Components/Admin/DeleteActionButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Avatar, Button, Card, Space, Table, Tag, Tooltip, Typography, message,
} from 'antd';
import {
    ArrowLeftOutlined, CheckOutlined, CloseOutlined,
    CommentOutlined,
} from '@ant-design/icons';
import { useEffect } from 'react';

const { Text, Paragraph } = Typography;

function CommentRow({ comment, onToggle, onDelete, level = 0 }) {
    return (
        <>
            <Table.Summary.Row>
            </Table.Summary.Row>
        </>
    );
}

export default function Comments({ blog, comments }) {
    const { flash } = usePage().props;
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (flash?.message) messageApi[flash.type ?? 'success'](flash.message);
    }, [flash]);

    function handleToggle(comment) {
        router.patch(route('admin.blogs.comments.toggle', { blog: blog.id, comment: comment.id }));
    }

    function flattenComments(list, level = 0) {
        const result = [];
        for (const c of list) {
            result.push({ ...c, _level: level });
            if (c.replies?.length) {
                result.push(...flattenComments(c.replies, level + 1));
            }
        }
        return result;
    }

    const flat = flattenComments(comments);

    const columns = [
        {
            title: 'Author', dataIndex: 'author', width: 160,
            render: (author, row) => (
                <Space>
                    <Avatar size={32} style={{ background: '#667eea' }}>
                        {author?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 13 }}>{author?.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{author?.email}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Comment', dataIndex: 'body',
            render: (body, row) => (
                <div style={{ paddingLeft: row._level * 24 }}>
                    {row._level > 0 && (
                        <Tag color="purple" style={{ marginBottom: 4, fontSize: 10 }}>Reply</Tag>
                    )}
                    <Paragraph style={{ margin: 0 }}>{body}</Paragraph>
                </div>
            ),
        },
        {
            title: 'Status', dataIndex: 'is_approved', align: 'center', width: 100,
            render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Approved' : 'Pending'}</Tag>,
        },
        {
            title: 'Date', dataIndex: 'created_at', align: 'center', width: 130,
            render: v => <Text type="secondary" style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString()}</Text>,
        },
        {
            title: 'Actions', key: 'actions', align: 'center', width: 120,
            render: (_, row) => (
                <Space>
                    <Tooltip title={row.is_approved ? 'Unapprove' : 'Approve'}>
                        <Button
                            size="small"
                            type={row.is_approved ? 'default' : 'primary'}
                            icon={row.is_approved ? <CloseOutlined /> : <CheckOutlined />}
                            onClick={() => handleToggle(row)}
                        />
                    </Tooltip>
                    <DeleteActionButton
                        title="Delete this comment?"
                        description="This will remove the selected comment from the moderation list."
                        onConfirm={() =>
                            router.delete(route('admin.blogs.comments.destroy', {
                                blog: blog.id,
                                comment: row.id,
                            }))
                        }
                    />
                </Space>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout
            title={`Comments: ${blog.title}`}
            breadcrumb="Admin / Blog / Comments"
        >
            <Head title="Blog Comments" />
            {contextHolder}

            <Card
                title={<Space><CommentOutlined /><span>All Comments</span></Space>}
                extra={
                    <Link href={route('admin.blogs.index')}>
                        <Button icon={<ArrowLeftOutlined />}>Back to Posts</Button>
                    </Link>
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
            >
                <Table
                    dataSource={flat}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 20 }}
                    rowClassName={row => row._level > 0 ? 'reply-row' : ''}
                />
            </Card>
        </AdminAuthenticatedLayout>
    );
}
