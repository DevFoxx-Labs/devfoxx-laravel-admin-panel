import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import DeleteActionButton from '@/Components/Admin/DeleteActionButton';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Button, Card, Col, ColorPicker, Form, Input, Row,
    Space, Switch, Table, Tag, Tooltip, Typography, message,
} from 'antd';
import {
    EditOutlined, PlusOutlined, TagsOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

export default function Categories({ categories }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState(null);
    const [antForm]                 = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '', slug: '', description: '', color: '#667eea', is_active: true,
    });

    useEffect(() => {
        if (flash?.message) {
            messageApi[flash.type ?? 'success'](flash.message);
        }
    }, [flash]);

    function openCreate() {
        setEditing(null);
        reset();
        antForm.resetFields();
        setModalOpen(true);
    }

    function openEdit(category) {
        setEditing(category);
        const vals = {
            name: category.name, slug: category.slug,
            description: category.description ?? '',
            color: category.color ?? '#667eea',
            is_active: category.is_active,
        };
        setData(vals);
        antForm.setFieldsValue(vals);
        setModalOpen(true);
    }

    function handleSubmit() {
        if (editing) {
            put(route('admin.categories.update', editing.id), { onSuccess: () => { setModalOpen(false); reset(); } });
        } else {
            post(route('admin.categories.store'), { onSuccess: () => { setModalOpen(false); reset(); } });
        }
    }

    const columns = [
        {
            title: 'Category', dataIndex: 'name',
            render: (name, row) => (
                <Space>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: row.color }} />
                    <Text strong>{name}</Text>
                </Space>
            ),
        },
        { title: 'Slug', dataIndex: 'slug', render: v => <Text code>{v}</Text> },
        { title: 'Blogs', dataIndex: 'blogs_count', align: 'center', render: v => <Tag color="blue">{v}</Tag> },
        {
            title: 'Status', dataIndex: 'is_active', align: 'center',
            render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>,
        },
        {
            title: 'Actions', key: 'actions', align: 'center',
            render: (_, row) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                    </Tooltip>
                    <DeleteActionButton
                        title="Delete category?"
                        description={`"${row.name}" will be permanently removed.`}
                        onConfirm={() => destroy(route('admin.categories.destroy', row.id))}
                    />
                </Space>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout title="Blog Categories" breadcrumb="Admin / Blog / Categories">
            <Head title="Blog Categories" />
            {contextHolder}

            <Card
                title={<Space><TagsOutlined /><span>All Categories</span></Space>}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
                        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' }}>
                        New Category
                    </Button>
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
            >
                <Table
                    dataSource={categories}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                />
            </Card>

            <Modal
                title={editing ? 'Edit Category' : 'New Category'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                confirmLoading={processing}
                okText={editing ? 'Update' : 'Create'}
                okButtonProps={{ style: { background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' } }}
                destroyOnClose
            >
                <Form form={antForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={14}>
                            <Form.Item label="Name" name="name"
                                validateStatus={errors.name ? 'error' : ''}
                                help={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={e => {
                                        setData('name', e.target.value);
                                        antForm.setFieldValue('name', e.target.value);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item label="Color">
                                <ColorPicker
                                    value={data.color}
                                    onChange={(_, hex) => setData('color', hex)}
                                    showText
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Slug" name="slug"
                        validateStatus={errors.slug ? 'error' : ''} help={errors.slug}>
                        <Input
                            value={data.slug}
                            onChange={e => { setData('slug', e.target.value); antForm.setFieldValue('slug', e.target.value); }}
                        />
                    </Form.Item>
                    <Form.Item label="Description">
                        <Input.TextArea
                            rows={3} value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label="Active">
                        <Switch checked={data.is_active} onChange={v => setData('is_active', v)} />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminAuthenticatedLayout>
    );
}
