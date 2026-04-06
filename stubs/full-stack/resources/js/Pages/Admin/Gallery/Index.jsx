import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import DeleteActionButton from '@/Components/Admin/DeleteActionButton';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    App,
    Button,
    Card,
    Col,
    Drawer,
    Empty,
    Form,
    Grid,
    Image,
    Input,
    InputNumber,
    Masonry,
    Pagination,
    Row,
    Segmented,
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
    VideoCameraOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='Arial, sans-serif' font-size='20'%3EImage unavailable%3C/text%3E%3C/svg%3E";

function GalleryPreview({ item, mediaPreview, thumbnailPreview }) {
    const previewSource = mediaPreview || item?.media_url || null;
    const posterSource = thumbnailPreview || item?.thumbnail_url || null;
    const mediaType = item?.media_type;

    if (!previewSource) {
        return (
            <div
                style={{
                    height: 220,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                {mediaType === 'video' ? <VideoCameraOutlined style={{ fontSize: 32 }} /> : <PictureOutlined style={{ fontSize: 32 }} />}
                <Text type="secondary">Upload a file to preview it here</Text>
            </div>
        );
    }

    if (mediaType === 'video') {
        return (
            <video
                src={previewSource}
                poster={posterSource || undefined}
                controls
                style={{ width: '100%', borderRadius: 16, background: '#000', maxHeight: 280 }}
            />
        );
    }

    return <Image src={previewSource} alt={item?.alt_text || item?.title || 'Gallery preview'} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 280 }} />;
}

function GalleryCard({ item, onEdit, onDelete, onRestore, onForceDelete, onToggleFeatured, onToggleActive }) {
    const isTrashed = !!item.deleted_at;

    return (
        <Card
            hoverable={!isTrashed}
            style={{
                borderRadius: 18,
                height: '100%',
                overflow: 'hidden',
                border: isTrashed ? '1px solid #ffccc7' : item.is_featured ? '1px solid #adc6ff' : '1px solid #f0f0f0',
                opacity: isTrashed ? 0.8 : 1,
            }}
            cover={
                <div style={{ background: '#f8fafc', padding: 12 }}>
                    {item.media_type === 'video' ? (
                        <video
                            src={item.media_url}
                            poster={item.thumbnail_url || undefined}
                            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, background: '#000' }}
                            muted
                        />
                    ) : (
                        <img
                            src={item.media_url}
                            alt={item.alt_text || item.title}
                            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12 }}
                        />
                    )}
                </div>
            }
            actions={
                isTrashed
                    ? [
                          <Tooltip key="restore" title="Restore">
                              <Button type="text" icon={<UndoOutlined />} onClick={() => onRestore(item)} />
                          </Tooltip>,
                          <DeleteActionButton
                              key="force-delete"
                              title="Delete permanently?"
                              description="This removes the media files from storage as well."
                              onConfirm={() => onForceDelete(item)}
                              tooltip="Delete Forever"
                              okText="Delete Forever"
                              buttonType="text"
                              buttonProps={{ danger: true }}
                          />,
                      ]
                    : [
                          <Tooltip key="view" title="Open media">
                              <Button type="text" icon={<EyeOutlined />} href={item.media_url} target="_blank" />
                          </Tooltip>,
                          <Tooltip key="edit" title="Edit">
                              <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(item)} />
                          </Tooltip>,
                          <DeleteActionButton
                              key="trash"
                              title="Move this gallery item to trash?"
                              description="You can restore it later from the trash view."
                              onConfirm={() => onDelete(item)}
                              tooltip="Trash"
                              okText="Trash"
                              buttonType="text"
                              buttonProps={{ danger: true }}
                          />,
                      ]
            }
            bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
            <Space wrap>
                <Tag color={item.media_type === 'video' ? 'volcano' : 'blue'}>{item.media_type}</Tag>
                {item.is_featured && <Tag color="gold">Featured</Tag>}
                {!isTrashed && <Tag color={item.is_active ? 'success' : 'default'}>{item.is_active ? 'Active' : 'Inactive'}</Tag>}
                {isTrashed && <Tag color="error">Trashed</Tag>}
            </Space>

            <div>
                <Title level={5} style={{ marginBottom: 4 }}>{item.title}</Title>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, color: '#64748b' }}>
                    {item.description || 'No description added'}
                </Paragraph>
            </div>

            <Space style={{ justifyContent: 'space-between', width: '100%' }} align="center">
                <Text type="secondary">Sort #{item.sort_order}</Text>
                {!isTrashed && (
                    <Space>
                        <Tooltip title={item.is_featured ? 'Unfeature' : 'Feature'}>
                            <Button
                                type="text"
                                icon={<StarFilled style={{ color: item.is_featured ? '#fadb14' : '#d9d9d9' }} />}
                                onClick={() => onToggleFeatured(item)}
                            />
                        </Tooltip>
                        <Switch size="small" checked={item.is_active} onChange={() => onToggleActive(item)} />
                    </Space>
                )}
            </Space>
        </Card>
    );
}

function MasonryGalleryItem({ item }) {
    if (item.media_type === 'video') {
        if (item.thumbnail_url) {
            return (
                <Image
                    src={item.thumbnail_url}
                    alt={item.alt_text || item.title}
                    preview={false}
                    placeholder={<div style={{ width: '100%', aspectRatio: '4 / 3', background: '#f8fafc' }} />}
                    fallback={FALLBACK_IMAGE}
                    style={{ width: '100%', display: 'block', borderRadius: 12 }}
                />
            );
        }

        return (
            <video
                src={item.media_url}
                muted
                controls
                preload="metadata"
                style={{ width: '100%', display: 'block', borderRadius: 12, background: '#000' }}
            />
        );
    }

    return (
        <Image
            src={item.media_url}
            alt={item.alt_text || item.title || 'gallery-image'}
            preview={false}
            placeholder={<div style={{ width: '100%', aspectRatio: '4 / 3', background: '#f8fafc' }} />}
            fallback={FALLBACK_IMAGE}
            style={{ width: '100%', display: 'block', borderRadius: 12 }}
        />
    );
}

export default function GalleryIndex({ galleryItems, filters, stats }) {
    const { flash } = usePage().props;
    const { message } = App.useApp();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [mediaTypeFilter, setMediaTypeFilter] = useState(filters?.media_type ?? '');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [viewMode, setViewMode] = useState('cards');
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    const { data, setData, reset, processing, errors } = useForm({
        title: '',
        description: '',
        media_type: 'image',
        media_file: null,
        thumbnail_file: null,
        alt_text: '',
        is_active: true,
        is_featured: false,
        sort_order: 0,
        published_at: null,
    });

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
        if (flash?.error) message.error(flash.error);
    }, [flash, message]);

    useEffect(() => () => {
        if (mediaPreview?.startsWith('blob:')) URL.revokeObjectURL(mediaPreview);
        if (thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
    }, [mediaPreview, thumbnailPreview]);

    const statsCards = useMemo(() => ([
        { title: 'Total Media', value: stats.total, color: '#1677ff' },
        { title: 'Active', value: stats.active, color: '#52c41a' },
        { title: 'Videos', value: stats.video, color: '#fa541c' },
        { title: 'Featured', value: stats.featured, color: '#722ed1' },
        { title: 'Trashed', value: stats.trashed, color: '#ff4d4f' },
    ]), [stats]);

    const closeDrawer = () => {
        form.resetFields();
        reset();
        setEditing(null);
        setDrawerOpen(false);
        setMediaPreview(null);
        setThumbnailPreview(null);
    };

    const openCreate = () => {
        closeDrawer();
        setDrawerOpen(true);
        form.setFieldsValue({
            title: '',
            description: '',
            media_type: 'image',
            alt_text: '',
            is_active: true,
            is_featured: false,
            sort_order: 0,
        });
    };

    const openEdit = (item) => {
        setEditing(item);
        setDrawerOpen(true);
        setMediaPreview(item.media_url);
        setThumbnailPreview(item.thumbnail_url);
        const nextData = {
            title: item.title,
            description: item.description || '',
            media_type: item.media_type,
            media_file: null,
            thumbnail_file: null,
            alt_text: item.alt_text || '',
            is_active: item.is_active,
            is_featured: item.is_featured,
            sort_order: item.sort_order,
            published_at: item.published_at,
        };
        setData(nextData);
        form.setFieldsValue(nextData);
    };

    const setPreviewFile = (key, file) => {
        setData(key, file || null);

        if (key === 'media_file') {
            if (mediaPreview?.startsWith('blob:')) URL.revokeObjectURL(mediaPreview);
            setMediaPreview(file ? URL.createObjectURL(file) : (editing?.media_url || null));
        }

        if (key === 'thumbnail_file') {
            if (thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
            setThumbnailPreview(file ? URL.createObjectURL(file) : (editing?.thumbnail_url || null));
        }
    };

    const handleSubmit = () => {
        const options = {
            forceFormData: true,
            onSuccess: () => closeDrawer(),
        };

        if (editing) {
            router.post(route('admin.gallery.update', editing.id), { ...data, _method: 'put' }, options);
            return;
        }

        router.post(route('admin.gallery.store'), data, options);
    };

    const applyFilters = () => {
        router.get(route('admin.gallery.index'), {
            search: search || undefined,
            status: status || undefined,
            media_type: mediaTypeFilter || undefined,
        }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setMediaTypeFilter('');
        router.get(route('admin.gallery.index'));
    };

    const masonryColumns = useMemo(() => {
        if (screens.xxl) return 5;
        if (screens.xl) return 4;
        if (screens.lg) return 3;
        if (screens.md) return 2;
        return 1;
    }, [screens]);

    return (
        <AdminAuthenticatedLayout title="Gallery Management" breadcrumb="Admin / Gallery">
            <Head title="Gallery Management" />

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statsCards.map((card) => (
                    <Col xs={12} md={8} lg={4} key={card.title}>
                        <Card bordered={false} style={{ borderRadius: 16 }}>
                            <Statistic title={card.title} value={card.value} valueStyle={{ color: card.color }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card bordered={false} style={{ borderRadius: 20, marginBottom: 24 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                    <Space wrap>
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search gallery"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onPressEnter={applyFilters}
                            style={{ width: 240 }}
                        />
                        <Select
                            allowClear
                            placeholder="Media type"
                            value={mediaTypeFilter || undefined}
                            onChange={(value) => setMediaTypeFilter(value ?? '')}
                            style={{ width: 160 }}
                            options={[
                                { value: 'image', label: 'Images' },
                                { value: 'video', label: 'Videos' },
                            ]}
                        />
                        <Select
                            allowClear
                            placeholder="Status"
                            value={status || undefined}
                            onChange={(value) => setStatus(value ?? '')}
                            style={{ width: 160 }}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'featured', label: 'Featured' },
                                { value: 'trashed', label: 'Trashed' },
                            ]}
                        />
                        <Button type="primary" onClick={applyFilters}>Apply</Button>
                        <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset</Button>
                    </Space>

                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                        Add Gallery Item
                    </Button>
                </Space>

                <div style={{ marginTop: 16 }}>
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'Card Grid', value: 'cards' },
                            { label: 'Masonry', value: 'masonry' },
                        ]}
                    />
                </div>
            </Card>

            {galleryItems.data.length === 0 ? (
                <Card bordered={false} style={{ borderRadius: 20 }}>
                    <Empty description="No gallery media found">
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                            Create First Item
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <>
                    {viewMode === 'cards' ? (
                        <Row gutter={[16, 16]}>
                            {galleryItems.data.map((item) => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                                    <GalleryCard
                                        item={item}
                                        onEdit={openEdit}
                                        onDelete={(record) => router.delete(route('admin.gallery.destroy', record.id))}
                                        onRestore={(record) => router.patch(route('admin.gallery.restore', record.id))}
                                        onForceDelete={(record) => router.delete(route('admin.gallery.force-delete', record.id))}
                                        onToggleFeatured={(record) => router.patch(route('admin.gallery.toggle-featured', record.id))}
                                        onToggleActive={(record) => router.patch(route('admin.gallery.toggle-active', record.id))}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Masonry
                            columns={masonryColumns}
                            gutter={16}
                            items={galleryItems.data.map((item) => ({ key: `gallery-${item.id}`, data: item }))}
                            itemRender={({ data: item }) => (
                                <MasonryGalleryItem item={item} />
                            )}
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <Pagination
                            current={galleryItems.current_page}
                            pageSize={galleryItems.per_page}
                            total={galleryItems.total}
                            onChange={(page) => router.get(route('admin.gallery.index'), {
                                page,
                                search: search || undefined,
                                status: status || undefined,
                                media_type: mediaTypeFilter || undefined,
                            }, { preserveState: true, replace: true })}
                        />
                    </div>
                </>
            )}

            <Drawer
                title={editing ? 'Edit Gallery Item' : 'Create Gallery Item'}
                width={720}
                open={drawerOpen}
                onClose={closeDrawer}
                destroyOnClose
                extra={
                    <Space>
                        <Button onClick={closeDrawer}>Cancel</Button>
                        <Button type="primary" loading={processing} onClick={handleSubmit}>Save</Button>
                    </Space>
                }
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={13}>
                        <Form form={form} layout="vertical">
                            <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title}>
                                <Input value={data.title} onChange={(event) => setData('title', event.target.value)} />
                            </Form.Item>
                            <Form.Item label="Description" validateStatus={errors.description ? 'error' : ''} help={errors.description}>
                                <TextArea rows={4} value={data.description} onChange={(event) => setData('description', event.target.value)} />
                            </Form.Item>
                            <Form.Item label="Media Type" validateStatus={errors.media_type ? 'error' : ''} help={errors.media_type}>
                                <Select
                                    value={data.media_type}
                                    onChange={(value) => setData('media_type', value)}
                                    options={[
                                        { value: 'image', label: 'Image' },
                                        { value: 'video', label: 'Video' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item label={data.media_type === 'video' ? 'Video File' : 'Image File'} validateStatus={errors.media_file ? 'error' : ''} help={errors.media_file || 'Supported: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV'}>
                                <input type="file" accept={data.media_type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'} onChange={(event) => setPreviewFile('media_file', event.target.files?.[0] || null)} />
                            </Form.Item>
                            <Form.Item label="Video Poster / Optional Thumbnail" validateStatus={errors.thumbnail_file ? 'error' : ''} help={errors.thumbnail_file || 'Recommended for videos. Optional for images.'}>
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPreviewFile('thumbnail_file', event.target.files?.[0] || null)} />
                            </Form.Item>
                            <Form.Item label="Alt Text" validateStatus={errors.alt_text ? 'error' : ''} help={errors.alt_text}>
                                <Input value={data.alt_text} onChange={(event) => setData('alt_text', event.target.value)} />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Sort Order" validateStatus={errors.sort_order ? 'error' : ''} help={errors.sort_order}>
                                        <InputNumber min={0} style={{ width: '100%' }} value={data.sort_order} onChange={(value) => setData('sort_order', value ?? 0)} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <Text>Active on public site</Text>
                                    <Switch checked={data.is_active} onChange={(checked) => setData('is_active', checked)} />
                                </Space>
                                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <Text>Mark as featured</Text>
                                    <Switch checked={data.is_featured} onChange={(checked) => setData('is_featured', checked)} />
                                </Space>
                            </Space>
                        </Form>
                    </Col>
                    <Col xs={24} lg={11}>
                        <Card title="Preview" bordered={false} style={{ borderRadius: 18, background: '#fbfdff' }}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <GalleryPreview item={{ ...editing, media_type: data.media_type, alt_text: data.alt_text, title: data.title }} mediaPreview={mediaPreview} thumbnailPreview={thumbnailPreview} />
                                <div>
                                    <Title level={5} style={{ marginBottom: 6 }}>{data.title || 'Untitled item'}</Title>
                                    <Paragraph style={{ marginBottom: 0, color: '#64748b' }}>
                                        {data.description || 'Add a short description so this media makes sense on the client-facing gallery.'}
                                    </Paragraph>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Drawer>
        </AdminAuthenticatedLayout>
    );
}
