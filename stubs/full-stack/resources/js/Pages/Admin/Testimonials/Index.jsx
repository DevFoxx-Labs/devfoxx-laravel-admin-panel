import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import DeleteActionButton from '@/Components/Admin/DeleteActionButton';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Drawer,
    Empty,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Pagination,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    StarFilled,
    UndoOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ── Star Rating display ──────────────────────────────────────────────────────
function StarRating({ value }) {
    return (
        <Space size={2}>
            {[1, 2, 3, 4, 5].map((s) => (
                <StarFilled key={s} style={{ color: s <= value ? '#fadb14' : '#d9d9d9', fontSize: 13 }} />
            ))}
        </Space>
    );
}

// ── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ testimonial, onEdit, onDelete, onRestore, onForceDelete, onToggleFeatured, onToggleActive }) {
    const isTrashed = !!testimonial.deleted_at;

    return (
        <Card
            style={{
                borderRadius: 12,
                border: isTrashed
                    ? '1px solid #ff7875'
                    : testimonial.is_featured
                    ? '2px solid #667eea'
                    : '1px solid #f0f0f0',
                opacity: isTrashed ? 0.75 : 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            actions={
                isTrashed
                    ? [
                          <Tooltip title="Restore" key="restore">
                              <Button type="text" icon={<UndoOutlined />} onClick={() => onRestore(testimonial)} />
                          </Tooltip>,
                          <DeleteActionButton
                              key="force-delete"
                              title="Permanently delete this testimonial?"
                              description="This action cannot be undone."
                              onConfirm={() => onForceDelete(testimonial)}
                              tooltip="Delete Forever"
                              okText="Delete Forever"
                              buttonType="text"
                              buttonProps={{ danger: true }}
                          />,
                      ]
                    : [
                          <Tooltip title="Edit" key="edit">
                              <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(testimonial)} />
                          </Tooltip>,
                          <Tooltip title={testimonial.is_featured ? 'Unfeature' : 'Feature'} key="feature">
                              <Button
                                  type="text"
                                  icon={<StarFilled style={{ color: testimonial.is_featured ? '#fadb14' : '#d9d9d9' }} />}
                                  onClick={() => onToggleFeatured(testimonial)}
                              />
                          </Tooltip>,
                          <DeleteActionButton
                              key="delete"
                              title="Move to trash?"
                              description="You can restore this testimonial later from the trash view."
                              onConfirm={() => onDelete(testimonial)}
                              tooltip="Trash"
                              okText="Trash"
                              buttonType="text"
                              buttonProps={{ danger: true }}
                          />,
                      ]
            }
        >
            {/* Status badges */}
            <Space style={{ marginBottom: 8 }} wrap>
                {testimonial.is_featured && <Tag color="geekblue">Featured</Tag>}
                {!isTrashed && (
                    <Tag color={testimonial.is_active ? 'success' : 'default'}>
                        {testimonial.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                )}
                {isTrashed && <Tag color="error">Trashed</Tag>}
                <Tag color="default">#{testimonial.sort_order}</Tag>
            </Space>

            {/* Content */}
            <Paragraph
                ellipsis={{ rows: 3 }}
                style={{ color: '#595959', fontStyle: 'italic', flex: 1, marginBottom: 16 }}
            >
                "{testimonial.content}"
            </Paragraph>

            {/* Rating */}
            <StarRating value={testimonial.rating} />

            <Divider style={{ margin: '12px 0' }} />

            {/* Author info */}
            <Space>
                <Avatar
                    src={testimonial.avatar}
                    icon={!testimonial.avatar && <UserOutlined />}
                    style={{ background: '#667eea' }}
                    size={40}
                >
                    {!testimonial.avatar && testimonial.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                    <Text strong style={{ display: 'block', lineHeight: 1.3 }}>
                        {testimonial.name}
                    </Text>
                    {(testimonial.designation || testimonial.company) && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {[testimonial.designation, testimonial.company].filter(Boolean).join(' · ')}
                        </Text>
                    )}
                </div>
                {!isTrashed && (
                    <div style={{ marginLeft: 'auto' }}>
                        <Switch
                            size="small"
                            checked={testimonial.is_active}
                            onChange={() => onToggleActive(testimonial)}
                        />
                    </div>
                )}
            </Space>
        </Card>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TestimonialsIndex({ testimonials, filters, stats }) {
    const { flash } = usePage().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [form] = Form.useForm();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        designation: '',
        company: '',
        avatar: '',
        rating: 5,
        content: '',
        is_featured: false,
        is_active: true,
        sort_order: 0,
    });

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
        if (flash?.error) message.error(flash.error);
    }, [flash]);

    function openCreate() {
        setEditing(null);
        reset();
        clearErrors();
        form.resetFields();
        setDrawerOpen(true);
    }

    function openEdit(testimonial) {
        setEditing(testimonial);
        const vals = {
            name: testimonial.name,
            designation: testimonial.designation ?? '',
            company: testimonial.company ?? '',
            avatar: testimonial.avatar ?? '',
            rating: testimonial.rating,
            content: testimonial.content,
            is_featured: testimonial.is_featured,
            is_active: testimonial.is_active,
            sort_order: testimonial.sort_order,
        };
        setData(vals);
        form.setFieldsValue(vals);
        setDrawerOpen(true);
    }

    function handleSubmit(values) {
        const payload = { ...values };
        if (editing) {
            router.put(route('admin.testimonials.update', editing.id), payload, {
                onSuccess: () => { setDrawerOpen(false); reset(); },
            });
        } else {
            router.post(route('admin.testimonials.store'), payload, {
                onSuccess: () => { setDrawerOpen(false); reset(); },
            });
        }
    }

    function handleDelete(t) {
        router.delete(route('admin.testimonials.destroy', t.id));
    }

    function handleRestore(t) {
        router.patch(route('admin.testimonials.restore', t.id));
    }

    function handleForceDelete(t) {
        router.delete(route('admin.testimonials.force-delete', t.id));
    }

    function handleToggleFeatured(t) {
        router.patch(route('admin.testimonials.toggle-featured', t.id));
    }

    function handleToggleActive(t) {
        router.patch(route('admin.testimonials.toggle-active', t.id));
    }

    function handleSearch() {
        router.get(route('admin.testimonials.index'), { search, status: statusFilter }, { preserveState: true });
    }

    function handleReset() {
        setSearch('');
        setStatusFilter('');
        router.get(route('admin.testimonials.index'));
    }

    return (
        <AdminAuthenticatedLayout title="Testimonials" breadcrumb="Admin / Testimonials">
            <Head title="Testimonial Management" />

            {/* ── Stats Row ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[
                    { title: 'Total', value: stats.total, color: '#667eea' },
                    { title: 'Active', value: stats.active, color: '#52c41a' },
                    { title: 'Featured', value: stats.featured, color: '#fadb14' },
                    { title: 'Trashed', value: stats.trashed, color: '#ff4d4f' },
                ].map((s) => (
                    <Col xs={12} sm={6} key={s.title}>
                        <Card
                            style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}`, textAlign: 'center' }}
                            bodyStyle={{ padding: '16px 12px' }}
                        >
                            <Statistic
                                title={<Text style={{ color: '#8c8c8c', fontSize: 12 }}>{s.title}</Text>}
                                value={s.value}
                                valueStyle={{ color: s.color, fontWeight: 700, fontSize: 22 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Filter Bar ── */}
            <Card style={{ borderRadius: 12, marginBottom: 24 }} bodyStyle={{ padding: '16px 20px' }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={10} md={8}>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Search by name, company, content…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={6} md={5}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by status"
                            value={statusFilter || undefined}
                            allowClear
                            onChange={(val) => setStatusFilter(val ?? '')}
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="featured">Featured</Option>
                            <Option value="trashed">Trashed</Option>
                        </Select>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}
                            style={{ background: '#667eea', borderColor: '#667eea' }}>
                            Search
                        </Button>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
                    </Col>
                    <Col style={{ marginLeft: 'auto' }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreate}
                            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                        >
                            Add Testimonial
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* ── Cards Grid ── */}
            {testimonials.data.length === 0 ? (
                <Card style={{ borderRadius: 12 }}>
                    <Empty description="No testimonials found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
                            style={{ background: '#667eea', borderColor: '#667eea' }}>
                            Add First Testimonial
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {testimonials.data.map((t) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={t.id}>
                                <TestimonialCard
                                    testimonial={t}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    onRestore={handleRestore}
                                    onForceDelete={handleForceDelete}
                                    onToggleFeatured={handleToggleFeatured}
                                    onToggleActive={handleToggleActive}
                                />
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination */}
                    {testimonials.last_page > 1 && (
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Pagination
                                current={testimonials.current_page}
                                total={testimonials.total}
                                pageSize={testimonials.per_page}
                                onChange={(page) =>
                                    router.get(route('admin.testimonials.index'), { ...filters, page }, { preserveState: true })
                                }
                                showSizeChanger={false}
                                showTotal={(total) => `${total} testimonials`}
                            />
                        </div>
                    )}
                </>
            )}

            {/* ── Create / Edit Drawer ── */}
            <Drawer
                title={
                    <Space>
                        {editing ? <EditOutlined /> : <PlusOutlined />}
                        <span>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</span>
                    </Space>
                }
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); reset(); clearErrors(); }}
                width={520}
                extra={
                    <Button
                        type="primary"
                        loading={processing}
                        onClick={() => form.submit()}
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                    >
                        {editing ? 'Save Changes' : 'Create Testimonial'}
                    </Button>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ rating: 5, is_active: true, is_featured: false, sort_order: 0 }}
                >
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="name"
                                label="Reviewer Name"
                                rules={[{ required: true, message: 'Name is required' }]}
                                validateStatus={errors.name ? 'error' : ''}
                                help={errors.name}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Full name" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="rating" label="Rating">
                                <InputNumber min={1} max={5} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="designation" label="Designation">
                                <Input placeholder="e.g. CEO, Developer" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="company" label="Company">
                                <Input placeholder="Company name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="avatar"
                        label="Avatar URL"
                        validateStatus={errors.avatar ? 'error' : ''}
                        help={errors.avatar}
                    >
                        <Input placeholder="https://example.com/avatar.jpg" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Testimonial Content"
                        rules={[
                            { required: true, message: 'Content is required' },
                            { min: 10, message: 'At least 10 characters' },
                        ]}
                        validateStatus={errors.content ? 'error' : ''}
                        help={errors.content}
                    >
                        <TextArea
                            rows={5}
                            placeholder="What did they say about you or your product?"
                            showCount
                            maxLength={2000}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="sort_order" label="Sort Order">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="is_active" label="Active" valuePropName="checked">
                                <Switch checkedChildren="Yes" unCheckedChildren="No" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="is_featured" label="Featured" valuePropName="checked">
                                <Switch
                                    checkedChildren={<StarFilled />}
                                    unCheckedChildren={<StarFilled />}
                                    style={{ background: data.is_featured ? '#fadb14' : undefined }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Live preview */}
                    <Divider orientation="left" style={{ fontSize: 12, color: '#8c8c8c' }}>Preview</Divider>
                    <Card style={{ borderRadius: 10, background: '#fafafa', border: '1px dashed #d9d9d9' }}>
                        <Paragraph style={{ fontStyle: 'italic', color: '#595959', marginBottom: 10 }}>
                            "{form.getFieldValue('content') || 'Your testimonial content will appear here…'}"
                        </Paragraph>
                        <StarRating value={form.getFieldValue('rating') ?? 5} />
                        <Divider style={{ margin: '10px 0' }} />
                        <Space>
                            <Avatar
                                src={form.getFieldValue('avatar')}
                                icon={!form.getFieldValue('avatar') && <UserOutlined />}
                                style={{ background: '#667eea' }}
                            >
                                {!form.getFieldValue('avatar') &&
                                    (form.getFieldValue('name') ?? 'A').charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                                <Text strong>{form.getFieldValue('name') || 'Reviewer Name'}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {[form.getFieldValue('designation'), form.getFieldValue('company')]
                                        .filter(Boolean)
                                        .join(' · ') || 'Designation · Company'}
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Form>
            </Drawer>
        </AdminAuthenticatedLayout>
    );
}
