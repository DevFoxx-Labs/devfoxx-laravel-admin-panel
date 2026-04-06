import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { App as AntdApp, ConfigProvider } from 'antd';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { route } from '../../vendor/tightenco/ziggy';

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

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.jsx`,
                import.meta.glob('./Pages/**/*.jsx'),
            ),
        setup: ({ App, props }) => {
            global.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });

            return (
                <AntdProviders>
                    <App {...props} />
                </AntdProviders>
            );
        },
    }),
);
