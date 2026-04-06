import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    Input,
    Row,
    Select,
    Space,
    Tabs,
    Typography,
} from 'antd';

const { Title, Text } = Typography;

export default function Settings({ settings }) {
    const flash = usePage().props.flash ?? {};
    const { data, setData, put, processing, errors } = useForm({
        site_name: settings?.site_name ?? '',
        site_tagline: settings?.site_tagline ?? '',
        site_email: settings?.site_email ?? '',
        site_phone: settings?.site_phone ?? '',
        site_address: settings?.site_address ?? '',
        timezone: settings?.timezone ?? 'UTC',
        maintenance_mode_message: settings?.maintenance_mode_message ?? '',
        seo_meta_title: settings?.seo_meta_title ?? '',
        seo_meta_description: settings?.seo_meta_description ?? '',
        seo_meta_keywords: settings?.seo_meta_keywords ?? '',
        seo_robots: settings?.seo_robots ?? 'index,follow',
        seo_canonical_url: settings?.seo_canonical_url ?? '',
        seo_og_title: settings?.seo_og_title ?? '',
        seo_og_description: settings?.seo_og_description ?? '',
        seo_twitter_card: settings?.seo_twitter_card ?? 'summary_large_image',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'));
    };

    const tabItems = [
        {
            key: 'site',
            label: 'Site Information',
            children: (
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Site Name"
                            validateStatus={errors.site_name ? 'error' : ''}
                            help={errors.site_name}
                            required
                        >
                            <Input
                                value={data.site_name}
                                onChange={(e) =>
                                    setData('site_name', e.target.value)
                                }
                                placeholder="Your website name"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Site Tagline"
                            validateStatus={errors.site_tagline ? 'error' : ''}
                            help={errors.site_tagline}
                        >
                            <Input
                                value={data.site_tagline}
                                onChange={(e) =>
                                    setData('site_tagline', e.target.value)
                                }
                                placeholder="A short brand tagline"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Contact Email"
                            validateStatus={errors.site_email ? 'error' : ''}
                            help={errors.site_email}
                        >
                            <Input
                                type="email"
                                value={data.site_email}
                                onChange={(e) =>
                                    setData('site_email', e.target.value)
                                }
                                placeholder="contact@yourdomain.com"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Contact Phone"
                            validateStatus={errors.site_phone ? 'error' : ''}
                            help={errors.site_phone}
                        >
                            <Input
                                value={data.site_phone}
                                onChange={(e) =>
                                    setData('site_phone', e.target.value)
                                }
                                placeholder="+1 555 123 4567"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Timezone"
                            validateStatus={errors.timezone ? 'error' : ''}
                            help={errors.timezone}
                            required
                        >
                            <Select
                                value={data.timezone}
                                onChange={(value) => setData('timezone', value)}
                                options={[
                                    { value: 'UTC', label: 'UTC' },
                                    {
                                        value: 'Asia/Kolkata',
                                        label: 'Asia/Kolkata',
                                    },
                                    {
                                        value: 'America/New_York',
                                        label: 'America/New_York',
                                    },
                                    {
                                        value: 'Europe/London',
                                        label: 'Europe/London',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label="Site Address"
                            validateStatus={errors.site_address ? 'error' : ''}
                            help={errors.site_address}
                        >
                            <Input.TextArea
                                rows={3}
                                value={data.site_address}
                                onChange={(e) =>
                                    setData('site_address', e.target.value)
                                }
                                placeholder="Official company address"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label="Maintenance Message"
                            validateStatus={
                                errors.maintenance_mode_message ? 'error' : ''
                            }
                            help={errors.maintenance_mode_message}
                        >
                            <Input.TextArea
                                rows={3}
                                value={data.maintenance_mode_message}
                                onChange={(e) =>
                                    setData(
                                        'maintenance_mode_message',
                                        e.target.value,
                                    )
                                }
                                placeholder="Message shown during maintenance"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: 'seo',
            label: 'SEO Settings',
            children: (
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <Form.Item
                            label="SEO Meta Title"
                            validateStatus={errors.seo_meta_title ? 'error' : ''}
                            help={errors.seo_meta_title}
                        >
                            <Input
                                value={data.seo_meta_title}
                                onChange={(e) =>
                                    setData('seo_meta_title', e.target.value)
                                }
                                placeholder="Default title for search engines"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label="SEO Meta Description"
                            validateStatus={
                                errors.seo_meta_description ? 'error' : ''
                            }
                            help={errors.seo_meta_description}
                        >
                            <Input.TextArea
                                rows={4}
                                value={data.seo_meta_description}
                                onChange={(e) =>
                                    setData(
                                        'seo_meta_description',
                                        e.target.value,
                                    )
                                }
                                placeholder="Default description for search snippets"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label="SEO Meta Keywords"
                            validateStatus={
                                errors.seo_meta_keywords ? 'error' : ''
                            }
                            help={errors.seo_meta_keywords}
                        >
                            <Input
                                value={data.seo_meta_keywords}
                                onChange={(e) =>
                                    setData('seo_meta_keywords', e.target.value)
                                }
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Robots Directive"
                            validateStatus={errors.seo_robots ? 'error' : ''}
                            help={errors.seo_robots}
                            required
                        >
                            <Select
                                value={data.seo_robots}
                                onChange={(value) =>
                                    setData('seo_robots', value)
                                }
                                options={[
                                    {
                                        value: 'index,follow',
                                        label: 'index,follow',
                                    },
                                    {
                                        value: 'noindex,follow',
                                        label: 'noindex,follow',
                                    },
                                    {
                                        value: 'index,nofollow',
                                        label: 'index,nofollow',
                                    },
                                    {
                                        value: 'noindex,nofollow',
                                        label: 'noindex,nofollow',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Twitter Card"
                            validateStatus={
                                errors.seo_twitter_card ? 'error' : ''
                            }
                            help={errors.seo_twitter_card}
                            required
                        >
                            <Select
                                value={data.seo_twitter_card}
                                onChange={(value) =>
                                    setData('seo_twitter_card', value)
                                }
                                options={[
                                    { value: 'summary', label: 'summary' },
                                    {
                                        value: 'summary_large_image',
                                        label: 'summary_large_image',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item
                            label="Canonical URL"
                            validateStatus={
                                errors.seo_canonical_url ? 'error' : ''
                            }
                            help={errors.seo_canonical_url}
                        >
                            <Input
                                value={data.seo_canonical_url}
                                onChange={(e) =>
                                    setData('seo_canonical_url', e.target.value)
                                }
                                placeholder="https://example.com"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Open Graph Title"
                            validateStatus={errors.seo_og_title ? 'error' : ''}
                            help={errors.seo_og_title}
                        >
                            <Input
                                value={data.seo_og_title}
                                onChange={(e) =>
                                    setData('seo_og_title', e.target.value)
                                }
                                placeholder="Social title"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Open Graph Description"
                            validateStatus={
                                errors.seo_og_description ? 'error' : ''
                            }
                            help={errors.seo_og_description}
                        >
                            <Input
                                value={data.seo_og_description}
                                onChange={(e) =>
                                    setData('seo_og_description', e.target.value)
                                }
                                placeholder="Social description"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout
            title="Site Settings"
            breadcrumb="Admin / Site Settings"
        >
            <Head title="Site Settings" />

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={4} style={{ marginBottom: 4 }}>
                        Manage Site Information & SEO
                    </Title>
                    <Text type="secondary">
                        Configure global website details and search engine settings
                        from one place.
                    </Text>
                </div>

                <Alert
                    type="info"
                    showIcon
                    message="Tip"
                    description="These settings can be reused across public pages, metadata generation, and theme branding."
                />

                {flash.success && (
                    <Alert type="success" showIcon message={flash.success} />
                )}

                {flash.error && (
                    <Alert type="error" showIcon message={flash.error} />
                )}

                <Card>
                    <Form layout="vertical" onSubmitCapture={submit}>
                        <Tabs items={tabItems} />

                        <Space style={{ marginTop: 8 }}>
                            <Button type="primary" htmlType="submit" loading={processing}>
                                Save Settings
                            </Button>
                        </Space>
                    </Form>
                </Card>
            </Space>
        </AdminAuthenticatedLayout>
    );
}
