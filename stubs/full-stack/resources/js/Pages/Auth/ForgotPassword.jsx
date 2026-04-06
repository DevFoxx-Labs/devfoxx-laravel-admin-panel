import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="auth-heading-row">
                <div>
                    <h2 className="auth-page-title">Forgot Password</h2>
                    <p className="auth-page-subtitle">
                        Enter your email and we will send a reset link.
                    </p>
                </div>
            </div>

            <div className="auth-info-message">
                Forgot your password? No problem. Just let us know your email
                address and we will send a password reset link.
            </div>

            {status && (
                <div className="auth-success-message">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="auth-form-grid">
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="auth-input mt-2 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-1" />

                <div className="auth-action-row">
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={processing}
                    >
                        {processing
                            ? 'Sending reset link...'
                            : 'Email Password Reset Link'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
