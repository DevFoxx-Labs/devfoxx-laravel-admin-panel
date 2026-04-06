import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Alert,
    App,
    Button,
    Card,
    Col,
    Form,
    Input,
    Modal,
    Popconfirm,
    Progress,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Table,
    Tabs,
    Tag,
    Typography,
} from 'antd';
import {
    BellOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PauseCircleOutlined,
    RedoOutlined,
    SearchOutlined,
    SendOutlined,
    SnippetsOutlined,
    WarningOutlined,
    ApiOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const channelOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'push', label: 'Push' },
];

const audienceOptions = [
    { value: 'all', label: 'All users' },
    { value: 'roles', label: 'Users by role' },
    { value: 'users', label: 'Specific users' },
];

const emptyTemplateForm = {
    name: '',
    slug: '',
    description: '',
    subject_template: '',
    message_template: '',
    action_url_template: '',
    is_active: true,
};

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');

export default function NotificationIndex({
    campaigns,
    deliveries,
    filters,
    roles,
    templates,
    templateVariables,
    stats,
}) {
    const flash = usePage().props.flash ?? {};
    const { message } = App.useApp();
    const [campaignSearch, setCampaignSearch] = useState(filters?.search ?? '');
    const [campaignStatus, setCampaignStatus] = useState(filters?.status ?? '');
    const [deliverySearch, setDeliverySearch] = useState(filters?.delivery_search ?? '');
    const [deliveryStatus, setDeliveryStatus] = useState(filters?.delivery_status ?? '');
    const [deliveryChannel, setDeliveryChannel] = useState(filters?.delivery_channel ?? '');
    const [userOptions, setUserOptions] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const campaignForm = useForm({
        title: '',
        notification_template_id: null,
        subject: '',
        message: '',
        action_url: '',
        custom_variables: '{\n  "promo_code": "WELCOME10"\n}',
        channels: ['email'],
        audience_type: 'all',
        role_names: [],
        user_ids: [],
        scheduled_at: '',
    });

    const templateCreateForm = useForm(emptyTemplateForm);
    const templateEditForm = useForm(emptyTemplateForm);

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }

        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash, message]);

    const activeTemplates = useMemo(
        () => templates.filter((template) => template.is_active),
        [templates],
    );

    const selectedTemplate = useMemo(
        () => templates.find((template) => template.id === campaignForm.data.notification_template_id) ?? null,
        [campaignForm.data.notification_template_id, templates],
    );

    const fetchUsers = async (value) => {
        setLoadingUsers(true);

        try {
            const response = await axios.get(route('admin.notifications.users.search'), {
                params: { search: value },
            });

            setUserOptions(response.data);
        } finally {
            setLoadingUsers(false);
        }
    };

    const submitCampaign = () => {
        campaignForm.post(route('admin.notifications.store'), {
            preserveScroll: true,
            onSuccess: () => {
                campaignForm.reset();
                campaignForm.setData('channels', ['email']);
                campaignForm.setData('audience_type', 'all');
                campaignForm.setData('custom_variables', '{\n  "promo_code": "WELCOME10"\n}');
            },
        });
    };

    const submitCreateTemplate = () => {
        templateCreateForm.post(route('admin.notifications.templates.store'), {
            preserveScroll: true,
            onSuccess: () => templateCreateForm.reset(),
        });
    };

    const submitEditTemplate = () => {
        templateEditForm.put(route('admin.notifications.templates.update', editingTemplate.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingTemplate(null);
                templateEditForm.reset();
            },
        });
    };

    const openTemplateEditor = (template) => {
        setEditingTemplate(template);
        templateEditForm.setData({
            name: template.name,
            slug: template.slug,
            description: template.description ?? '',
            subject_template: template.subject_template ?? '',
            message_template: template.message_template ?? '',
            action_url_template: template.action_url_template ?? '',
            is_active: template.is_active,
        });
    };

    const applyCampaignFilters = (page = 1) => {
        router.get(
            route('admin.notifications.index'),
            {
                campaigns_page: page,
                deliveries_page: deliveries.current_page,
                search: campaignSearch || undefined,
                status: campaignStatus || undefined,
                delivery_search: deliverySearch || undefined,
                delivery_status: deliveryStatus || undefined,
                delivery_channel: deliveryChannel || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const applyDeliveryFilters = (page = 1) => {
        router.get(
            route('admin.notifications.index'),
            {
                campaigns_page: campaigns.current_page,
                deliveries_page: page,
                search: campaignSearch || undefined,
                status: campaignStatus || undefined,
                delivery_search: deliverySearch || undefined,
                delivery_status: deliveryStatus || undefined,
                delivery_channel: deliveryChannel || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetCampaignFilters = () => {
        setCampaignSearch('');
        setCampaignStatus('');
        router.get(route('admin.notifications.index'), {
            delivery_search: deliverySearch || undefined,
            delivery_status: deliveryStatus || undefined,
            delivery_channel: deliveryChannel || undefined,
        });
    };

    const resetDeliveryFilters = () => {
        setDeliverySearch('');
        setDeliveryStatus('');
        setDeliveryChannel('');
        router.get(route('admin.notifications.index'), {
            search: campaignSearch || undefined,
            status: campaignStatus || undefined,
        });
    };

    const historyColumns = [
        {
            title: 'Campaign',
            key: 'title',
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Text strong>{record.title}</Text>
                    <Text type="secondary">{record.subject || 'No explicit email subject'}</Text>
                    {record.template && <Tag color="purple">Template: {record.template.name}</Tag>}
                    <Space wrap>
                        {record.channels.map((channel) => (
                            <Tag key={channel} color="blue">
                                {channel}
                            </Tag>
                        ))}
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Audience',
            dataIndex: 'audience_type',
            key: 'audience_type',
            width: 220,
            render: (value, record) => {
                if (value === 'roles') {
                    return <Text>Roles: {(record.audience_filters?.role_names ?? []).join(', ')}</Text>;
                }

                if (value === 'users') {
                    return <Text>Specific users: {(record.audience_filters?.user_ids ?? []).length}</Text>;
                }

                return <Text>All users</Text>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (value) => {
                const colorMap = {
                    queued: 'default',
                    scheduled: 'gold',
                    processing: 'processing',
                    completed: 'success',
                    cancelled: 'error',
                };

                return <Tag color={colorMap[value] || 'default'}>{value}</Tag>;
            },
        },
        {
            title: 'Progress',
            key: 'progress',
            width: 230,
            render: (_, record) => {
                const total = record.total_recipients || 0;
                const percent = total > 0 ? Math.round((record.processed_recipients / total) * 100) : 0;

                return (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Progress percent={percent} size="small" />
                        <Text type="secondary">
                            {record.processed_recipients}/{total} processed
                        </Text>
                        <Text type="secondary">
                            {record.sent_recipients} sent, {record.failed_recipients} failed, {record.skipped_recipients} skipped
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: 'Scheduled',
            key: 'scheduled_at',
            width: 190,
            render: (_, record) => formatDate(record.scheduled_at || record.created_at),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 220,
            render: (_, record) => (
                <Space wrap>
                    {record.failed_recipients > 0 && (
                        <Button
                            icon={<RedoOutlined />}
                            size="small"
                            onClick={() =>
                                router.post(
                                    route('admin.notifications.retry-failures', record.id),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            Retry Failures
                        </Button>
                    )}
                    {['queued', 'scheduled', 'processing'].includes(record.status) && (
                        <Popconfirm
                            title="Cancel this campaign?"
                            description="Queued chunk jobs will stop when they reach the cancellation check."
                            onConfirm={() =>
                                router.post(
                                    route('admin.notifications.cancel', record.id),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            okText="Cancel Campaign"
                            cancelText="Keep Running"
                        >
                            <Button danger size="small">
                                Cancel
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const deliveryColumns = [
        {
            title: 'Recipient',
            key: 'recipient',
            render: (_, record) => (
                <Space direction="vertical" size={1}>
                    <Text strong>{record.user?.name || 'Deleted user'}</Text>
                    <Text type="secondary">{record.user?.email || record.destination || 'Unknown destination'}</Text>
                    <Text type="secondary">{record.campaign?.title || 'Campaign removed'}</Text>
                </Space>
            ),
        },
        {
            title: 'Channel',
            dataIndex: 'channel',
            key: 'channel',
            width: 120,
            render: (value) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Status',
            key: 'status',
            width: 180,
            render: (_, record) => (
                <Space direction="vertical" size={1}>
                    <Tag color={record.status === 'failed' ? 'error' : record.status === 'delivered' ? 'success' : 'processing'}>
                        {record.status}
                    </Tag>
                    {record.external_status && <Text type="secondary">Provider: {record.external_status}</Text>}
                </Space>
            ),
        },
        {
            title: 'Attempts',
            key: 'attempts',
            width: 120,
            render: (_, record) => (
                <Space direction="vertical" size={1}>
                    <Text>{record.attempt_count}</Text>
                    <Text type="secondary">{formatDate(record.last_attempted_at)}</Text>
                </Space>
            ),
        },
        {
            title: 'Provider',
            key: 'provider',
            width: 170,
            render: (_, record) => (
                <Space direction="vertical" size={1}>
                    <Text>{record.provider || '—'}</Text>
                    <Text type="secondary">{record.provider_reference || 'No reference'}</Text>
                </Space>
            ),
        },
        {
            title: 'Error',
            dataIndex: 'error_message',
            key: 'error_message',
            ellipsis: true,
            render: (value) => value || '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Button
                    size="small"
                    icon={<RedoOutlined />}
                    disabled={!['failed', 'skipped'].includes(record.status)}
                    onClick={() =>
                        router.post(
                            route('admin.notification-deliveries.retry', record.id),
                            {},
                            { preserveScroll: true },
                        )
                    }
                >
                    Retry
                </Button>
            ),
        },
    ];

    const templateColumns = [
        {
            title: 'Template',
            key: 'template',
            render: (_, record) => (
                <Space direction="vertical" size={1}>
                    <Text strong>{record.name}</Text>
                    <Text type="secondary">/{record.slug}</Text>
                    {record.description && <Text type="secondary">{record.description}</Text>}
                </Space>
            ),
        },
        {
            title: 'Preview',
            key: 'preview',
            render: (_, record) => (
                <Space direction="vertical" size={1}>
                    <Text>{record.subject_template || 'No subject template'}</Text>
                    <Text type="secondary" ellipsis>
                        {record.message_template}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (value) => <Tag color={value ? 'success' : 'default'}>{value ? 'Active' : 'Inactive'}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 190,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openTemplateEditor(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete this template?"
                        description="If a campaign already uses it, the template will be deactivated instead."
                        onConfirm={() =>
                            router.delete(route('admin.notifications.templates.destroy', record.id), {
                                preserveScroll: true,
                            })
                        }
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <Button danger size="small">
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const statsCards = [
        {
            title: 'Total Campaigns',
            value: stats.total,
            icon: <BellOutlined />,
            color: '#1677ff',
        },
        {
            title: 'Queued',
            value: stats.queued,
            icon: <ClockCircleOutlined />,
            color: '#faad14',
        },
        {
            title: 'Processing',
            value: stats.processing,
            icon: <PauseCircleOutlined />,
            color: '#722ed1',
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
        },
        {
            title: 'Failed Deliveries',
            value: stats.failed_deliveries,
            icon: <WarningOutlined />,
            color: '#ff4d4f',
        },
        {
            title: 'Webhook Events',
            value: stats.webhook_events,
            icon: <ApiOutlined />,
            color: '#13c2c2',
        },
    ];

    const tabItems = [
        {
            key: 'compose',
            label: 'Compose Campaign',
            children: (
                <Card bordered={false} style={{ borderRadius: 18 }}>
                    <Form layout="vertical" onFinish={submitCampaign}>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Campaign Title"
                                    validateStatus={campaignForm.errors.title ? 'error' : ''}
                                    help={campaignForm.errors.title}
                                    required
                                >
                                    <Input
                                        value={campaignForm.data.title}
                                        onChange={(event) => campaignForm.setData('title', event.target.value)}
                                        placeholder="Example: Summer release announcement"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Template"
                                    validateStatus={campaignForm.errors.notification_template_id ? 'error' : ''}
                                    help={campaignForm.errors.notification_template_id || 'Optional. Select a reusable template to personalize each delivery.'}
                                >
                                    <Select
                                        allowClear
                                        value={campaignForm.data.notification_template_id}
                                        options={activeTemplates.map((template) => ({
                                            value: template.id,
                                            label: template.name,
                                        }))}
                                        onChange={(value) => campaignForm.setData('notification_template_id', value ?? null)}
                                        placeholder="Compose manually or choose a template"
                                    />
                                </Form.Item>
                            </Col>

                            {selectedTemplate ? (
                                <>
                                    <Col xs={24} md={12}>
                                        <Alert
                                            type="info"
                                            showIcon
                                            message={selectedTemplate.name}
                                            description={selectedTemplate.description || 'This campaign will render per-user placeholders at send time.'}
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Alert
                                            type="success"
                                            showIcon
                                            message="Template-driven campaign"
                                            description="The stored subject, message, and action URL will be copied from the selected template and personalized for every recipient."
                                        />
                                    </Col>
                                </>
                            ) : (
                                <>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Email Subject"
                                            validateStatus={campaignForm.errors.subject ? 'error' : ''}
                                            help={campaignForm.errors.subject}
                                        >
                                            <Input
                                                value={campaignForm.data.subject}
                                                onChange={(event) => campaignForm.setData('subject', event.target.value)}
                                                placeholder="Required when email delivery is selected"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item
                                            label="Message"
                                            validateStatus={campaignForm.errors.message ? 'error' : ''}
                                            help={campaignForm.errors.message}
                                            required
                                        >
                                            <TextArea
                                                rows={6}
                                                value={campaignForm.data.message}
                                                onChange={(event) => campaignForm.setData('message', event.target.value)}
                                                placeholder="Write the body that should be delivered across channels."
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Action URL"
                                            validateStatus={campaignForm.errors.action_url ? 'error' : ''}
                                            help={campaignForm.errors.action_url || 'Optional call-to-action link for email and push.'}
                                        >
                                            <Input
                                                value={campaignForm.data.action_url}
                                                onChange={(event) => campaignForm.setData('action_url', event.target.value)}
                                                placeholder="https://example.com/offers"
                                            />
                                        </Form.Item>
                                    </Col>
                                </>
                            )}

                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Custom Variables JSON"
                                    validateStatus={campaignForm.errors.custom_variables ? 'error' : ''}
                                    help={campaignForm.errors.custom_variables || 'These values are available as {{ custom.key }} in templates.'}
                                >
                                    <TextArea
                                        rows={selectedTemplate ? 6 : 4}
                                        value={campaignForm.data.custom_variables}
                                        onChange={(event) => campaignForm.setData('custom_variables', event.target.value)}
                                        placeholder={'{\n  "promo_code": "WELCOME10"\n}'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card size="small" title="Available Variables" style={{ borderRadius: 14 }}>
                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                        {Object.entries(templateVariables).map(([key, description]) => (
                                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                                <Text code>{key}</Text>
                                                <Text type="secondary">{description}</Text>
                                            </div>
                                        ))}
                                    </Space>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Channels"
                                    validateStatus={campaignForm.errors.channels ? 'error' : ''}
                                    help={campaignForm.errors.channels}
                                    required
                                >
                                    <Select
                                        mode="multiple"
                                        value={campaignForm.data.channels}
                                        onChange={(value) => campaignForm.setData('channels', value)}
                                        options={channelOptions}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Audience"
                                    validateStatus={campaignForm.errors.audience_type ? 'error' : ''}
                                    help={campaignForm.errors.audience_type}
                                    required
                                >
                                    <Select
                                        value={campaignForm.data.audience_type}
                                        options={audienceOptions}
                                        onChange={(value) => {
                                            campaignForm.setData('audience_type', value);
                                            campaignForm.setData('role_names', []);
                                            campaignForm.setData('user_ids', []);
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={16}>
                                {campaignForm.data.audience_type === 'roles' && (
                                    <Form.Item
                                        label="Roles"
                                        validateStatus={campaignForm.errors.role_names ? 'error' : ''}
                                        help={campaignForm.errors.role_names}
                                        required
                                    >
                                        <Select
                                            mode="multiple"
                                            value={campaignForm.data.role_names}
                                            options={roles.map((roleName) => ({ value: roleName, label: roleName }))}
                                            onChange={(value) => campaignForm.setData('role_names', value)}
                                        />
                                    </Form.Item>
                                )}

                                {campaignForm.data.audience_type === 'users' && (
                                    <Form.Item
                                        label="Specific Users"
                                        validateStatus={campaignForm.errors.user_ids ? 'error' : ''}
                                        help={campaignForm.errors.user_ids}
                                        required
                                    >
                                        <Select
                                            mode="multiple"
                                            showSearch
                                            filterOption={false}
                                            onSearch={fetchUsers}
                                            loading={loadingUsers}
                                            value={campaignForm.data.user_ids}
                                            options={userOptions}
                                            onChange={(value) => campaignForm.setData('user_ids', value)}
                                            placeholder="Search users by name, email, or phone"
                                        />
                                    </Form.Item>
                                )}
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Schedule For"
                                    validateStatus={campaignForm.errors.scheduled_at ? 'error' : ''}
                                    help={campaignForm.errors.scheduled_at || 'Leave blank to queue immediately.'}
                                >
                                    <Input
                                        type="datetime-local"
                                        value={campaignForm.data.scheduled_at}
                                        onChange={(event) => campaignForm.setData('scheduled_at', event.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                            <Alert
                                style={{ flex: 1, minWidth: 280 }}
                                type="info"
                                showIcon
                                message="Scalable delivery"
                                description="Campaigns are queued and chunked into background jobs. Twilio callback URLs and OneSignal webhook reconciliation are supported, and failed deliveries can be retried from the monitoring tab."
                            />
                            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={campaignForm.processing}>
                                Queue Campaign
                            </Button>
                        </Space>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'templates',
            label: 'Templates',
            children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card bordered={false} style={{ borderRadius: 18 }} title="Create Template">
                        <Form layout="vertical" onFinish={submitCreateTemplate}>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={8}>
                                    <Form.Item label="Name" validateStatus={templateCreateForm.errors.name ? 'error' : ''} help={templateCreateForm.errors.name} required>
                                        <Input value={templateCreateForm.data.name} onChange={(event) => templateCreateForm.setData('name', event.target.value)} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item label="Slug" validateStatus={templateCreateForm.errors.slug ? 'error' : ''} help={templateCreateForm.errors.slug || 'Auto-generated if blank.'}>
                                        <Input value={templateCreateForm.data.slug} onChange={(event) => templateCreateForm.setData('slug', event.target.value)} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item label="Active">
                                        <Switch checked={templateCreateForm.data.is_active} onChange={(value) => templateCreateForm.setData('is_active', value)} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item label="Description" validateStatus={templateCreateForm.errors.description ? 'error' : ''} help={templateCreateForm.errors.description}>
                                        <Input value={templateCreateForm.data.description} onChange={(event) => templateCreateForm.setData('description', event.target.value)} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Subject Template" validateStatus={templateCreateForm.errors.subject_template ? 'error' : ''} help={templateCreateForm.errors.subject_template}>
                                        <Input value={templateCreateForm.data.subject_template} onChange={(event) => templateCreateForm.setData('subject_template', event.target.value)} placeholder="Hello {{ user.name }}" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Action URL Template" validateStatus={templateCreateForm.errors.action_url_template ? 'error' : ''} help={templateCreateForm.errors.action_url_template}>
                                        <Input value={templateCreateForm.data.action_url_template} onChange={(event) => templateCreateForm.setData('action_url_template', event.target.value)} placeholder="{{ site.url }}/offers/{{ custom.promo_code }}" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item label="Message Template" validateStatus={templateCreateForm.errors.message_template ? 'error' : ''} help={templateCreateForm.errors.message_template} required>
                                        <TextArea rows={6} value={templateCreateForm.data.message_template} onChange={(event) => templateCreateForm.setData('message_template', event.target.value)} placeholder={'Hello {{ user.name }},\nYour promo code is {{ custom.promo_code }}.'} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button type="primary" htmlType="submit" icon={<SnippetsOutlined />} loading={templateCreateForm.processing}>
                                Save Template
                            </Button>
                        </Form>
                    </Card>

                    <Card bordered={false} style={{ borderRadius: 18 }} title="Template Library">
                        <Table rowKey="id" columns={templateColumns} dataSource={templates} pagination={false} />
                    </Card>
                </Space>
            ),
        },
        {
            key: 'history',
            label: 'Campaign History',
            children: (
                <Card bordered={false} style={{ borderRadius: 18 }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Space wrap>
                            <Input
                                allowClear
                                prefix={<SearchOutlined />}
                                value={campaignSearch}
                                onChange={(event) => setCampaignSearch(event.target.value)}
                                onPressEnter={() => applyCampaignFilters()}
                                placeholder="Search campaigns"
                                style={{ width: 260 }}
                            />
                            <Select
                                allowClear
                                value={campaignStatus || undefined}
                                onChange={(value) => setCampaignStatus(value ?? '')}
                                placeholder="Filter by status"
                                style={{ width: 200 }}
                                options={[
                                    { value: 'queued', label: 'Queued' },
                                    { value: 'scheduled', label: 'Scheduled' },
                                    { value: 'processing', label: 'Processing' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                            />
                            <Button onClick={() => applyCampaignFilters()}>Apply</Button>
                            <Button onClick={resetCampaignFilters}>Reset</Button>
                        </Space>

                        <Table
                            rowKey="id"
                            columns={historyColumns}
                            dataSource={campaigns.data}
                            pagination={{
                                current: campaigns.current_page,
                                pageSize: campaigns.per_page,
                                total: campaigns.total,
                                onChange: (page) => applyCampaignFilters(page),
                            }}
                        />
                    </Space>
                </Card>
            ),
        },
        {
            key: 'deliveries',
            label: 'Delivery Monitoring',
            children: (
                <Card bordered={false} style={{ borderRadius: 18 }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Alert
                            type="warning"
                            showIcon
                            message="Webhook-aware delivery states"
                            description="Twilio and OneSignal can call back into the app to reconcile delivered and failed states. Use the retry action after correcting missing numbers, push tokens, or provider credentials."
                        />
                        <Space wrap>
                            <Input
                                allowClear
                                prefix={<SearchOutlined />}
                                value={deliverySearch}
                                onChange={(event) => setDeliverySearch(event.target.value)}
                                onPressEnter={() => applyDeliveryFilters()}
                                placeholder="Search by recipient, campaign, or provider reference"
                                style={{ width: 320 }}
                            />
                            <Select
                                allowClear
                                value={deliveryStatus || undefined}
                                onChange={(value) => setDeliveryStatus(value ?? '')}
                                placeholder="Status"
                                style={{ width: 180 }}
                                options={[
                                    { value: 'sent', label: 'Sent' },
                                    { value: 'delivered', label: 'Delivered' },
                                    { value: 'failed', label: 'Failed' },
                                    { value: 'skipped', label: 'Skipped' },
                                ]}
                            />
                            <Select
                                allowClear
                                value={deliveryChannel || undefined}
                                onChange={(value) => setDeliveryChannel(value ?? '')}
                                placeholder="Channel"
                                style={{ width: 160 }}
                                options={channelOptions}
                            />
                            <Button onClick={() => applyDeliveryFilters()}>Apply</Button>
                            <Button onClick={resetDeliveryFilters}>Reset</Button>
                        </Space>

                        <Table
                            rowKey="id"
                            columns={deliveryColumns}
                            dataSource={deliveries.data}
                            pagination={{
                                current: deliveries.current_page,
                                pageSize: deliveries.per_page,
                                total: deliveries.total,
                                onChange: (page) => applyDeliveryFilters(page),
                            }}
                        />
                    </Space>
                </Card>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout title="Notification Management" breadcrumb="Admin / Notifications">
            <Head title="Notification Management" />

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                    {statsCards.map((item) => (
                        <Col xs={12} md={8} xl={4} key={item.title}>
                            <Card bordered={false} style={{ borderRadius: 18 }}>
                                <Statistic title={item.title} value={item.value} prefix={item.icon} valueStyle={{ color: item.color }} />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Alert
                    type="warning"
                    showIcon
                    message="Horizon requires Linux or WSL"
                    description={
                        <Paragraph style={{ marginBottom: 0 }}>
                            Laravel Horizon cannot be installed on this Windows PHP runtime because it requires <Text code>ext-pcntl</Text> and <Text code>ext-posix</Text>. Deploy Horizon on a Linux or WSL environment with Redis-backed queues to monitor and auto-scale the <Text code>notifications</Text> queue.
                        </Paragraph>
                    }
                />

                <Tabs items={tabItems} />
            </Space>

            <Modal
                open={Boolean(editingTemplate)}
                title={editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Edit Template'}
                onCancel={() => {
                    setEditingTemplate(null);
                    templateEditForm.reset();
                }}
                onOk={submitEditTemplate}
                confirmLoading={templateEditForm.processing}
                width={840}
            >
                <Form layout="vertical">
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Name" validateStatus={templateEditForm.errors.name ? 'error' : ''} help={templateEditForm.errors.name}>
                                <Input value={templateEditForm.data.name} onChange={(event) => templateEditForm.setData('name', event.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Slug" validateStatus={templateEditForm.errors.slug ? 'error' : ''} help={templateEditForm.errors.slug}>
                                <Input value={templateEditForm.data.slug} onChange={(event) => templateEditForm.setData('slug', event.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item label="Description" validateStatus={templateEditForm.errors.description ? 'error' : ''} help={templateEditForm.errors.description}>
                                <Input value={templateEditForm.data.description} onChange={(event) => templateEditForm.setData('description', event.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Subject Template" validateStatus={templateEditForm.errors.subject_template ? 'error' : ''} help={templateEditForm.errors.subject_template}>
                                <Input value={templateEditForm.data.subject_template} onChange={(event) => templateEditForm.setData('subject_template', event.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Action URL Template" validateStatus={templateEditForm.errors.action_url_template ? 'error' : ''} help={templateEditForm.errors.action_url_template}>
                                <Input value={templateEditForm.data.action_url_template} onChange={(event) => templateEditForm.setData('action_url_template', event.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item label="Message Template" validateStatus={templateEditForm.errors.message_template ? 'error' : ''} help={templateEditForm.errors.message_template}>
                                <TextArea rows={6} value={templateEditForm.data.message_template} onChange={(event) => templateEditForm.setData('message_template', event.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item label="Active">
                                <Switch checked={templateEditForm.data.is_active} onChange={(value) => templateEditForm.setData('is_active', value)} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </AdminAuthenticatedLayout>
    );
}
