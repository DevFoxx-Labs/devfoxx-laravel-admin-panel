import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="auth-heading-row">
                <div>
                    <h2 className="auth-page-title">Login</h2>
                    <p className="auth-page-subtitle">
                        Welcome back. Sign in to continue.
                    </p>
                </div>
                <p className="auth-page-helper">
                    New here?{' '}
                    <Link href={route('register')} className="auth-inline-link">
                        Register
                    </Link>
                </p>
            </div>

            {status && (
                <div className="auth-success-message">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="auth-form-grid">
                <div className="auth-form-group">
                    <InputLabel htmlFor="email" value="Email" className="auth-label" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="auth-input mt-2 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="auth-form-group">
                    <InputLabel htmlFor="password" value="Password" className="auth-label" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="auth-input mt-2 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="auth-form-row">
                    <label className="auth-check-label">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="auth-check-input"
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="auth-check-text">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="auth-inline-link"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="auth-action-row">
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={processing}
                    >
                        {processing ? 'Signing in...' : 'Login'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
