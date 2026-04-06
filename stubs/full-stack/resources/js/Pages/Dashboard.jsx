import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { isPrivilegedRole } from '@/utils/roleHelper';

export default function Dashboard() {
    const user = usePage().props.auth.user;
    const roles = user?.roles ?? [];
    const isPrivilegedUser = isPrivilegedRole(roles);

    if (isPrivilegedUser) {
        return (
            <AdminAuthenticatedLayout title="Dashboard">
                <Head title="Dashboard" />

                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                    Dashboard
                </h2>
                <p style={{ margin: 0, color: '#595959' }}>
                    You are in the admin/privileged dashboard experience.
                </p>
            </AdminAuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in!

                            <div className="mt-4 space-y-1 text-sm text-gray-700">
                                <p>
                                    <span className="font-semibold">Roles:</span>{' '}
                                    {(user?.roles ?? []).join(', ') || 'none'}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Permissions:
                                    </span>{' '}
                                    {(user?.permissions ?? []).join(', ') ||
                                        'none'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
