import { Home } from '@/pages/home/home';
import { Login } from '@/pages/login/login';
import { Signup } from '@/pages/signup/signup';
import { Stats } from '@/pages/stats/stats';
import { initRouter } from '@/router/router';
import { sendPOSTRequest } from './api/modules/server';

const rootElement = document.getElementById('root');
export const home = new Home(rootElement);
const signup = new Signup(rootElement);
const login = new Login(rootElement);
const stats = new Stats(rootElement);

/**
 * Состояние приложения
 * @type {AppState}
 */
export const app = {
    user: null,
    isAuth: false,
};


const routes = {
    '/': () => home.render(),
    '/login': () => login.render(),
    '/signup': () => signup.render(),
    '/stats': () => stats.render(),
};

/**
 * Получает данные текущего пользователя
 * @returns {Promise<boolean>} Статус авторизации
 */
async function fetchUser() {
    try {
        const response = await fetch('/api/v1/me', {
            credentials: 'include',
        });

        if (response.ok) {
            const userData = await response.json();
            app.user = userData;
            app.isAuth = true;
            return true;
        }
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
    }

    app.user = null;
    app.isAuth = false;
    return false;
}

await fetchUser();
initRouter(routes, 'root');
