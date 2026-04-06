export function withAdminPanelPages(localPages = {}) {
    const packagePages = import.meta.glob('./Pages/**/*.jsx');

    return {
        ...packagePages,
        ...localPages,
    };
}
