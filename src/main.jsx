import React, { useState, useRef } from 'minireact';
import { createRoot } from 'minireact';
import { initRouter, getRouter } from './router/router.jsx';
import Login from './pages/login/login.jsx';
import Signup from './pages/signup/signup.jsx';
import Home from './pages/home/home.jsx';

window.app = {
    user: null,
    isAuth: false,
};

export async function fetchUser() {
    try {
        const res = await fetch('/api/v1/me', { credentials: 'include' });
        if (res.ok) {
            app.user = await res.json();
            app.isAuth = true;
            return true;
        }
    } catch (err) {
        console.error('fetchUser error:', err);
    }
    app.user = null;
    app.isAuth = false;
    return false;
}

const routes = {
    '/login': () => {
        const root = document.getElementById('root');
        createRoot(<Login />, root);
    },
    '/signup': () => {
        const root = document.getElementById('root');
        createRoot(<Signup />, root);
    },
    '/': () => {
        if (!app.isAuth) {
            getRouter()?.navigateTo('/login');
            return;
        }
        const root = document.getElementById('root');
        createRoot(<Home />, root);
    },
};

(async () => {
    await fetchUser();
    initRouter(routes, 'root');
})();