import { app } from "../main";

export class Router {
    constructor(routes, appElementId) {
        this.routes = routes;
        this.appElementId = appElementId;
    }

    navigateTo(path) {
        history.pushState({}, '', path);
        this.renderRoute(path);
    }

    renderRoute(path) {
        const handler = this.routes[path];
        if (handler) {
            handler();
        } else {
            console.error("Route not found:", path);
        }
    }

    handlePopState = () => {
        const path = window.location.pathname;

        if ((!app.isAuth && (path === '/login' || path === '/signup')) ||
            (app.isAuth && !(path === '/login' || path === '/signup'))) {
            this.renderRoute(path);
        } else {
            history.forward();
        }
    };

    init() {
        window.addEventListener('popstate', this.handlePopState);

        if (app.isAuth) {
            this.navigateTo('/');
        } else {
            if (window.location.pathname === '/login' ||
                window.location.pathname === '/signup') {

                this.navigateTo(window.location.pathname);

            } else {
                this.navigateTo('/login');
            }
        }
    }
}

let routerInstance;

export const getRouter = () => routerInstance;

export const initRouter = (routes, elementId) => {
    routerInstance = new Router(routes, elementId);
    routerInstance.init();
    return routerInstance;
};
