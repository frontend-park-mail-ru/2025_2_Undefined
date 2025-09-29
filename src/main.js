// import { Signup } from "./pages/signup/signup"

// const root = document.getElementById('root');
// const signup = new Signup(root);
// function renderSignup(){
//     signup.render();
// }
// renderSignup();


import { Login } from "./pages/login/login"
// import counter from './counter.hbs';
// import { setupCounter } from './counter.js';

// import home from '../src/pages/home/home.hbs';

// const root = document.getElementById('root');

// root.innerHTML = home();

// const root = document.getElementById('root');

// root.innerHTML = counter();

// setupCounter(document.querySelector('#counter'));

import { Home } from './pages/home/home.js';

const root = document.getElementById('root');
const login = new Login(root);
function renderLogin(){
    login.render();
}
renderLogin();
const home = new Home(root);
root.innerHTML = home.render();
