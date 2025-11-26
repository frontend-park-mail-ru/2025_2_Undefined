// import { Home } from '@/pages/home/home';
// import { Login } from '@/pages/login/login';
// import { Signup } from '@/pages/signup/signup';
// import { initRouter } from '@/router/router';

const rootElement = document.getElementById('root');

// export const home = new Home(rootElement);
// export const login = new Login(rootElement);
// export const signup = new Signup(rootElement);

window.app = {
    user: null,
    isAuth: false,
};

// const routes = {
//     '/': () => {
//         console.log("Render /");
//         home.render();
//     },
//     '/login': () => {
//         console.log("Render /login");
//         login.render();
//     },
//     '/signup': () => {
//         console.log("Render /signup");
//         signup.render();
//     },
// };


export async function fetchUser() {
    console.log("Register")

    try {
        const response = await fetch('/api/v1/me', {
            credentials: "include"
        });

        if (response.ok) {
            app.user = await response.json();
            app.isAuth = true;
            return true;
        }
    } catch (err) {
        console.error("Ошибка получения пользователя:", err);
    }

    app.user = null;
    app.isAuth = false;
    return false;
}

// await fetchUser();

// initRouter(routes, 'root');
