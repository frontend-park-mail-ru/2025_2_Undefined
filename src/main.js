import counter from './counter.hbs';
import { setupCounter } from './counter.js';

const root = document.getElementById('root');

root.innerHTML = counter();

setupCounter(document.querySelector('#counter'));
