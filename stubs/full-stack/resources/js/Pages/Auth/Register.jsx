import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="auth-heading-row">
                <div>
                    <h2 className="auth-page-title">Register</h2>
                    <p className="auth-page-subtitle">
                        Create your account to get started.
                    </p>
                </div>
                <p className="auth-page-helper">
                    Already have an account?{' '}
                    <Link href={route('login')} className="auth-inline-link">
                        Login
                    </Link>
                </p>
            </div>

            <form onSubmit={submit} className="auth-form-grid">
                <div className="auth-form-group">
                    <InputLabel htmlFor="name" value="Full Name" className="auth-label" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="auth-input mt-2 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div className="auth-form-group">
                    <InputLabel htmlFor="email" value="Email" className="auth-label" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="auth-input mt-2 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="auth-form-group">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="auth-label"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="auth-input mt-2 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1"
                    />
                </div>

                <div className="auth-action-row">
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={processing}
                    >
                        {processing ? 'Creating account...' : 'Register'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
