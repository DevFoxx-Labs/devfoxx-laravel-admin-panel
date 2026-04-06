import { Head } from '@inertiajs/react';
import { Card, Empty, Segmented, Space, Statistic, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

const { Title, Text, Paragraph } = Typography;

function MasonryItem({ item }) {
    return (
        <div className="gallery-masonry-item">
            <Card
                bordered={false}
                style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
                    background: '#fff',
                }}
                bodyStyle={{ padding: 18 }}
            >
                <div style={{ marginBottom: 14 }}>
                    {item.media_type === 'video' ? (
                        <video
                            controls
                            poster={item.thumbnail_url || undefined}
                            style={{ width: '100%', borderRadius: 14, display: 'block', background: '#000' }}
                        >
                            <source src={item.media_url} />
                        </video>
                    ) : (
                        <img
                            src={item.media_url}
                            alt={item.alt_text || item.title}
                            style={{ width: '100%', display: 'block', borderRadius: 14 }}
                        />
                    )}
                </div>

                <Space wrap style={{ marginBottom: 10 }}>
                    <Tag color={item.media_type === 'video' ? 'volcano' : 'geekblue'}>{item.media_type}</Tag>
                    {item.is_featured && <Tag color="gold">Featured</Tag>}
                </Space>

                <Title level={4} style={{ marginBottom: 8 }}>{item.title}</Title>
                {item.description && (
                    <Paragraph style={{ marginBottom: 0, color: '#475569', lineHeight: 1.7 }}>
                        {item.description}
                    </Paragraph>
                )}
            </Card>
        </div>
    );
}

export default function GalleryIndex({ galleryItems, stats }) {
    const [filter, setFilter] = useState('all');

    const items = useMemo(() => {
        if (filter === 'all') {
            return galleryItems;
        }

        return galleryItems.filter((item) => item.media_type === filter);
    }, [filter, galleryItems]);

    return (
        <>
            <Head title="Gallery" />

            <style>{`
                .gallery-masonry {
                    column-count: 3;
                    column-gap: 24px;
                }
                .gallery-masonry-item {
                    break-inside: avoid;
                    margin-bottom: 24px;
                }
                @media (max-width: 991px) {
                    .gallery-masonry {
                        column-count: 2;
                    }
                }
                @media (max-width: 640px) {
                    .gallery-masonry {
                        column-count: 1;
                    }
                }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%)', padding: '56px 20px' }}>
                <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <Tag color="blue" style={{ borderRadius: 999, padding: '4px 14px', marginBottom: 14 }}>
                            Media Gallery
                        </Tag>
                        <Title level={1} style={{ marginBottom: 10, fontWeight: 800 }}>
                            Image and Video Highlights
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16, maxWidth: 760, display: 'inline-block' }}>
                            Explore the latest visual content from the site. This React/Inertia page is now served directly from the installed package.
                        </Text>
                    </div>

                    <Space size="middle" wrap style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic title="Total Items" value={stats.total} />
                        </Card>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic title="Images" value={stats.images} />
                        </Card>
                        <Card bordered={false} style={{ borderRadius: 18 }}>
                            <Statistic title="Videos" value={stats.videos} />
                        </Card>
                    </Space>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                        <Segmented
                            size="large"
                            value={filter}
                            onChange={setFilter}
                            options={[
                                { label: 'All Media', value: 'all' },
                                { label: 'Images', value: 'image' },
                                { label: 'Videos', value: 'video' },
                            ]}
                        />
                    </div>

                    {items.length === 0 ? (
                        <Card bordered={false} style={{ borderRadius: 20 }}>
                            <Empty description="No gallery items are available yet." />
                        </Card>
                    ) : (
                        <div className="gallery-masonry">
                            {items.map((item) => (
                                <MasonryItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
