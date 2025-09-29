import { Login } from "./pages/login/login"
import { Signup } from "./pages/signup/signup"
import { Home } from './pages/home/home'

const rootElement = document.getElementById('root');

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object|null} user - Данные пользователя
 * @property {boolean} isAuth - Статус авторизации
 */

/**
 * Состояние приложения
 * @type {AppState}
 */
const app = {
    user: null,
    isAuth: false
};

/**
 * Конфигурация страниц приложения
 * @type {Object}
 */
const config = {
    pages: {
        home: {
            href: '/',
            text: 'Чаты',
            render: renderChats,
            authRequired: true
        },
        login: {
            href: '/login',
            text: 'Авторизация',
            render: renderLogin,
            authRequired: false
        },
        signup: {
            href: '/signup',
            text: 'Регистрация',
            render: renderSignup,
            authRequired: false
        }
    }
};

/**
 * Получает данные текущего пользователя
 * @returns {Promise<boolean>} Статус авторизации
 */
async function fetchUser() {
    try {
        const response = await fetch('/api/v1/me', {
            credentials: 'include'
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

/**
 * Рендерит страницу чатов
 */
function renderChats(){
    const home = new Home(rootElement);
    home.render();
}

/**
 * Рендерит страницу регистрации
 */
function renderSignup(){
    const signup = new Signup(rootElement);
    signup.render();
}

/**
 * Рендерит страницу авторизации
 */
function renderLogin() {
    const login = new Login(rootElement);
    login.render();
}

/**
 * Переходит на указанную страницу с проверкой авторизации
 * @param {string} page - Идентификатор страницы
 * @returns {Promise<void>}
 */
export default async function goToPage(page) {
    const isAuthenticated = await fetchUser();
    
    const pageConfig = config.pages[page];
    
    if (pageConfig.authRequired && !isAuthenticated) {
        page = 'login';
    }
    
    if ((page === 'login' || page === 'signup') && isAuthenticated) {
        page = 'home';
    }

    rootElement.innerHTML = '';

    const pageHref = config.pages[page].href;
    history.pushState({ page }, '', pageHref);

    config.pages[page].render();
}

/**
 * Инициализирует приложение
 * @returns {Promise<void>}
 */
async function initApp() {
    await fetchUser(); 
    
    const startPage = app.isAuth ? 'home' : 'login';
    goToPage(startPage);
}

initApp();