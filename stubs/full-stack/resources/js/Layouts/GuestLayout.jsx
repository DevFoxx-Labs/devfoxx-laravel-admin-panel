import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="auth-shell">
            <div className="auth-frame">
                <aside className="auth-brand-panel">
                    <Link href="/" className="auth-brand-logo-wrap">
                        <ApplicationLogo className="auth-brand-logo" />
                    </Link>

                    <p className="auth-brand-kicker">Devfoxx Admin</p>
                    <h1 className="auth-brand-title">
                        Secure access for your modern admin workspace
                    </h1>
                    <p className="auth-brand-text">
                        Keep your teams aligned, operations visible, and
                        workflows moving with one centralized dashboard.
                    </p>

                    <a href="#" className="auth-brand-link">
                        Privacy and security disclosure
                    </a>
                </aside>

                <main className="auth-content-panel">
                    <div className="auth-content-inner">{children}</div>
                </main>
            </div>
        </div>
    );
}
