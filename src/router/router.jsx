let routerInstance = null;

class Router {
    constructor(routes, appElementId) {
        this.routes = routes;
        this.appElementId = appElementId;
        this.currentPath = null;
    }

    navigateTo(path) {
        if (this.currentPath === path) return;

        if (!this.isRouteAllowed(path)) {
            if (app.isAuth) {
                path = '/';
            } else {
                path = '/login';
            }
        }

        history.pushState({ path }, '', path);
        this.renderRoute(path);
    }

    isRouteAllowed(path) {
        if (app.isAuth) {
            // Авторизованный: нельзя в /login и /signup
            return !(path === '/login' || path === '/signup');
        } else {
            // Не авторизованный: нельзя в /
            return path === '/login' || path === '/signup';
        }
    }

    renderRoute(path) {
        this.currentPath = path;
        const handler = this.routes[path];
        if (handler) {
            handler();
        } else {
            console.warn(`Route not found: ${path}. Redirecting...`);
            this.navigateTo(app.isAuth ? '/' : '/login');
        }
    }

    handlePopState = () => {
        const path = window.location.pathname;
        if (this.isRouteAllowed(path)) {
            this.renderRoute(path);
        } else {
            // Восстанавливаем "правильный" путь
            this.navigateTo(app.isAuth ? '/' : '/login');
        }
    };

    init() {
        window.addEventListener('popstate', this.handlePopState);

        // Изначальный рендер
        const initialPath = window.location.pathname;
        if (this.isRouteAllowed(initialPath)) {
            this.renderRoute(initialPath);
        } else {
            this.navigateTo(app.isAuth ? '/' : '/login');
        }
    }
}

export const getRouter = () => routerInstance;

export const initRouter = (routes, elementId) => {
    routerInstance = new Router(routes, elementId);
    routerInstance.init();
    return routerInstance;
};