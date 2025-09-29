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
const home = new Home(root);
root.innerHTML = home.render();
