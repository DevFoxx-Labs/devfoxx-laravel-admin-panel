import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Typography,
} from 'antd';
import { useMemo, useState } from 'react';

const { Text } = Typography;

export default function AccessControl({ roles, permissions, users, can }) {
    const flash = usePage().props.flash ?? {};

    const roleOptions = useMemo(
        () => roles.map((role) => ({ value: role.name, label: role.name })),
        [roles],
    );

    const permissionOptions = useMemo(
        () => permissions.map((permission) => ({ value: permission, label: permission })),
        [permissions],
    );

    const createRoleForm = useForm({
        name: '',
        permissions: [],
    });

    const [editingRole, setEditingRole] = useState(null);
    const editRoleForm = useForm({
        name: '',
        permissions: [],
    });

    const [updatingUserId, setUpdatingUserId] = useState(null);

    const defaultTabKey = can.manageRoles ? 'roles' : 'users';

    const openEditModal = (role) => {
        setEditingRole(role);
        editRoleForm.setData({
            name: role.name,
            permissions: role.permissions,
        });
    };

    const closeEditModal = () => {
        setEditingRole(null);
        editRoleForm.reset();
        editRoleForm.clearErrors();
    };

    const submitCreateRole = () => {
        createRoleForm.post(route('admin.access-control.roles.store'), {
            preserveScroll: true,
            onSuccess: () => createRoleForm.reset(),
        });
    };

    const submitEditRole = () => {
        if (!editingRole) {
            return;
        }

        editRoleForm.put(route('admin.access-control.roles.update', editingRole.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const updateUserRoles = (userId, nextRoles) => {
        setUpdatingUserId(userId);

        router.put(
            route('admin.access-control.users.roles.update', userId),
            { roles: nextRoles },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingUserId(null),
            },
        );
    };

    const roleColumns = [
        {
            title: 'Role Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Text strong>{name}</Text>,
        },
        {
            title: 'Assigned Permissions',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (value) => (
                <Space size={[4, 8]} wrap>
                    {(value ?? []).length === 0 && <Tag>None</Tag>}
                    {(value ?? []).map((permission) => (
                        <Tag key={permission} color="blue">
                            {permission}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 140,
            render: (_, record) => (
                <Button type="link" onClick={() => openEditModal(record)}>
                    Edit Role
                </Button>
            ),
        },
    ];

    const userColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{name}</Text>
                    <Text type="secondary">{record.email}</Text>
                </Space>
            ),
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (value, record) => (
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    value={value}
                    options={roleOptions}
                    onChange={(nextValue) => updateUserRoles(record.id, nextValue)}
                    loading={updatingUserId === record.id}
                    placeholder="Assign roles"
                />
            ),
        },
    ];

    const tabItems = [
        {
            key: 'roles',
            label: 'Roles & Permissions',
            disabled: !can.manageRoles,
            children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card title="Create Role">
                        <Form layout="vertical" onFinish={submitCreateRole}>
                            <Form.Item
                                label="Role Name"
                                validateStatus={createRoleForm.errors.name ? 'error' : ''}
                                help={createRoleForm.errors.name}
                                required
                            >
                                <Input
                                    value={createRoleForm.data.name}
                                    onChange={(e) => createRoleForm.setData('name', e.target.value)}
                                    placeholder="Example: editor"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Permissions"
                                validateStatus={createRoleForm.errors.permissions ? 'error' : ''}
                                help={createRoleForm.errors.permissions}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    options={permissionOptions}
                                    value={createRoleForm.data.permissions}
                                    onChange={(value) => createRoleForm.setData('permissions', value)}
                                    placeholder="Assign permissions to this role"
                                />
                            </Form.Item>

                            <Button type="primary" htmlType="submit" loading={createRoleForm.processing}>
                                Create Role
                            </Button>
                        </Form>
                    </Card>

                    <Card title="Existing Roles">
                        <Table
                            rowKey="id"
                            columns={roleColumns}
                            dataSource={roles}
                            pagination={false}
                        />
                    </Card>
                </Space>
            ),
        },
        {
            key: 'users',
            label: 'User Role Assignment',
            disabled: !can.manageUsers,
            children: (
                <Card title="Assign Roles to Users">
                    <Table
                        rowKey="id"
                        columns={userColumns}
                        dataSource={users}
                        pagination={{ pageSize: 8 }}
                    />
                </Card>
            ),
        },
    ];

    return (
        <AdminAuthenticatedLayout
            title="Role & Permission Management"
            breadcrumb="Admin / Access Control"
        >
            <Head title="Access Control" />

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    type="info"
                    showIcon
                    message="Access Control"
                    description="Create and edit roles, assign permissions to roles, and assign roles to users from one admin screen."
                />

                {flash.success && (
                    <Alert type="success" showIcon message={flash.success} />
                )}

                {flash.error && (
                    <Alert type="error" showIcon message={flash.error} />
                )}

                <Tabs items={tabItems} defaultActiveKey={defaultTabKey} />
            </Space>

            <Modal
                title={editingRole ? `Edit Role: ${editingRole.name}` : 'Edit Role'}
                open={!!editingRole}
                onCancel={closeEditModal}
                onOk={submitEditRole}
                okText="Save Changes"
                confirmLoading={editRoleForm.processing}
            >
                <Form layout="vertical">
                    <Form.Item
                        label="Role Name"
                        validateStatus={editRoleForm.errors.name ? 'error' : ''}
                        help={editRoleForm.errors.name}
                        required
                    >
                        <Input
                            value={editRoleForm.data.name}
                            onChange={(e) => editRoleForm.setData('name', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Permissions"
                        validateStatus={editRoleForm.errors.permissions ? 'error' : ''}
                        help={editRoleForm.errors.permissions}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            options={permissionOptions}
                            value={editRoleForm.data.permissions}
                            onChange={(value) => editRoleForm.setData('permissions', value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminAuthenticatedLayout>
    );
}
