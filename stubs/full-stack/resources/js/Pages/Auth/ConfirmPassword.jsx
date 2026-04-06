import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="auth-heading-row">
                <div>
                    <h2 className="auth-page-title">Confirm Password</h2>
                    <p className="auth-page-subtitle">
                        Please verify your password to continue.
                    </p>
                </div>
            </div>

            <div className="auth-info-message">
                This is a secure area of the application. Please confirm your
                password before continuing.
            </div>

            <form onSubmit={submit} className="auth-form-grid">
                <div className="auth-form-group">
                    <InputLabel htmlFor="password" value="Password" className="auth-label" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="auth-input mt-2 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="auth-action-row">
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={processing}
                    >
                        {processing ? 'Confirming...' : 'Confirm'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
