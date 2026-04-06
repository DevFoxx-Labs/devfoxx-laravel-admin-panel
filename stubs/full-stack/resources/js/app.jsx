import '../css/app.css';
import 'antd/dist/reset.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { withAdminPanelPages } from '../../vendor/devfoxx/devfoxx-laravel-admin-panel/resources/js/inertia';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const antdTheme = {
    token: {
        colorPrimary: '#1677ff',
        borderRadius: 10,
        fontFamily:
            "'Plus Jakarta Sans', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
};

function AntdProviders({ children }) {
    return (
        <ConfigProvider theme={antdTheme}>
            <AntdApp>{children}</AntdApp>
        </ConfigProvider>
    );
}

const pages = withAdminPanelPages(import.meta.glob('./Pages/**/*.jsx'));

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            pages,
        ),
    setup({ el, App, props }) {
        const content = (
            <AntdProviders>
                <App {...props} />
            </AntdProviders>
        );

        if (import.meta.env.SSR) {
            hydrateRoot(el, content);
            return;
        }

        createRoot(el).render(content);
    },
    progress: {
        color: '#4B5563',
    },
});
