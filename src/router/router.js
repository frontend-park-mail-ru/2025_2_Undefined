import { app } from '../main';

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

        // Проверка защиты маршрута /stats
        if (path === '/stats' && !app.isAuth) {
            console.warn('Unauthorized access to /stats, redirecting to login');
            this.navigateTo('/login');
            return;
        }

        if (handler) {
            handler();
        } else {
            console.error('Route not found:', path);
        }
    }

    handlePopState = () => {
        const path = window.location.pathname;

        // Добавляем проверку для /stats в обработчик popstate
        if (path === '/stats' && !app.isAuth) {
            console.warn(
                'Unauthorized access to /stats via browser navigation'
            );
            history.forward();
            return;
        }

        if (
            (!app.isAuth && (path === '/login' || path === '/signup')) ||
            (app.isAuth && !(path === '/login' || path === '/signup'))
        ) {
            this.renderRoute(path);
        } else {
            history.forward();
        }
    };

    handleLinkClick = (event) => {
        // Находим ближайший элемент <a> (на случай вложенности)
        const link = event.target.closest('a');

        if (link && link.href) {
            event.preventDefault();
            const url = new URL(link.href);
            const path = url.pathname;

            // Проверка защиты для /stats при клике на ссылку
            if (path === '/stats' && !app.isAuth) {
                console.warn(
                    'Unauthorized access to /stats, redirecting to login'
                );
                this.navigateTo('/login');
                return;
            }

            this.navigateTo(path);
        }
    };

    init() {
        document.addEventListener('click', this.handleLinkClick);
        window.addEventListener('popstate', this.handlePopState);

        const currentPath = window.location.pathname;

        // Если пользователь авторизован
        if (app.isAuth) {
            // Если текущий путь /stats - разрешаем переход
            if (currentPath === '/stats') {
                this.navigateTo('/stats');
            }
            // Если текущий путь другой - используем старую логику
            else {
                this.navigateTo('/');
            }
        }
        // Если пользователь не авторизован
        else {
            // Разрешаем только пути /login и /signup
            if (currentPath === '/login' || currentPath === '/signup') {
                this.navigateTo(currentPath);
            }
            // Если путь /stats и пользователь не авторизован - редирект на логин
            else if (currentPath === '/stats') {
                console.warn(
                    'Unauthorized access to /stats, redirecting to login'
                );
                this.navigateTo('/login');
            }
            // Для всех других путей - редирект на логин
            else {
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
