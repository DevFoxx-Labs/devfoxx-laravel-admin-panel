import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Button, Card, Col, DatePicker, Form, Input, Row,
    Select, Space, Switch, Tabs, Tag, Typography,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function BlogForm({ blog, categories }) {
    const isEdit = !!blog;

    const { data, setData, post, put, processing, errors } = useForm({
        title:            blog?.title            ?? '',
        slug:             blog?.slug             ?? '',
        excerpt:          blog?.excerpt          ?? '',
        content:          blog?.content          ?? '',
        status:           blog?.status           ?? 'draft',
        featured_image:   blog?.featured_image   ?? '',
        categories:       blog?.categories?.map(c => c.id) ?? [],
        meta_title:       blog?.meta_title        ?? '',
        meta_description: blog?.meta_description  ?? '',
        meta_keywords:    blog?.meta_keywords     ?? '',
        published_at:     blog?.published_at      ?? null,
    });

    function slugify(str) {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    function handleTitleChange(e) {
        setData(prev => ({
            ...prev,
            title: e.target.value,
            slug: isEdit ? prev.slug : slugify(e.target.value),
        }));
    }

    function handleSubmit() {
        if (isEdit) {
            put(route('admin.blogs.update', blog.id));
        } else {
            post(route('admin.blogs.store'));
        }
    }

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    const tabItems = [
        {
            key: 'content',
            label: 'Content',
            children: (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form.Item
                        label={<Text strong>Title</Text>}
                        validateStatus={errors.title ? 'error' : ''}
                        help={errors.title}
                    >
                        <Input
                            size="large"
                            placeholder="Enter blog title..."
                            value={data.title}
                            onChange={handleTitleChange}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Slug</Text>}
                        validateStatus={errors.slug ? 'error' : ''}
                        help={errors.slug}
                    >
                        <Input
                            placeholder="url-slug"
                            addonBefore="/blog/"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Excerpt</Text>}
                        validateStatus={errors.excerpt ? 'error' : ''}
                        help={errors.excerpt}
                    >
                        <TextArea
                            rows={2}
                            maxLength={500}
                            showCount
                            placeholder="Short description shown in listings..."
                            value={data.excerpt}
                            onChange={e => setData('excerpt', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Content</Text>}
                        validateStatus={errors.content ? 'error' : ''}
                        help={errors.content}
                        required
                    >
                        <TextArea
                            rows={16}
                            placeholder="Write your blog content here..."
                            value={data.content}
                            onChange={e => setData('content', e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: 14 }}
                        />
                    </Form.Item>
                </Space>
            ),
        },
        {
            key: 'seo',
            label: 'SEO',
            children: (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form.Item label={<Text strong>Meta Title</Text>}
                        validateStatus={errors.meta_title ? 'error' : ''} help={errors.meta_title}>
                        <Input
                            showCount maxLength={255}
                            placeholder="SEO title (defaults to post title)"
                            value={data.meta_title}
                            onChange={e => setData('meta_title', e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label={<Text strong>Meta Description</Text>}
                        validateStatus={errors.meta_description ? 'error' : ''} help={errors.meta_description}>
                        <TextArea
                            rows={3} showCount maxLength={500}
                            placeholder="Page description for search engines..."
                            value={data.meta_description}
                            onChange={e => setData('meta_description', e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label={<Text strong>Meta Keywords</Text>}>
                        <Input
                            placeholder="keyword1, keyword2, keyword3"
                            value={data.meta_keywords}
                            onChange={e => setData('meta_keywords', e.target.value)}
                        />
                    </Form.Item>
                </Space>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout
            title={isEdit ? `Edit: ${blog.title}` : 'New Blog Post'}
            breadcrumb={`Admin / Blog / ${isEdit ? 'Edit Post' : 'New Post'}`}
        >
            <Head title={isEdit ? 'Edit Blog Post' : 'New Blog Post'} />

            <Row gutter={[24, 24]}>
                {/* Left: main content */}
                <Col xs={24} lg={16}>
                    <Card
                        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
                    >
                        <Form layout="vertical">
                            <Tabs items={tabItems} />
                        </Form>
                    </Card>
                </Col>

                {/* Right: sidebar settings */}
                <Col xs={24} lg={8}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Card
                            title="Publish Settings"
                            size="small"
                            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
                        >
                            <Form layout="vertical">
                                <Form.Item label={<Text strong>Status</Text>}
                                    validateStatus={errors.status ? 'error' : ''} help={errors.status}>
                                    <Select
                                        value={data.status}
                                        onChange={v => setData('status', v)}
                                        options={[
                                            { value: 'draft', label: '📝 Draft' },
                                            { value: 'published', label: '✅ Published' },
                                            { value: 'archived', label: '📦 Archived' },
                                        ]}
                                    />
                                </Form.Item>

                                {data.status === 'published' && (
                                    <Form.Item label={<Text strong>Publish Date</Text>}>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            showTime
                                            value={data.published_at ? dayjs(data.published_at) : null}
                                            onChange={d => setData('published_at', d ? d.toISOString() : null)}
                                        />
                                    </Form.Item>
                                )}

                                <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
                                    <Link href={route('admin.blogs.index')}>
                                        <Button icon={<ArrowLeftOutlined />}>Cancel</Button>
                                    </Link>
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        loading={processing}
                                        onClick={handleSubmit}
                                        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' }}
                                    >
                                        {isEdit ? 'Update Post' : 'Publish Post'}
                                    </Button>
                                </Space>
                            </Form>
                        </Card>

                        <Card
                            title="Categories"
                            size="small"
                            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
                        >
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="Select categories..."
                                value={data.categories}
                                onChange={v => setData('categories', v)}
                                options={categoryOptions}
                                status={errors.categories ? 'error' : ''}
                            />
                            {errors.categories && (
                                <Text type="danger" style={{ fontSize: 12 }}>{errors.categories}</Text>
                            )}
                        </Card>

                        <Card
                            title="Featured Image"
                            size="small"
                            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
                        >
                            <Input
                                placeholder="https://..."
                                value={data.featured_image}
                                onChange={e => setData('featured_image', e.target.value)}
                            />
                            {data.featured_image && (
                                <img
                                    src={data.featured_image}
                                    alt="preview"
                                    style={{ width: '100%', marginTop: 12, borderRadius: 8, objectFit: 'cover', maxHeight: 160 }}
                                />
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>
        </AdminAuthenticatedLayout>
    );
}
