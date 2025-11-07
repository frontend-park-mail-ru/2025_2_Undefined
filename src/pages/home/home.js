import { logoutUser } from '@api/modules/auth.js';
import Chat from '@api/modules/chats.js';
import User from '@api/modules/user.js';
import { getPlaceholder } from '@components/avatar/avatar.js';
import * as contextMenu from '@components/context-menu/context-menu.js';

import { startNewChat } from '@/components/action-button/action-button';
import { app } from '@/main.js';
import HomeTemplate from '@/pages/home/home.hbs';
import { getRouter } from '@/router/router';
import { getContacts } from '@api/modules/contacts';
import { AddContactButton } from '@components/add-contact-btn/add-contact-btn';
import { startNewDialog } from '@components/contact/contact';
import { openChat } from '@/components/chat/chat';
import { inputMessage } from '@/components/input-message/input-message';
import { initWebSocket } from '@api/modules/websocket.js';

import '@/components/add-contact/add-contact.css';
import '@/components/contact/contact.css';
import '@/components/new-chat-menu/new-chat-menu.css';
import '@/components/input-message/input-message.css';
import '@components/message/message.css'

/**
 * Класс для управления домашней страницей приложения
 */
export class Home {
    #parent;
    #isMainMenuOpen = false;
    #isNewChatMenuOpen = false;
    #isProfileOpen = false;
    #isExitMenuOpen = false;
    #currentUser = null;
    #chats = [];
    #eventListeners = new Map();
    #isEventListenersInitialized = false;
    #addButtonInstance;
    #activeTab = 'chats';
    #isChatOpen = 'false';
    #openChatId = '';
    #messages = {};

    /**
     * Создает экземпляр класса Home
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.#parent = parent;
    }

    /**
     * Устанавливает состояние профиля и выполняет перерендер
     * @param {boolean} isOpen - Состояние профиля
     */
    setProfileOpen(isOpen) {
        if (this.#isProfileOpen !== isOpen) {
            this.#isProfileOpen = isOpen;
            this.render();
        }
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
     * Переключает отображение меню выхода
     */
    toggleExitMenu() {
        this.#isExitMenuOpen = !this.#isExitMenuOpen;
        this.updateExitMenuState();
    }

    /**
     * Обновляет состояние главного меню в DOM
     */
    updateMenuState() {
        const menuComponent = this.#parent.querySelector(
            '.menu__wrapper .Menu'
        );
        if (menuComponent) {
            menuComponent.classList.toggle('show', this.#isMainMenuOpen);
        }
    }

    /**
     * Обновляет состояние меню создания чата в DOM
     */
    updateNewChatMenuState() {
        const menuComponent = this.#parent.querySelector(
            '.chat-create__menu .Menu'
        );
        const newChatButtonIcon = this.#parent.querySelector(
            '.chat-create .action-button .icon'
        );

        if (menuComponent) {
            menuComponent.classList.toggle('show', this.#isNewChatMenuOpen);
        }

        if (newChatButtonIcon) {
            newChatButtonIcon.classList.toggle(
                'edit-icon',
                !this.#isNewChatMenuOpen
            );
            newChatButtonIcon.classList.toggle(
                'close-icon',
                this.#isNewChatMenuOpen
            );
        }
    }

    /**
     * Обновляет состояние меню выхода в DOM
     */
    updateExitMenuState() {
        const exitWrapper = this.#parent.querySelector('.exit__wrapper');
        const exitMenu = this.#parent.querySelector('.exit__wrapper .Menu');

        if (exitWrapper) {
            exitWrapper.classList.toggle('show', this.#isExitMenuOpen);
        }
        if (exitMenu) {
            exitMenu.classList.toggle('show', this.#isExitMenuOpen);
        }
    }

    /**
     * Закрывает меню выхода
     */
    closeExitMenu() {
        this.#isExitMenuOpen = false;
        this.updateExitMenuState();
    }

    /**
     * Обрабатывает кнопку "Назад" в профиле
     */
    handleProfileBack() {
        console.log('Profile back button clicked');
        this.closeProfile();
    }

    /**
     * Обрабатывает кнопку "Редактировать" в профиле
     */
    handleProfileEdit() {
        console.log('Profile edit button clicked');
        // Добавьте логику редактирования профиля
    }

    /**
     * Обрабатывает кнопку меню в профиле
     */
    handleProfileMenu() {
        console.log('Profile menu button clicked');
        this.toggleExitMenu();
    }

    /**
     * Открывает панель профиля
     */
    openProfile() {
        console.log('Opening profile...');
        this.setProfileOpen(true);
        this.closeAllMenus();
    }

    /**
     * Закрывает панель профиля
     */
    closeProfile() {
        console.log('Closing profile...');
        this.setProfileOpen(false);
        this.closeAllMenus();
    }

    /**
     * Обновляет состояние профиля в DOM (для восстановления после рендера)
     */
    updateProfileState() {
        const [menu, search] = this.#parent.querySelectorAll('.menu, .search');
        const chatArea = this.#parent.querySelector('.chat-area');
        const profileHeader = this.#parent.querySelector('.profile-header');

        // Обновляем область чата
        if (chatArea) {
            chatArea.classList.toggle(
                'chat-area--with-profile',
                this.#isProfileOpen
            );
        }

        // Обновляем видимость элементов
        if (menu) {
            menu.classList.toggle('Hide', this.#isProfileOpen);
        }
        if (search) {
            search.classList.toggle('Hide', this.#isProfileOpen);
        }
        if (profileHeader) {
            profileHeader.classList.toggle('Hide', !this.#isProfileOpen);
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
        this.closeExitMenu();
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
        const actionHandlers = {
            profile: () => this.openProfile(),
            contacts: () => this.handleContacts(),
            logout: () => this.signOut(),
            'create-channel': () => this.handleCreateChannel(),
            'create-group': () => this.handleCreateGroup(),
            'create-chat': () => this.handleCreateChat(),
            'leave-group': () => this.handleLeaveGroup(),
            'delete-chat': () => this.handleDeleteChat(),
            'profile-header__back': () => this.handleProfileBack(),
            'profile-header__edit': () => this.handleProfileEdit(),
            'profile-header__menu': () => this.handleProfileMenu(),
        };

        const handler = actionHandlers[action];
        if (handler) {
            handler();
        } else {
            console.warn('Unknown action:', action);
        }
    }

    /**
     * Обрабатывает открытие контактов
     */
    handleContacts() {
        console.log('Open contacts');
        // Добавьте логику открытия контактов
    }

    /**
     * Обрабатывает создание канала
     */
    handleCreateChannel() {
        console.log('Create channel');
        // Добавьте логику создания канала
    }

    /**
     * Обрабатывает создание группы
     */
    handleCreateGroup() {
        console.log('Create group');
        // Добавьте логику создания группы
    }

    /**
     * Обрабатывает создание чата
     */
    handleCreateChat() {
        console.log('Create chat');
        // Добавьте логику создания чата
    }

    /**
     * Обрабатывает выход из группы
     */
    handleLeaveGroup() {
        console.log('Leave group');
        // Добавьте логику выхода из группы
    }

    /**
     * Обрабатывает удаление чата
     */
    handleDeleteChat() {
        console.log('Delete chat');
        // Добавьте логику удаления чата
    }

    /**
     * Удаляет все обработчики событий
     */
    removeAllEventListeners() {
        // Удаляем делегированные обработчики
        this.#eventListeners.forEach((listener, type) => {
            this.#parent.removeEventListener(type, listener);
        });
        this.#eventListeners.clear();

        // Удаляем глобальные обработчики
        document.removeEventListener('click', this.#globalClickHandler);
        document.removeEventListener('keydown', this.#globalKeydownHandler);

        this.#isEventListenersInitialized = false;
    }

    /**
     * Обработчик глобальных кликов
     */
    #globalClickHandler = (e) => {
        if (
            this.#isMainMenuOpen ||
            this.#isNewChatMenuOpen ||
            this.#isExitMenuOpen
        ) {
            const menuWrapper = this.#parent.querySelector('.menu__wrapper');
            const newChatMenuWrapper =
                this.#parent.querySelector('.chat-create__menu');
            const exitMenuWrapper =
                this.#parent.querySelector('.exit__wrapper');
            const menuButton = this.#parent.querySelector('.menu .menu-button');
            const newChatButton = this.#parent.querySelector(
                '.chat-create .action-button'
            );
            const profileMenuButton = this.#parent.querySelector(
                '[data-action="profile-header__menu"]'
            );

            const isClickOutsideMainMenu =
                menuWrapper &&
                !menuWrapper.contains(e.target) &&
                !(menuButton && menuButton.contains(e.target));

            const isClickOutsideNewChatMenu =
                newChatMenuWrapper &&
                !newChatMenuWrapper.contains(e.target) &&
                !(newChatButton && newChatButton.contains(e.target));

            const isClickOutsideExitMenu =
                exitMenuWrapper &&
                !exitMenuWrapper.contains(e.target) &&
                !(profileMenuButton && profileMenuButton.contains(e.target));

            if (isClickOutsideMainMenu && this.#isMainMenuOpen) {
                this.closeMainMenu();
            }

            if (isClickOutsideNewChatMenu && this.#isNewChatMenuOpen) {
                this.closeNewChatMenu();
            }

            if (isClickOutsideExitMenu && this.#isExitMenuOpen) {
                this.closeExitMenu();
            }
        }
    };

    /**
     * Обработчик глобальных нажатий клавиш
     */
    #globalKeydownHandler = (e) => {
        if (e.key === 'Escape') {
            if (
                this.#isMainMenuOpen ||
                this.#isNewChatMenuOpen ||
                this.#isExitMenuOpen
            ) {
                this.closeAllMenus();
            } else if (this.#isProfileOpen) {
                this.closeProfile();
            }
        }
    };

    /**
     * Инициализирует обработчики событий для меню
     */
    initMenuEventListeners() {
        // Кнопка главного меню
        const menuButton = this.#parent.querySelector('.menu .menu-button');
        if (menuButton) {
            // Используем один обработчик через делегирование
            const menuButtonHandler = (e) => {
                if (e.target.closest('.menu .menu-button')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMainMenu();
                }
            };

            // Добавляем только если еще не добавлен
            if (!this.#eventListeners.has('menu-button')) {
                this.#parent.addEventListener('click', menuButtonHandler);
                this.#eventListeners.set('menu-button', menuButtonHandler);
            }
        }
    }

    /**
     * Инициализирует обработчики событий для создания чата
     */
    initChatCreateEventListeners() {
        // Кнопка создания нового чата
        const newChatButton = this.#parent.querySelector(
            '.chat-create .action-button'
        );
        if (newChatButton) {
            const newChatButtonHandler = (e) => {
                if (e.target.closest('.chat-create .action-button')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleNewChatMenu();
                }
            };

            if (!this.#eventListeners.has('new-chat-button')) {
                this.#parent.addEventListener('click', newChatButtonHandler);
                this.#eventListeners.set(
                    'new-chat-button',
                    newChatButtonHandler
                );
            }
        }

        // Показать/скрыть кнопку создания чата при наведении
        const chatsList = this.#parent.querySelector('.chats-panel');
        if (chatsList) {
            const mouseEnterHandler = () => this.showNewChatButton();
            const mouseLeaveHandler = () => this.hideNewChatButton();

            if (!this.#eventListeners.has('chats-mouseenter')) {
                chatsList.addEventListener('mouseenter', mouseEnterHandler);
                this.#eventListeners.set('chats-mouseenter', mouseEnterHandler);
            }

            if (!this.#eventListeners.has('chats-mouseleave')) {
                chatsList.addEventListener('mouseleave', mouseLeaveHandler);
                this.#eventListeners.set('chats-mouseleave', mouseLeaveHandler);
            }
        }
    }

    /**
     * Инициализирует обработчики событий для профиля
     */
    initProfileEventListeners() {
        // Делегирование событий для кнопок профиля
        const profileButtonHandler = (e) => {
            const button = e.target.closest('[data-action]');
            if (button) {
                const action = button.dataset.action;
                if (action.startsWith('profile-header__')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleMenuAction(action);
                }
            }
        };

        if (!this.#eventListeners.has('profile-buttons')) {
            this.#parent.addEventListener('click', profileButtonHandler);
            this.#eventListeners.set('profile-buttons', profileButtonHandler);
        }
    }

    /**
     * Инициализирует обработчики событий для выхода
     */
    initSignOutEventListeners() {
        const signOutButton = this.#parent.querySelector('#signOut');
        if (signOutButton) {
            const signOutHandler = (e) => {
                if (e.target.closest('#signOut')) {
                    e.preventDefault();
                    this.signOut();
                }
            };

            if (!this.#eventListeners.has('signout')) {
                this.#parent.addEventListener('click', signOutHandler);
                this.#eventListeners.set('signout', signOutHandler);
            }
        }
    }

    /**
     * Инициализирует глобальные обработчики событий
     */
    initGlobalEventListeners() {
        // Добавляем глобальные обработчики только один раз
        if (!this.#eventListeners.has('global-click')) {
            document.addEventListener('click', this.#globalClickHandler);
            this.#eventListeners.set('global-click', this.#globalClickHandler);
        }

        if (!this.#eventListeners.has('global-keydown')) {
            document.addEventListener('keydown', this.#globalKeydownHandler);
            this.#eventListeners.set(
                'global-keydown',
                this.#globalKeydownHandler
            );
        }
    }

    /**
     * Инициализирует делегированные обработчики для меню
     */
    initMenuDelegation() {
        // Один общий обработчик для всех пунктов меню
        const menuItemHandler = (e) => {
            const menuItem = e.target.closest('.MenuItem');
            if (menuItem) {
                const action = menuItem.dataset.action;
                this.handleMenuAction(action);
                this.closeAllMenus();
            }
        };

        if (!this.#eventListeners.has('menu-items')) {
            this.#parent.addEventListener('click', menuItemHandler);
            this.#eventListeners.set('menu-items', menuItemHandler);
        }
    }

    /**
     * Восстанавливает состояния после рендера
     */
    restoreMenuStates() {
        this.updateMenuState();
        this.updateNewChatMenuState();
        this.updateExitMenuState();
        this.updateProfileState();

        // Восстанавливаем видимость кнопки создания чата если нужно
        const chatsList = this.#parent.querySelector('.chats-panel');
        if (chatsList) {
            const isHovered = chatsList.matches(':hover');
            if (isHovered) {
                this.showNewChatButton();
            }
        }
    }

    /**
     * Инициализирует все обработчики событий
     */
    initEventListeners() {
        // Инициализируем только один раз
        if (this.#isEventListenersInitialized) {
            return;
        }

        this.initMenuDelegation();
        this.initMenuEventListeners();
        this.initChatCreateEventListeners();
        this.initProfileEventListeners();
        this.initSignOutEventListeners();
        this.initGlobalEventListeners();

        this.#isEventListenersInitialized = true;
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
            // console.log(chat);
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
        if (this.#currentUser) {
            return this.#currentUser;
        }

        const userData = app.user;
        if (userData) {
            this.#currentUser = userData;
            return userData;
        }

        try {
            const response = await User.getMe();
            if (response.ok) {
                this.#currentUser = await response.json();
                return this.#currentUser;
            } else {
                throw new Error(
                    `Ошибка получения данных пользователя: ${response.status}`
                );
            }
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            return null;
        }
    }

    /**
     * Выполняет выход пользователя из системы
     */
    signOut() {
        logoutUser().then(() => {
            app.user = null;
            const router = getRouter();
            router.navigateTo('/login');
        });
    }

    initAddButton() {
        const buttonEl = this.#parent.querySelector('.action-button');
        if (buttonEl) {
            if (this.#activeTab === 'chats') {
                this.#addButtonInstance = new startNewChat(buttonEl, this);
            } else if (this.#activeTab === 'contacts') {
                this.#addButtonInstance = new AddContactButton(buttonEl, this);
            }
            
        }
    }

    renderPage (HomeData) {
        if (!HomeData.user) {
            HomeData.user = app.user;
        }
        console.log(HomeData);
        this.#parent.innerHTML = HomeTemplate(HomeData);

        const signOutButton = this.#parent.querySelector('#signOut');
        const menuBtn = this.#parent.querySelector('#menuBtn');
        const backBtn = this.#parent.querySelector('#backBtn');
        if (signOutButton) {
            signOutButton.addEventListener('click', () =>
                this.signOut()
            );
        }
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.openMenu();
            })
        }
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.renderChats();
            })
        }

        if (this.#activeTab === 'contacts') {
            startNewDialog(HomeData, this);
        } else if (this.#activeTab === 'chats') {
            openChat(HomeData, this);
        }

        //Выделение активного чата
        if(this.#isChatOpen) {
            const chatElement = document.querySelector(`[data-chat-id="${this.#openChatId}"]`);
            if (chatElement) {
                chatElement.classList.add('active');
            }
        }

        inputMessage();
        this.initAddButton();
    }

    async openMenu() {
        this.renderContacts();
    }

    async renderChat(HomeData, chatId, messages) {
        this.#isChatOpen = true;
        HomeData.isChatOpen = true;
        this.#openChatId = chatId;
        HomeData.chatId = chatId;
        this.#messages = messages;
        HomeData.messages = messages.reverse();

        this.renderPage(HomeData);
    }

    async renderContacts() {
        const HomeData = {};
        HomeData.user = app.user;
        this.#activeTab = 'contacts';
        try {
            const contacts = await getContacts();

            HomeData.contacts = contacts.map(contactItem => {
                if (!contactItem.contact.placeholder && contactItem.contact.name) {
                    contactItem.contact.placeholder = getPlaceholder(contactItem.contact.name);
                }
                return contactItem;
            });
            HomeData.hasContacts = contacts.length > 0;
            HomeData.activeTabChats = this.#activeTab === 'chats';
            HomeData.activeTabContacts = this.#activeTab === 'contacts';
            HomeData.isChatOpen = this.#isChatOpen;
            HomeData.chatId = this.#openChatId;
            HomeData.messages = this.#messages;

            this.renderPage(HomeData);

        } catch(error) {
            console.error("Ошибка:", error);
        }
    }

    async renderChats() {
        const HomeData = {};
        HomeData.user = app.user;
        this.#activeTab = 'chats';
        try {
            const response = await Chat.getChats();

            if (response.ok) {
                const chats = await response.json();
                HomeData.chats = this.processChats(chats).reverse();
                HomeData.hasChats = this.processChats(chats).length > 0;
                HomeData.activeTabChats = this.#activeTab === 'chats';
                HomeData.activeTabContacts = this.#activeTab === 'contacts';
                HomeData.isChatOpen = this.#isChatOpen;
                HomeData.chatId = this.#openChatId;
                HomeData.messages = this.#messages;
                
                

                const signOutButton = this.#parent.querySelector('#signOut');
                const menuBtn = this.#parent.querySelector('#menuBtn');
                if (signOutButton) {
                    signOutButton.addEventListener('click', () =>
                        this.signOut()
                    );
                }
                if (menuBtn) {
                    menuBtn.addEventListener('click', () => {
                        this.openMenu();
                    })
                }
                console.log(HomeData)
                this.renderPage(HomeData);
            } else {
                throw new Error(`Ошибка получения чатов: ${response.status}`);
            }
        } catch(error) {
            console.error("Ошибка", error);
        }
    }

    
    /**
     * Рендерит домашнюю страницу с данными пользователя и чатами
     * @returns {Promise<void>}
     */
    async render() {
        const HomeData = {};
        this.#activeTab = 'chats';
        this.#isChatOpen = false;
        this.#messages = {};

        try {
            const userData = await this.getCurrentUser();
            if (userData) {
                app.user = userData;
                HomeData.user = userData;
                HomeData.user.placeholder = getPlaceholder(
                    userData.name || userData.username
                );
            }
            this.renderChats();

            // Загружаем чаты только если их еще нет
            if (this.#chats.length === 0) {
                const response = await Chat.getChats();
                if (response.ok) {
                    const chats = await response.json();
                    this.#chats = this.processChats(chats);
                } else {
                    throw new Error(
                        `Ошибка получения чатов: ${response.status}`
                    );
                }
            }

            HomeData.chats = this.#chats;
            HomeData.hasChats = this.#chats.length > 0;
            HomeData.isProfileOpen = this.#isProfileOpen;

            // Используем меню с actions
            HomeData.newChats = contextMenu.newChat;
            HomeData.mainMenu = contextMenu.mainMenu;
            HomeData.exit = contextMenu.exit;

            this.#parent.innerHTML = HomeTemplate(HomeData);
            this.initEventListeners();
            this.restoreMenuStates();
            initWebSocket();
            window.addEventListener('beforeunload', () => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.close(1000, 'Page reload'); 
                }
            });

            // const response = await Chat.getChats();

            // if (response.ok) {
            //     const chats = await response.json();
            //     HomeData.chats = this.processChats(chats);
            //     HomeData.hasChats = this.processChats(chats).length > 0;
            //     HomeData.activeTabChats = this.#activeTab === 'chats';
            //     HomeData.activeTabContacts = this.#activeTab === 'contacts';

            //     this.#parent.innerHTML = HomeTemplate(HomeData);

            //     const signOutButton = this.#parent.querySelector('#signOut');
            //     const menuBtn = this.#parent.querySelector('#menuBtn');
            //     if (signOutButton) {
            //         signOutButton.addEventListener('click', () =>
            //             this.signOut()
            //         );
            //     }
            //     if (menuBtn) {
            //         menuBtn.addEventListener('click', () => {
            //             this.openMenu();
            //         })
            //     }
            // } else {
            //     throw new Error(`Ошибка получения чатов: ${response.status}`);
            // }
        } catch (error) {
            console.error('Ошибка при рендеринге домашней страницы:', error);
            HomeData.error = 'Не удалось загрузить данные';
            HomeData.isProfileOpen = this.#isProfileOpen;
            this.#parent.innerHTML = HomeTemplate(HomeData);
            this.initEventListeners();
            this.restoreMenuStates();
        }
        this.initAddButton();
    }

    /**
     * Создает массив чатов (заглушка для совместимости)
     * @param {Array} chats - Массив чатов
     * @returns {Array} Исходный массив чатов
     */
    createChats(chats) {
        return chats || [];
    }

    /**
     * Очищает ресурсы при уничтожении компонента
     */
    destroy() {
        this.removeAllEventListeners();
    }
}
