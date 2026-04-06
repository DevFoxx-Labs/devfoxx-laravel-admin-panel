import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Alert, Avatar, Button, Card, Col, Divider, Form,
    Input, Row, Space, Tag, Tooltip, Typography,
} from 'antd';
import {
    CalendarOutlined, DeleteOutlined, EyeOutlined,
    MessageOutlined, SendOutlined, TagsOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ─── Recursive single comment + its replies ────────────────────────────────
function CommentThread({ comment, blogId, auth, depth = 0 }) {
    const [replying, setReplying] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        body: '', parent_id: comment.id,
    });

    function submitReply() {
        post(route('blog.comments.store', blogId), {
            onSuccess: () => { reset(); setReplying(false); },
        });
    }

    const isOwner    = auth?.user && auth.user.id === comment.user_id;
    const isAdmin    = auth?.user?.roles?.some(r => r.name === 'admin');
    const canDelete  = isOwner || isAdmin;
    const borderLeft = depth > 0
        ? `3px solid ${depth === 1 ? '#667eea' : '#764ba2'}`
        : 'none';

    return (
        <div style={{ marginLeft: depth * 32, marginBottom: 16 }}>
            <div style={{
                background: depth === 0 ? '#fff' : '#fafafe',
                borderRadius: 10,
                padding: '16px 20px',
                borderLeft,
                boxShadow: depth === 0 ? '0 1px 6px rgba(102,126,234,0.07)' : 'none',
            }}>
                {/* Comment header */}
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space size={10}>
                        <Avatar size={34} style={{ background: depth === 0 ? '#667eea' : '#764ba2', fontWeight: 700 }}>
                            {comment.author?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Space direction="vertical" size={0}>
                            <Text strong style={{ fontSize: 14 }}>{comment.author?.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {new Date(comment.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                })}
                            </Text>
                        </Space>
                    </Space>
                    {depth > 0 && <Tag color="purple" style={{ fontSize: 10 }}>Reply</Tag>}
                </Space>

                {/* Comment body */}
                <Paragraph style={{ margin: '12px 0 8px', fontSize: 14, lineHeight: 1.7 }}>
                    {comment.body}
                </Paragraph>

                {/* Actions */}
                <Space size={8}>
                    {auth?.user && (
                        <Button
                            type="link" size="small"
                            style={{ padding: 0, fontSize: 12, color: '#667eea' }}
                            onClick={() => setReplying(!replying)}
                        >
                            {replying ? 'Cancel' : '↩ Reply'}
                        </Button>
                    )}
                    {canDelete && (
                        <Link
                            href={route('blog.comments.destroy', { blog: blogId, comment: comment.id })}
                            method="delete" as="button"
                        >
                            <Button type="link" danger size="small" style={{ padding: 0, fontSize: 12 }}>
                                <DeleteOutlined /> Delete
                            </Button>
                        </Link>
                    )}
                </Space>

                {/* Inline reply box */}
                {replying && (
                    <div style={{ marginTop: 12 }}>
                        {errors.body && <Alert message={errors.body} type="error" showIcon style={{ marginBottom: 8 }} />}
                        <TextArea
                            rows={3}
                            value={data.body}
                            onChange={e => setData('body', e.target.value)}
                            placeholder={`Reply to ${comment.author?.name}...`}
                        />
                        <Button
                            type="primary" size="small"
                            icon={<SendOutlined />}
                            loading={processing}
                            onClick={submitReply}
                            style={{
                                marginTop: 8,
                                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                                border: 'none',
                            }}
                        >
                            Post Reply
                        </Button>
                    </div>
                )}
            </div>

            {/* Render nested replies recursively */}
            {comment.replies?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    {comment.replies.map(reply => (
                        <CommentThread
                            key={reply.id}
                            comment={reply}
                            blogId={blogId}
                            auth={auth}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function BlogShow({ blog, comments, related }) {
    const { auth } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({ body: '', parent_id: null });

    function submitComment() {
        post(route('blog.comments.store', blog.id), { onSuccess: () => reset() });
    }

    return (
        <>
            <Head title={blog.meta_title || blog.title}>
                {blog.meta_description && (
                    <meta name="description" content={blog.meta_description} />
                )}
                {blog.meta_keywords && (
                    <meta name="keywords" content={blog.meta_keywords} />
                )}
            </Head>

            <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
                {/* Hero banner */}
                <div style={{
                    background: blog.featured_image
                        ? `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(${blog.featured_image}) center/cover`
                        : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                    padding: '80px 24px 60px',
                    textAlign: 'center',
                    color: '#fff',
                }}>
                    <Space wrap style={{ justifyContent: 'center', marginBottom: 16 }}>
                        {blog.categories?.map(c => (
                            <Tag key={c.id} color={c.color} style={{ borderRadius: 20 }}>{c.name}</Tag>
                        ))}
                    </Space>
                    <Title level={1} style={{ color: '#fff', maxWidth: 800, margin: '0 auto 16px', lineHeight: 1.3 }}>
                        {blog.title}
                    </Title>
                    <Space split={<Text style={{ color: 'rgba(255,255,255,0.5)' }}>·</Text>} wrap style={{ justifyContent: 'center' }}>
                        <Space size={6}>
                            <Avatar size={24} style={{ background: 'rgba(255,255,255,0.3)' }}>
                                {blog.author?.name?.charAt(0)}
                            </Avatar>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{blog.author?.name}</Text>
                        </Space>
                        <Space size={4}>
                            <CalendarOutlined style={{ fontSize: 13 }} />
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                                {blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                            </Text>
                        </Space>
                        <Space size={4}>
                            <EyeOutlined style={{ fontSize: 13 }} />
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{blog.views_count} views</Text>
                        </Space>
                        <Space size={4}>
                            <MessageOutlined style={{ fontSize: 13 }} />
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{comments.length} comments</Text>
                        </Space>
                    </Space>
                </div>

                {/* Content */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
                    <Row gutter={[40, 32]}>
                        {/* Article */}
                        <Col xs={24} lg={17}>
                            <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)', marginBottom: 32 }}>
                                {blog.excerpt && (
                                    <Paragraph style={{
                                        fontSize: 16, fontStyle: 'italic', color: '#666',
                                        borderLeft: '4px solid #667eea', paddingLeft: 16,
                                        marginBottom: 24,
                                    }}>
                                        {blog.excerpt}
                                    </Paragraph>
                                )}
                                <div
                                    style={{ fontSize: 16, lineHeight: 1.9, color: '#333', whiteSpace: 'pre-wrap' }}
                                >
                                    {blog.content}
                                </div>
                            </Card>

                            {/* ─── Comments section ─────────────────────────────── */}
                            <Card
                                title={
                                    <Space>
                                        <MessageOutlined style={{ color: '#667eea' }} />
                                        <Text strong>{comments.length} Comment{comments.length !== 1 ? 's' : ''}</Text>
                                    </Space>
                                }
                                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)', marginBottom: 32 }}
                            >
                                {comments.length > 0 ? (
                                    comments.map(comment => (
                                        <CommentThread
                                            key={comment.id}
                                            comment={comment}
                                            blogId={blog.id}
                                            auth={auth}
                                            depth={0}
                                        />
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                        <MessageOutlined style={{ fontSize: 32, color: '#ccc', marginBottom: 12, display: 'block' }} />
                                        <Text type="secondary">No comments yet. Be the first!</Text>
                                    </div>
                                )}
                            </Card>

                            {/* ─── Post a comment ───────────────────────────────── */}
                            {auth?.user ? (
                                <Card
                                    title={<Text strong>Leave a Comment</Text>}
                                    style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
                                >
                                    {errors.body && (
                                        <Alert message={errors.body} type="error" showIcon style={{ marginBottom: 12 }} />
                                    )}
                                    <Form layout="vertical">
                                        <Form.Item>
                                            <TextArea
                                                rows={5}
                                                placeholder="Share your thoughts..."
                                                value={data.body}
                                                onChange={e => setData('body', e.target.value)}
                                                maxLength={2000}
                                                showCount
                                            />
                                        </Form.Item>
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            loading={processing}
                                            onClick={submitComment}
                                            size="large"
                                            style={{
                                                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                                                border: 'none',
                                                borderRadius: 8,
                                            }}
                                        >
                                            Post Comment
                                        </Button>
                                    </Form>
                                </Card>
                            ) : (
                                <Card style={{ borderRadius: 12, textAlign: 'center', padding: '32px' }}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                        You must be logged in to post a comment.
                                    </Text>
                                    <Space>
                                        <Link href={route('login')}>
                                            <Button type="primary" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' }}>
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href={route('register')}>
                                            <Button>Register</Button>
                                        </Link>
                                    </Space>
                                </Card>
                            )}
                        </Col>

                        {/* Sidebar */}
                        <Col xs={24} lg={7}>
                            {/* Categories */}
                            <Card
                                title={<Space><TagsOutlined /><span>Categories</span></Space>}
                                size="small"
                                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)', marginBottom: 24 }}
                            >
                                <Space wrap>
                                    {blog.categories?.map(c => (
                                        <Tag key={c.id} color={c.color} style={{ borderRadius: 20 }}>{c.name}</Tag>
                                    ))}
                                </Space>
                            </Card>

                            {/* Related posts */}
                            {related?.length > 0 && (
                                <Card
                                    title="Related Posts"
                                    size="small"
                                    style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(102,126,234,0.08)' }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {related.map((r, i) => (
                                            <div key={r.id}>
                                                {i > 0 && <Divider style={{ margin: '8px 0' }} />}
                                                <Link href={route('blog.show', r.slug)} style={{ textDecoration: 'none' }}>
                                                    <Space align="start">
                                                        <div style={{
                                                            width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                                                            background: r.featured_image
                                                                ? `url(${r.featured_image}) center/cover`
                                                                : 'linear-gradient(135deg,#667eea,#764ba2)',
                                                        }} />
                                                        <div>
                                                            <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.4 }}>
                                                                {r.title}
                                                            </Text>
                                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                                {r.published_at ? new Date(r.published_at).toLocaleDateString() : ''}
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Link>
                                            </div>
                                        ))}
                                    </Space>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
}
