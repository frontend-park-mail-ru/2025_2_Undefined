import { renderNewChatMenu } from '@/components/new-chat-menu/new-chat-menu.js'; 

/**
 * Класс для кнопки "Добавить контакт"
 */
export class startNewChat {
    #element;
    #homeInstance;
    #HomeData;

    constructor(element, homeInstance, homeData) {
        this.#element = element;
        this.#homeInstance = homeInstance;
        this.#HomeData = homeData;

        this.#element.addEventListener('click', this.handleClick);
    }

    handleClick = (event) => {
        event.preventDefault();
        
        const parentElement = document.getElementById('contentLeftColumn');
        renderNewChatMenu(parentElement, this.#homeInstance, this.#HomeData);
    };

    destroy() {
        this.#element.removeEventListener('click', this.handleClick);
        this.#element = null;
    }
}