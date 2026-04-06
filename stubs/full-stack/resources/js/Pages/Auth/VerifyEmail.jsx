import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="auth-heading-row">
                <div>
                    <h2 className="auth-page-title">Verify Email</h2>
                    <p className="auth-page-subtitle">
                        Confirm your email to activate your account.
                    </p>
                </div>
            </div>

            <div className="auth-info-message">
                Thanks for signing up! Before getting started, could you verify
                your email address by clicking on the link we just emailed to
                you? If you didn't receive the email, we will gladly send you
                another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="auth-success-message">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="auth-action-row auth-action-row-split">
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={processing}
                    >
                        {processing
                            ? 'Sending verification email...'
                            : 'Resend Verification Email'}
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="auth-inline-link"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
