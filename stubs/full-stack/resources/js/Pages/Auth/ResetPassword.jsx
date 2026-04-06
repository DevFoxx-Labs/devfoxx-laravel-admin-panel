import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="auth-heading-row">
                <div>
                    <h2 className="auth-page-title">Reset Password</h2>
                    <p className="auth-page-subtitle">
                        Set a new password for your account.
                    </p>
                </div>
            </div>

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
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
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
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="auth-input mt-2 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
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
                        {processing ? 'Updating password...' : 'Reset Password'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
