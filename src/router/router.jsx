let routerInstance = null;

class Router {
    constructor(routes, appElementId) {
        this.routes = routes;
        this.appElementId = appElementId;
        this.currentPath = null;
    }

    _matchRoute(path) {
        if (this.routes[path]) {
            return { handler: this.routes[path], params: {} };
        }

        const chatMatch = path.match(/^\/chat\/([^/]+)$/);
        if (chatMatch) {
            const chatId = chatMatch[1];
            const handler = this.routes['/chat/:id'];
            if (handler) {
                return { handler, params: { id: chatId } };
            }
        }

        return null;
    }

    navigateTo(path) {
        if (this.currentPath === path) return;

        if (!this.isRouteAllowed(path)) {
            path = app.isAuth ? '/' : '/login';
        }

        history.pushState({ path }, '', path);
        this.renderRoute(path);
    }

    isRouteAllowed(path) {
        if (app.isAuth) {
            return !['/login', '/signup'].includes(path) && 
                   (path === '/' || path.startsWith('/chat/'));
        } else {
            return ['/login', '/signup'].includes(path);
        }
    }

    renderRoute(path) {
        this.currentPath = path;

        const match = this._matchRoute(path);
        if (match) {
            match.handler(match.params);
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
            this.navigateTo(app.isAuth ? '/' : '/login');
        }
    };

    init() {
        window.addEventListener('popstate', this.handlePopState);

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