import { renderAddContactDialog } from '@/components/add-contact/add-contact.js'; 

/**
 * Класс для кнопки "Добавить контакт"
 */
export class AddContactButton {
    #element;
    #homeInstance;

    constructor(element, homeInstance) {
        this.#element = element;
        this.#homeInstance = homeInstance;
        this.#element.addEventListener('click', this.handleClick);
    }

    handleClick = (event) => {
        event.preventDefault();
        renderAddContactDialog(document.body, this.#homeInstance);
    };

    destroy() {
        this.#element.removeEventListener('click', this.handleClick);
        this.#element = null;
    }
}