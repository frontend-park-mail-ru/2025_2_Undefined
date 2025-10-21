import { app } from "../main";

export class Router {
    constructor(routes, appElementId) {
        this.routes = routes; 
        this.appElementId = appElementId; 
    }

    navigateTo(path) {
        const handler = this.routes[path];
        if (handler) {
            handler();
        }
        history.pushState({}, '', path);
    }

    handlePopState = () => {
        const path = window.location.pathname;
        if (!app.isAuth && (path === '/login' || path === '/signup')){
            this.navigateTo(path);
        } else if (app.isAuth && !(path === '/login' || path === '/signup')){
            this.navigateTo(path);
        }
    };

    init() {
        document.addEventListener('click', this.handleLinkClick);
        window.addEventListener('popstate', this.handlePopState);
        if (app.isAuth){
            this.navigateTo('/')
        } else {
            if (window.location.pathname == '/login' || window.location.pathname == '/signup') {
                this.navigateTo(window.location.pathname)
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