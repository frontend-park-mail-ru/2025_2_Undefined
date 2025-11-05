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
    #isProfileOpen = false;

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
     * Открывает панель профиля
     */
    openProfile() {
        console.log('Opening profile...');
        this.#isProfileOpen = true;
        const profilePanel = this.#parent.querySelector('.profile-panel');
        const chatArea = this.#parent.querySelector('.chat-area');

        if (profilePanel) {
            profilePanel.classList.add('profile-panel--open');
        }
        if (chatArea) {
            chatArea.classList.add('chat-area--with-profile');
        }

        this.closeAllMenus();
    }

    /**
     * Закрывает панель профиля
     */
    closeProfile() {
        console.log('Closing profile...');
        this.#isProfileOpen = false;
        const profilePanel = this.#parent.querySelector('.profile-panel');
        const chatArea = this.#parent.querySelector('.chat-area');

        if (profilePanel) {
            profilePanel.classList.remove('profile-panel--open');
        }
        if (chatArea) {
            chatArea.classList.remove('chat-area--with-profile');
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
     * Инициализирует обработчики событий для меню
     */
    initMenuEventListeners() {
        const menuButton = this.#parent.querySelector('.menu .menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMainMenu();
            });
        }

        // Делегирование событий для всех пунктов меню
        document.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.MenuItem');
            if (menuItem) {
                const action = menuItem.dataset.action;

                switch (action) {
                    case 'profile':
                        this.openProfile();
                        break;
                    case 'contacts':
                        // Добавьте обработку контактов
                        console.log('Open contacts');
                        break;
                    case 'logout':
                        this.signOut();
                        break;
                    case 'create-channel':
                        // Обработка создания канала
                        console.log('Create channel');
                        break;
                    case 'create-group':
                        // Обработка создания группы
                        console.log('Create group');
                        break;
                    case 'create-chat':
                        // Обработка создания чата
                        console.log('Create chat');
                        break;
                    case 'leave-group':
                        // Обработка выхода из группы
                        console.log('Leave group');
                        break;
                    case 'delete-chat':
                        // Обработка удаления чата
                        console.log('Delete chat');
                        break;
                    default:
                        console.log('Unknown action:', action);
                }

                // Закрываем меню после выбора пункта
                this.closeAllMenus();
            }
        });
    }

    /**
     * Инициализирует обработчики событий для создания чата
     */
    initChatCreateEventListeners() {
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
    }

    /**
     * Инициализирует обработчики событий для профиля
     */
    initProfileEventListeners() {
        const profileBackButton = this.#parent.querySelector(
            '.profile-panel__back'
        );
        if (profileBackButton) {
            profileBackButton.addEventListener('click', () => {
                this.closeProfile();
            });
        }
    }

    /**
     * Инициализирует обработчики событий для выхода
     */
    initSignOutEventListeners() {
        const signOutButton = this.#parent.querySelector('#signOut');
        if (signOutButton) {
            signOutButton.addEventListener('click', () => this.signOut());
        }
    }

    /**
     * Инициализирует глобальные обработчики событий
     */
    initGlobalEventListeners() {
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
            if (e.key === 'Escape') {
                if (this.#isMainMenuOpen || this.#isNewChatMenuOpen) {
                    this.closeAllMenus();
                } else if (this.#isProfileOpen) {
                    this.closeProfile();
                }
            }
        });
    }

    /**
     * Инициализирует все обработчики событий
     */
    initEventListeners() {
        this.initMenuEventListeners();
        this.initChatCreateEventListeners();
        this.initProfileEventListeners();
        this.initSignOutEventListeners();
        this.initGlobalEventListeners();
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

                // Используем меню с actions
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
