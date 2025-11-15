import { logoutUser } from '@api/modules/auth.js';
import Chat from '@api/modules/chats.js';
import User from '@api/modules/user.js';
import { getPlaceholder } from '@components/avatar/avatar.js';

import * as ContextMenu from '@/components/context-menu/context-menu.js';
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
    #isProfileOpen = false;
    #currentUser = null;
    #chats = [];

    /**
     * Создает экземпляр класса Home
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.#parent = parent;

        // Привязываем контекст для обработчиков
        this.globalClickHandler = this.globalClickHandler.bind(this);
        this.globalKeydownHandler = this.globalKeydownHandler.bind(this);
    }

    /**
     * Переключает отображение главного меню
     */
    toggleMainMenu() {
        this.#isMainMenuOpen = !this.#isMainMenuOpen;
        this.updateMenuState();
    }

    /**
     * Переключает отображение меню создания нового чата
     */
    toggleNewChatMenu() {
        this.#isNewChatMenuOpen = !this.#isNewChatMenuOpen;
        this.updateNewChatMenuState();
    }

    /**
     * Обновляет состояние главного меню в DOM
     */
    updateMenuState() {
        const menuWrapper = this.#parent.querySelector('.menu__wrapper');
        if (menuWrapper) {
            if (this.#isMainMenuOpen) {
                menuWrapper.classList.add('show');
            } else {
                menuWrapper.classList.remove('show');
            }
        }
    }

    /**
     * Обновляет состояние меню создания чата в DOM
     */
    updateNewChatMenuState() {
        const menuWrapper = this.#parent.querySelector('.chat-create__menu');
        if (menuWrapper) {
            if (this.#isNewChatMenuOpen) {
                menuWrapper.classList.add('show');
            } else {
                menuWrapper.classList.remove('show');
            }
        }
    }

    /**
     * Закрывает главное меню
     */
    closeMainMenu() {
        this.#isMainMenuOpen = false;
        this.updateMenuState();
    }

    /**
     * Закрывает меню создания нового чата
     */
    closeNewChatMenu() {
        this.#isNewChatMenuOpen = false;
        this.updateNewChatMenuState();
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
        this.closeNewChatMenu();
    }

    /**
     * Обрабатывает действия из меню
     * @param {string} action - Действие из data-action
     */
    handleMenuAction(action) {
        console.log('Menu action:', action);

        const actionHandlers = {
            profile: () => this.openProfile(),
            contacts: () => this.handleContacts(),
            logout: () => this.signOut(),
            'create-channel': () => this.handleCreateChannel(),
            'create-group': () => this.handleCreateGroup(),
            'create-chat': () => this.handleCreateChat(),
        };

        const handler = actionHandlers[action];
        if (handler) {
            handler();
            this.closeAllMenus();
        } else {
            console.warn('Unknown action:', action);
        }
    }

    /**
     * Обрабатывает открытие контактов
     */
    handleContacts() {
        console.log('Open contacts');
    }

    /**
     * Обрабатывает создание канала
     */
    handleCreateChannel() {
        console.log('Create channel');
    }

    /**
     * Обрабатывает создание группы
     */
    handleCreateGroup() {
        console.log('Create group');
    }

    /**
     * Обрабатывает создание чата
     */
    handleCreateChat() {
        console.log('Create chat');
    }

    /**
     * Открывает панель профиля
     */
    openProfile() {
        console.log('Opening profile...');
        this.#isProfileOpen = true;
        this.render();
        this.closeAllMenus();
    }

    /**
     * Закрывает панель профиля
     */
    closeProfile() {
        console.log('Closing profile...');
        this.#isProfileOpen = false;
        this.render();
        this.closeAllMenus();
    }

    /**
     * Обработчик глобальных кликов
     */
    globalClickHandler = (e) => {
        if (this.#isMainMenuOpen || this.#isNewChatMenuOpen) {
            const menuWrapper = this.#parent.querySelector('.menu__wrapper');
            const newChatMenuWrapper =
                this.#parent.querySelector('.chat-create__menu');
            const menuButton = this.#parent.querySelector(
                '.menu .action-button'
            );
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
    };

    /**
     * Обработчик глобальных нажатий клавиш
     */
    globalKeydownHandler = (e) => {
        if (e.key === 'Escape') {
            if (this.#isMainMenuOpen || this.#isNewChatMenuOpen) {
                this.closeAllMenus();
            } else if (this.#isProfileOpen) {
                this.closeProfile();
            }
        }
    };

    /**
     * Инициализирует обработчики событий
     */
    initEventListeners() {
        // Обработчик для главного меню
        const menuButton = this.#parent.querySelector(
            '.menu [data-action="menu"]'
        );
        if (menuButton) {
            menuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMainMenu();
            });
        }

        // Обработчик для создания нового чата
        const newChatButton = this.#parent.querySelector(
            '.chat-create [data-action="create"]'
        );
        if (newChatButton) {
            newChatButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleNewChatMenu();
            });
        }

        // Обработчик для кнопки выхода
        const signOutButton = this.#parent.querySelector('#signOut');
        if (signOutButton) {
            signOutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.signOut();
            });
        }

        // Обработчик для пунктов меню
        this.#parent.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.MenuItem');
            if (menuItem && menuItem.dataset.action) {
                e.preventDefault();
                e.stopPropagation();
                this.handleMenuAction(menuItem.dataset.action);
            }
        });

        // Показать/скрыть кнопку создания чата при наведении
        const chatsList = this.#parent.querySelector('.chats-panel');
        if (chatsList) {
            chatsList.addEventListener('mouseenter', () =>
                this.showNewChatButton()
            );
            chatsList.addEventListener('mouseleave', () =>
                this.hideNewChatButton()
            );
        }

        // Глобальные обработчики
        document.addEventListener('click', this.globalClickHandler);
        document.addEventListener('keydown', this.globalKeydownHandler);
    }

    /**
     * Удаляет все обработчики событий
     */
    removeAllEventListeners() {
        document.removeEventListener('click', this.globalClickHandler);
        document.removeEventListener('keydown', this.globalKeydownHandler);
    }

    /**
     * Восстанавливает состояния после рендера
     */
    restoreMenuStates() {
        this.updateMenuState();
        this.updateNewChatMenuState();

        const chatsList = this.#parent.querySelector('.chats-panel');
        if (chatsList && chatsList.matches(':hover')) {
            this.showNewChatButton();
        }
    }

    /**
     * Преобразует дату created_at в человеческий формат
     */
    formatMessageDate(dateString) {
        if (!dateString) {
            return '';
        }

        try {
            const inputDate = new Date(dateString);
            const now = new Date();

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

            if (diffDays === 0) {
                return inputDate.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
            } else if (diffDays >= -6 && diffDays < 0) {
                return inputDate.toLocaleDateString('ru-RU', {
                    weekday: 'short',
                });
            } else {
                return inputDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                });
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    /**
     * Обрабатывает список чатов
     */
    processChats(chats) {
        if (!Array.isArray(chats)) {
            console.error('Ожидался массив чатов');
            return [];
        }

        return chats.map((chat) => {
            try {
                const processedChat = { ...chat };

                if (chat.last_message && chat.last_message.created_at) {
                    processedChat.last_message = {
                        ...chat.last_message,
                        created_at_formatted: this.formatMessageDate(
                            chat.last_message.created_at
                        ),
                    };
                } else {
                    processedChat.last_message = {
                        created_at_formatted: '',
                        string: 'Нет сообщений',
                        created_at: '',
                    };
                }

                processedChat.placeholder = getPlaceholder(chat.name || 'Чат');
                processedChat.name = chat.name || 'Без названия';
                processedChat.id = chat.id || Date.now();

                return processedChat;
            } catch (error) {
                console.error('Error processing chat:', error);
                return {
                    id: Date.now(),
                    name: 'Ошибка загрузки',
                    placeholder: '?',
                    last_message: {
                        created_at_formatted: '',
                        string: 'Ошибка загрузки чата',
                    },
                };
            }
        });
    }

    /**
     * Получает данные текущего пользователя
     */
    async getCurrentUser() {
        if (this.#currentUser) {
            return this.#currentUser;
        }

        try {
            const response = await User.getMe();
            if (response.ok) {
                this.#currentUser = await response.json();
                app.user = this.#currentUser;
                return this.#currentUser;
            } else {
                throw new Error(
                    `Ошибка получения данных пользователя: ${response.status}`
                );
            }
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            // Возвращаем fallback пользователя
            return {
                name: 'Пользователь',
                username: 'user',
                phone_number: '+7 XXX XXX XX XX',
            };
        }
    }

    /**
     * Выполняет выход пользователя из системы
     */
    signOut() {
        logoutUser()
            .then(() => {
                app.user = null;
                this.#currentUser = null;
                const router = getRouter();
                router.navigateTo('/login');
            })
            .catch((error) => {
                console.error('Ошибка при выходе:', error);
            });
    }

    /**
     * Подготавливает данные для рендеринга
     */
    async prepareRenderData() {
        const homeData = {};

        try {
            // Получаем данные пользователя
            const userData = await this.getCurrentUser();
            homeData.user = {
                ...userData,
                placeholder: getPlaceholder(
                    userData.name || userData.username || 'Пользователь'
                ),
            };

            // Загружаем чаты
            const response = await Chat.getChats();
            if (response && response.ok) {
                const chats = await response.json();
                this.#chats = this.processChats(chats);
                homeData.chats = this.#chats;
                homeData.hasChats = this.#chats.length > 0;
            } else {
                homeData.chats = [];
                homeData.hasChats = false;
            }
        } catch (error) {
            console.error('Ошибка при подготовке данных:', error);
            homeData.chats = [];
            homeData.hasChats = false;
        }

        // Всегда добавляем эти данные
        homeData.isProfileOpen = this.#isProfileOpen;
        homeData.mainMenu = ContextMenu.mainMenu;
        homeData.newChats = ContextMenu.newChats;

        return homeData;
    }

    /**
     * Рендерит домашнюю страницу
     */
    async render() {
        try {
            console.log('Starting render...');

            // Подготавливаем данные
            const homeData = await this.prepareRenderData();
            console.log('Render data prepared:', homeData);

            // Удаляем старые обработчики
            this.removeAllEventListeners();

            // Рендерим шаблон
            console.log('Rendering template...');
            const html = HomeTemplate(homeData);
            console.log('Template rendered successfully');

            this.#parent.innerHTML = html;
            console.log('DOM updated');

            // Инициализируем новые обработчики
            this.initEventListeners();
            this.restoreMenuStates();

            console.log('Render completed successfully');
        } catch (error) {
            console.error('Критическая ошибка при рендеринге:', error);

            // Показываем простой fallback
            this.#parent.innerHTML = `
                <div class="home">
                    <div class="header">
                        <div style="color: white; padding: 20px;">
                            Ошибка загрузки. <button onclick="location.reload()">Перезагрузить</button>
                        </div>
                    </div>
                    <div class="content">
                        <div style="color: white; padding: 20px;">
                            ${error.message}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Очищает ресурсы
     */
    destroy() {
        this.removeAllEventListeners();
    }
}
