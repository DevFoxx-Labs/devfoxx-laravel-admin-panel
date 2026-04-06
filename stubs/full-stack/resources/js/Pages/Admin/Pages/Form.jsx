import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeftOutlined,
    EyeOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Space,
    Switch,
    Tabs,
    Tag,
    Typography,
} from 'antd';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9/\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^\/+|\/+?$)/g, '');
}

export default function PageForm({ page }) {
    const isEdit = !!page;

    const { data, setData, post, put, processing, errors } = useForm({
        title: page?.title ?? '',
        path: page?.path ?? '',
        excerpt: page?.excerpt ?? '',
        content: page?.content ?? '',
        status: page?.status ?? 'draft',
        meta_title: page?.meta_title ?? '',
        meta_description: page?.meta_description ?? '',
        meta_keywords: page?.meta_keywords ?? '',
        show_in_menu: page?.show_in_menu ?? false,
        is_homepage: page?.is_homepage ?? false,
        sort_order: page?.sort_order ?? 0,
        published_at: page?.published_at ?? null,
    });

    const previewPath = data.is_homepage
        ? '/'
        : `/${data.path || slugify(data.title || 'new-page')}`;

    const handleSubmit = () => {
        if (isEdit) {
            put(route('admin.pages.update', page.id));
            return;
        }

        post(route('admin.pages.store'));
    };

    const tabItems = [
        {
            key: 'content',
            label: 'Content',
            children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Form.Item
                        label={<Text strong>Page Title</Text>}
                        validateStatus={errors.title ? 'error' : ''}
                        help={errors.title}
                    >
                        <Input
                            size="large"
                            value={data.title}
                            onChange={(event) => {
                                const nextTitle = event.target.value;
                                setData('title', nextTitle);

                                if (! isEdit && ! data.path && ! data.is_homepage) {
                                    setData('path', slugify(nextTitle));
                                }
                            }}
                            placeholder="About Us"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Page Route</Text>}
                        validateStatus={errors.path ? 'error' : ''}
                        help={errors.path || 'Use nested paths like company/about if needed.'}
                    >
                        <Input
                            addonBefore="/"
                            disabled={data.is_homepage}
                            value={data.path}
                            onChange={(event) => setData('path', slugify(event.target.value))}
                            placeholder="about-us"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Excerpt</Text>}
                        validateStatus={errors.excerpt ? 'error' : ''}
                        help={errors.excerpt}
                    >
                        <TextArea
                            rows={3}
                            maxLength={500}
                            showCount
                            value={data.excerpt}
                            onChange={(event) => setData('excerpt', event.target.value)}
                            placeholder="Short summary for cards and previews"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Page Content</Text>}
                        validateStatus={errors.content ? 'error' : ''}
                        help={errors.content}
                    >
                        <TextArea
                            rows={18}
                            value={data.content}
                            onChange={(event) => setData('content', event.target.value)}
                            placeholder="Write the page content here"
                            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
                        />
                    </Form.Item>
                </Space>
            ),
        },
        {
            key: 'seo',
            label: 'SEO',
            children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Form.Item
                        label={<Text strong>Meta Title</Text>}
                        validateStatus={errors.meta_title ? 'error' : ''}
                        help={errors.meta_title}
                    >
                        <Input
                            value={data.meta_title}
                            onChange={(event) => setData('meta_title', event.target.value)}
                            placeholder="Optional search engine title"
                        />
                    </Form.Item>
                    <Form.Item
                        label={<Text strong>Meta Description</Text>}
                        validateStatus={errors.meta_description ? 'error' : ''}
                        help={errors.meta_description}
                    >
                        <TextArea
                            rows={4}
                            maxLength={500}
                            showCount
                            value={data.meta_description}
                            onChange={(event) => setData('meta_description', event.target.value)}
                            placeholder="Optional description for search snippets"
                        />
                    </Form.Item>
                    <Form.Item
                        label={<Text strong>Meta Keywords</Text>}
                        validateStatus={errors.meta_keywords ? 'error' : ''}
                        help={errors.meta_keywords}
                    >
                        <Input
                            value={data.meta_keywords}
                            onChange={(event) => setData('meta_keywords', event.target.value)}
                            placeholder="keyword1, keyword2, keyword3"
                        />
                    </Form.Item>
                </Space>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout
            title={isEdit ? `Edit ${page.title}` : 'Create Page'}
            breadcrumb={`Admin / Pages / ${isEdit ? 'Edit' : 'Create'}`}
        >
            <Head title={isEdit ? 'Edit Page' : 'Create Page'} />

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card bordered={false} style={{ borderRadius: 20 }}>
                        <Form layout="vertical">
                            <Tabs items={tabItems} />
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Card title="Publishing" bordered={false} style={{ borderRadius: 20 }}>
                            <Form layout="vertical">
                                <Form.Item
                                    label={<Text strong>Status</Text>}
                                    validateStatus={errors.status ? 'error' : ''}
                                    help={errors.status}
                                >
                                    <Input
                                        value={data.status}
                                        onChange={() => {}}
                                        hidden
                                    />
                                    <Space wrap>
                                        {['draft', 'published', 'archived'].map((status) => (
                                            <Tag.CheckableTag
                                                key={status}
                                                checked={data.status === status}
                                                onChange={() => setData('status', status)}
                                            >
                                                {status}
                                            </Tag.CheckableTag>
                                        ))}
                                    </Space>
                                </Form.Item>

                                {data.status === 'published' && (
                                    <Form.Item
                                        label={<Text strong>Publish Date</Text>}
                                        validateStatus={errors.published_at ? 'error' : ''}
                                        help={errors.published_at}
                                    >
                                        <DatePicker
                                            showTime
                                            style={{ width: '100%' }}
                                            value={data.published_at ? dayjs(data.published_at) : null}
                                            onChange={(value) =>
                                                setData(
                                                    'published_at',
                                                    value ? value.toISOString() : null,
                                                )
                                            }
                                        />
                                    </Form.Item>
                                )}

                                <Form.Item label={<Text strong>Sort Order</Text>}>
                                    <InputNumber
                                        min={0}
                                        style={{ width: '100%' }}
                                        value={data.sort_order}
                                        onChange={(value) => setData('sort_order', value ?? 0)}
                                    />
                                </Form.Item>

                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                        <Text>Show in navigation</Text>
                                        <Switch
                                            checked={data.show_in_menu}
                                            onChange={(checked) => setData('show_in_menu', checked)}
                                        />
                                    </Space>
                                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                        <Text>Use as homepage</Text>
                                        <Switch
                                            checked={data.is_homepage}
                                            onChange={(checked) => {
                                                setData('is_homepage', checked);
                                                if (checked) {
                                                    setData('path', '');
                                                }
                                            }}
                                        />
                                    </Space>
                                </Space>

                                <Card
                                    size="small"
                                    style={{ marginTop: 20, borderRadius: 16, background: '#fafcff' }}
                                >
                                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                        <Text type="secondary">Public URL</Text>
                                        <Title level={5} style={{ margin: 0 }}>
                                            {previewPath}
                                        </Title>
                                        <Text type="secondary">
                                            This route becomes available on the public site after publish.
                                        </Text>
                                    </Space>
                                </Card>

                                <Space style={{ justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
                                    <Link href={route('admin.pages.index')}>
                                        <Button icon={<ArrowLeftOutlined />}>Back</Button>
                                    </Link>
                                    <Space>
                                        {isEdit && (
                                            <Button
                                                icon={<EyeOutlined />}
                                                href={page?.is_homepage ? '/' : `/${page.path}`}
                                                target="_blank"
                                            >
                                                View
                                            </Button>
                                        )}
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            loading={processing}
                                            onClick={handleSubmit}
                                        >
                                            {isEdit ? 'Update Page' : 'Create Page'}
                                        </Button>
                                    </Space>
                                </Space>
                            </Form>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </AdminAuthenticatedLayout>
    );
}