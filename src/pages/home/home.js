import { logoutUser } from '@api/modules/auth.js';
import Chat from '@api/modules/chats.js';
import User from '@api/modules/user.js';
import { getPlaceholder } from '@components/avatar/avatar.js';
import * as contextMenu from '@components/context-menu/context-menu.js';

import { app } from '@/main.js';
import HomeTemplate from '@/pages/home/home.hbs';
import { getRouter } from '@/router/router';

/**
 * Класс для управления домашней страницей приложения
 */
export class Home {
    #parent;
    #isMainMenuOpen = false;
    #isNewChatMenuOpen = false;

    /**
     * Создает экземпляр класса Home
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.#parent = parent;
    }

    /**
     * Переключает отображение главного меню
     */
    toggleMainMenu() {
        this.#isMainMenuOpen = !this.#isMainMenuOpen;
        const menuComponent = this.#parent.querySelector(
            '.menu__wrapper .Menu'
        );

        if (menuComponent) {
            if (this.#isMainMenuOpen) {
                menuComponent.classList.add('show');
            } else {
                menuComponent.classList.remove('show');
            }
        }
    }

    /**
     * Переключает отображение меню создания нового чата
     */
    toggleNewChatMenu() {
        this.#isNewChatMenuOpen = !this.#isNewChatMenuOpen;
        const menuComponent = this.#parent.querySelector(
            '.chat-create__menu .Menu'
        );
        const newChatButtonIcon = this.#parent.querySelector(
            '.chat-create .action-button .icon'
        );

        if (menuComponent) {
            if (this.#isNewChatMenuOpen) {
                menuComponent.classList.add('show');
                // Меняем иконку на "close" при открытии меню
                if (newChatButtonIcon) {
                    newChatButtonIcon.classList.remove('edit-icon');
                    newChatButtonIcon.classList.add('close-icon');
                }
            } else {
                menuComponent.classList.remove('show');
                // Возвращаем иконку "edit" при закрытии меню
                if (newChatButtonIcon) {
                    newChatButtonIcon.classList.remove('close-icon');
                    newChatButtonIcon.classList.add('edit-icon');
                }
            }
        }
    }

    /**
     * Закрывает главное меню
     */
    closeMainMenu() {
        this.#isMainMenuOpen = false;
        const menuComponent = this.#parent.querySelector(
            '.menu__wrapper .Menu'
        );
        if (menuComponent) {
            menuComponent.classList.remove('show');
        }
    }

    /**
     * Закрывает меню создания нового чата
     */
    closeNewChatMenu() {
        this.#isNewChatMenuOpen = false;
        const menuComponent = this.#parent.querySelector(
            '.chat-create__menu .Menu'
        );
        const newChatButtonIcon = this.#parent.querySelector(
            '.chat-create .action-button .icon'
        );

        if (menuComponent) {
            menuComponent.classList.remove('show');
        }

        // Возвращаем иконку "edit" при закрытии меню
        if (newChatButtonIcon) {
            newChatButtonIcon.classList.remove('close-icon');
            newChatButtonIcon.classList.add('edit-icon');
        }
    }

    /**
     * Закрывает все открытые меню
     */
    closeAllMenus() {
        this.closeMainMenu();
        this.closeNewChatMenu();
    }

    /**
     * Показывает кнопку создания нового чата
     */
    showNewChatButton() {
        const newChatButton = this.#parent.querySelector('.chat-create');
        if (newChatButton) {
            newChatButton.classList.add('chat-create--visible');
        }
    }

    /**
     * Скрывает кнопку создания нового чата
     */
    hideNewChatButton() {
        const newChatButton = this.#parent.querySelector('.chat-create');
        if (newChatButton) {
            newChatButton.classList.remove('chat-create--visible');
        }
        // При скрытии кнопки обязательно закрываем меню
        this.closeNewChatMenu();
    }

    /**
     * Инициализирует обработчики событий
     */
    initEventListeners() {
        const signOutButton = this.#parent.querySelector('#signOut');
        if (signOutButton) {
            signOutButton.addEventListener('click', () => this.signOut());
        }

        const menuButton = this.#parent.querySelector('.menu .menu-button');

        if (menuButton) {
            menuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMainMenu();
            });
        }

        const newChatButton = this.#parent.querySelector(
            '.chat-create .action-button'
        );

        if (newChatButton) {
            newChatButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleNewChatMenu();
            });
        }

        // Обработчики для показа/скрытия кнопки нового чата
        const chatsList = this.#parent.querySelector('.chats-panel');
        if (chatsList) {
            chatsList.addEventListener('mouseenter', () => {
                this.showNewChatButton();
            });

            chatsList.addEventListener('mouseleave', () => {
                this.hideNewChatButton();
            });
        }

        document.addEventListener('click', (e) => {
            if (this.#isMainMenuOpen || this.#isNewChatMenuOpen) {
                const menuWrapper =
                    this.#parent.querySelector('.menu__wrapper');
                const newChatMenuWrapper =
                    this.#parent.querySelector('.chat-create__menu');
                const menuButton =
                    this.#parent.querySelector('.menu .menu-button');
                const newChatButton = this.#parent.querySelector(
                    '.chat-create .action-button'
                );

                const isClickOutsideMainMenu =
                    menuWrapper &&
                    !menuWrapper.contains(e.target) &&
                    !(menuButton && menuButton.contains(e.target));

                const isClickOutsideNewChatMenu =
                    newChatMenuWrapper &&
                    !newChatMenuWrapper.contains(e.target) &&
                    !(newChatButton && newChatButton.contains(e.target));

                if (isClickOutsideMainMenu && this.#isMainMenuOpen) {
                    this.closeMainMenu();
                }

                if (isClickOutsideNewChatMenu && this.#isNewChatMenuOpen) {
                    this.closeNewChatMenu();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (
                e.key === 'Escape' &&
                (this.#isMainMenuOpen || this.#isNewChatMenuOpen)
            ) {
                this.closeAllMenus();
            }
        });
    }

    /**
     * Преобразует дату created_at в человеческий формат
     * @param {string} dateString - Дата в строковом формате из API
     * @returns {string} Дата в человеческом формате
     */
    formatMessageDate(dateString) {
        const inputDate = new Date(dateString);
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const inputDay = new Date(
            inputDate.getFullYear(),
            inputDate.getMonth(),
            inputDate.getDate()
        );

        const diffTime = inputDay - today;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const startOfWeek = new Date(today);
        startOfWeek.setDate(
            today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
        );

        if (diffDays === 0) {
            return inputDate.toLocaleTimeString('ru-RU', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (diffDays >= -6 && diffDays < 0) {
            return inputDate.toLocaleDateString('ru-RU', {
                timeZone,
                weekday: 'short',
            });
        } else {
            return inputDate.toLocaleDateString('ru-RU', {
                timeZone,
                day: 'numeric',
                month: 'short',
            });
        }
    }

    /**
     * Обрабатывает список чатов, преобразуя даты последних сообщений
     * @param {Array} chats - Массив чатов из API
     * @returns {Array} Обработанный массив чатов с человеческими датами
     */
    processChats(chats) {
        if (!Array.isArray(chats)) {
            console.error('Ожидался массив чатов');
            return [];
        }

        return chats.map((chat) => {
            if (chat.last_message && chat.last_message.created_at) {
                const processedChat = { ...chat };
                processedChat.last_message = {
                    ...chat.last_message,
                    created_at_formatted: this.formatMessageDate(
                        chat.last_message.created_at
                    ),
                    created_at_original: chat.last_message.created_at,
                };
                processedChat.placeholder = getPlaceholder(chat.name);
                return processedChat;
            }
            return chat;
        });
    }

    /**
     * Получает данные текущего пользователя
     * @returns {Promise<Object>} Данные пользователя
     */
    async getCurrentUser() {
        const userData = app.user;
        if (userData) {
            return userData;
        } else {
            try {
                const response = await User.getMe();

                if (response.ok) {
                    const userData = await response.json();
                    return userData;
                } else {
                    throw new Error(
                        `Ошибка получения данных пользователя: ${response.status}`
                    );
                }
            } catch (error) {
                console.error(
                    'Ошибка при получении данных пользователя:',
                    error
                );
                return null;
            }
        }
    }

    /**
     * Выполняет выход пользователя из системы
     */
    signOut() {
        logoutUser().then(() => {
            const router = getRouter();
            router.navigateTo('/login');
        });
    }

    /**
     * Рендерит домашнюю страницу с данными пользователя и чатами
     * @returns {Promise<void>}
     */
    async render() {
        const HomeData = {};

        try {
            const userData = await this.getCurrentUser();
            if (userData) {
                HomeData.user = userData;
                HomeData.user.placeholder = getPlaceholder(
                    userData.name || userData.username
                );
            }

            const response = await Chat.getChats();

            if (response.ok) {
                const chats = await response.json();
                HomeData.chats = this.processChats(chats);
                HomeData.hasChats = HomeData.chats.length > 0;
                HomeData.newChats = contextMenu.newChat;
                HomeData.mainMenu = contextMenu.mainMenu;

                this.#parent.innerHTML = HomeTemplate(HomeData);
                this.initEventListeners();
            } else {
                throw new Error(`Ошибка получения чатов: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка при рендеринге домашней страницы:', error);

            HomeData.error = 'Не удалось загрузить данные';
            this.#parent.innerHTML = HomeTemplate(HomeData);
            this.initEventListeners();
        }
    }

    /**
     * Создает массив чатов (заглушка для совместимости)
     * @param {Array} chats - Массив чатов
     * @returns {Array} Исходный массив чатов
     */
    createChats(chats) {
        return chats || [];
    }
}
