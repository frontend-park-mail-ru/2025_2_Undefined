// import { logoutUser } from '@api/modules/auth.js';
// import Chat from '@api/modules/chats.js';
// import { getContacts } from '@api/modules/contacts';
// import User from '@api/modules/user.js';
// import { initWebSocket } from '@api/modules/websocket.js';
// import { AddContactButton } from '@components/add-contact-btn/add-contact-btn';
// import { getPlaceholder } from '@components/avatar/avatar.js';
// import { startNewDialog } from '@components/contact/contact';
// import { renderMenuOfChat } from '@components/menu-of-chat/menu-of-chat.js';

// import { startNewChat } from '@/components/action-button/action-button';
// import { openChat } from '@/components/chat/chat';
// import { inputMessage } from '@/components/input-message/input-message';
// import { app } from '@/main.js';
// import HomeTemplate from '@/pages/home/home.hbs';
// import { getRouter } from '@/router/router';

// import '@components/menu-of-chat/menu-of-chat.css';
// import '@components/profile/profile.css';
// import '@/components/add-contact/add-contact.css';
// import '@/components/contact/contact.css';
// import '@/components/new-chat-menu/new-chat-menu.css';
// import '@/components/input-message/input-message.css';
// import '@components/message/message.css';

// /**
//  * Класс для управления домашней страницей приложения
//  */
// export class Home {
//     #parent;
//     #addButtonInstance;
//     #activeTab = 'chats';
//     #isChatOpen = 'false';
//     #openChatId = '';
//     #messages = {};
//     #isGroup = false;
//     #isInitialized = false;

//     /**
//      * Создает экземпляр класса Home
//      * @param {HTMLElement} parent - Родительский элемент для рендеринга
//      */
//     constructor(parent) {
//         this.#parent = parent;
//     }

//     /**
//      * Преобразует дату created_at в человеческий формат
//      * @param {string} dateString - Дата в строковом формате из API
//      * @returns {string} Дата в человеческом формате
//      */
//     formatMessageDate(dateString) {
//         const inputDate = new Date(dateString);
//         const now = new Date();
//         const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//         // Приводим даты к локальному времени для корректного сравнения
//         const today = new Date(
//             now.getFullYear(),
//             now.getMonth(),
//             now.getDate()
//         );
//         const inputDay = new Date(
//             inputDate.getFullYear(),
//             inputDate.getMonth(),
//             inputDate.getDate()
//         );

//         // Разница в днях
//         const diffTime = inputDay - today;
//         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//         // Начало текущей недели (понедельник)
//         const startOfWeek = new Date(today);
//         startOfWeek.setDate(
//             today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
//         );

//         if (diffDays === 0) {
//             // Сегодня - возвращаем только время
//             return inputDate.toLocaleTimeString('ru-RU', {
//                 timeZone,
//                 hour: '2-digit',
//                 minute: '2-digit',
//             });
//         } else if (diffDays >= -6 && diffDays < 0) {
//             // На этой неделе (но не сегодня) - возвращаем день недели
//             return inputDate.toLocaleDateString('ru-RU', {
//                 timeZone,
//                 weekday: 'short',
//             });
//         } else {
//             // Больше чем на этой неделе - возвращаем число и сокращенный месяц
//             return inputDate.toLocaleDateString('ru-RU', {
//                 timeZone,
//                 day: 'numeric',
//                 month: 'short',
//             });
//         }
//     }

//     /**
//      * Обрабатывает список чатов, преобразуя даты последних сообщений
//      * @param {Array} chats - Массив чатов из API
//      * @returns {Array} Обработанный массив чатов с человеческими датами
//      */
//     processChats(chats) {
//         if (!Array.isArray(chats)) {
//             console.error('Ожидался массив чатов');
//             return [];
//         }

//         return chats.map((chat) => {
//             // console.log(chat);
//             if (chat.last_message && chat.last_message.created_at) {
//                 // Создаем копию, чтобы не мутировать исходные данные
//                 const processedChat = { ...chat };
//                 processedChat.last_message = {
//                     ...chat.last_message,
//                     created_at_formatted: this.formatMessageDate(
//                         chat.last_message.created_at
//                     ),
//                     created_at_original: chat.last_message.created_at, // сохраняем оригинальную дату
//                 };
//                 processedChat.placeholder = getPlaceholder(chat.name);
//                 return processedChat;
//             }
//             return chat;
//         });
//     }

//     /**
//      * Получает данные текущего пользователя
//      * @returns {Promise<Object>} Данные пользователя
//      */
//     async getCurrentUser() {
//         const userData = app.user;
//         if (userData) {
//             return userData;
//         } else {
//             try {
//                 const response = await User.getMe();

//                 if (response.ok) {
//                     const userData = await response.json();
//                     return userData;
//                 } else {
//                     throw new Error(
//                         `Ошибка получения данных пользователя: ${response.status}`
//                     );
//                 }
//             } catch (error) {
//                 console.error(
//                     'Ошибка при получении данных пользователя:',
//                     error
//                 );
//                 return null;
//             }
//         }
//     }

//     /**
//      * Выполняет выход пользователя из системы
//      */
//     signOut() {
//         logoutUser().then(() => {
//             app.user = null;
//             const router = getRouter();
//             router.navigateTo('/login');
//         });
//     }

//     /**
//      * Инициализирует кнопку добавления (чат/контакт)
//      * @param {Object} homeData - Данные домашней страницы
//      */
//     initAddButton(homeData) {
//         const buttonEl = this.#parent.querySelector('.action-button');
//         if (buttonEl && !buttonEl.hasAttribute('data-initialized')) {
//             // Помечаем кнопку как инициализированную
//             buttonEl.setAttribute('data-initialized', 'true');

//             if (this.#activeTab === 'chats') {
//                 this.#addButtonInstance = new startNewChat(
//                     buttonEl,
//                     this,
//                     homeData
//                 );
//             } else if (this.#activeTab === 'contacts') {
//                 this.#addButtonInstance = new AddContactButton(buttonEl, this);
//             }
//         }
//     }

//     /**
//      * Закрывает меню и возвращается к предыдущему состоянию
//      * @param {Object} HomeData - Данные для рендеринга
//      */
//     closeMenu(HomeData) {
//         // В зависимости от текущего активного таба, возвращаемся к соответствующему представлению
//         if (this.#activeTab === 'profile') {
//             // Если меню было открыто из чатов, возвращаемся к чатам
//             this.#activeTab = 'chats';
//             this.renderChats();
//         } else if (this.#activeTab === 'contacts') {
//             // Если меню было открыто из контактов, возвращаемся к контактам
//             this.renderContacts();
//         }
//         // Можно добавить дополнительную логику для других случаев
//     }

//     /**
//      * Очищает все обработчики событий
//      */
//     #cleanupEventListeners() {
//         // Здесь можно добавить логику очистки, если нужно
//         this.#addButtonInstance = null;
//     }

//     renderPage(HomeData) {
//         if (!HomeData.user) {
//             HomeData.user = app.user;
//         }

//         if (HomeData.messages && typeof HomeData.messages === 'object') {
//             for (const key in HomeData.messages) {
//                 HomeData.messages[key].created_at = HomeData.messages[
//                     key
//                 ].created_at.substring(11, 16);
//             }
//         }

//         console.log(HomeData);

//         // Очищаем перед рендером
//         this.#cleanupEventListeners();

//         this.#parent.innerHTML = HomeTemplate(HomeData);

//         const signOutButton = this.#parent.querySelector('#signOut');
//         const menuBtn = this.#parent.querySelector('#menuBtn');
//         const backBtn = this.#parent.querySelector('#backBtn');
//         const closeMenuButton = this.#parent.querySelector(
//             '[dataAction="close-menu"]'
//         );

//         console.log(menuBtn);

//         if (signOutButton) {
//             // Удаляем старые обработчики и добавляем новые
//             signOutButton.replaceWith(signOutButton.cloneNode(true));
//             const newSignOutButton = this.#parent.querySelector('#signOut');
//             newSignOutButton.addEventListener('click', () => this.signOut());
//         }

//         if (menuBtn) {
//             menuBtn.replaceWith(menuBtn.cloneNode(true));
//             const newMenuBtn = this.#parent.querySelector('#menuBtn');
//             newMenuBtn.addEventListener('click', () => {
//                 console.log(123);
//                 this.openMenu(HomeData);
//             });
//         }

//         if (backBtn) {
//             backBtn.replaceWith(backBtn.cloneNode(true));
//             const newBackBtn = this.#parent.querySelector('#backBtn');
//             newBackBtn.addEventListener('click', () => {
//                 this.renderChats(this.menuOfChat(HomeData));
//             });
//         }

//         if (closeMenuButton) {
//             closeMenuButton.replaceWith(closeMenuButton.cloneNode(true));
//             const newCloseMenuButton = this.#parent.querySelector(
//                 '[dataAction="close-menu"]'
//             );
//             newCloseMenuButton.addEventListener('click', () => {
//                 this.closeMenu(HomeData);
//             });
//         }

//         if (this.#activeTab === 'contacts') {
//             startNewDialog(HomeData, this);
//         } else if (this.#activeTab === 'chats') {
//             openChat(HomeData, this);
//         }

//         const nameOfChat = document.querySelector('#nameOfChat');
//         if (nameOfChat) {
//             nameOfChat.replaceWith(nameOfChat.cloneNode(true));
//             const newNameOfChat = document.querySelector('#nameOfChat');
//             newNameOfChat.addEventListener('click', () =>
//                 this.menuOfChat(HomeData)
//             );
//         }

//         //Выделение активного чата
//         if (this.#isChatOpen) {
//             const chatElement = document.querySelector(
//                 `[data-chat-id="${this.#openChatId}"]`
//             );
//             if (chatElement) {
//                 chatElement.classList.add('active');
//             }
//         }

//         inputMessage();
//         this.initAddButton(HomeData);
//     }

//     async menuOfChat(HomeData) {
//         const parentElement = document.querySelector('.header');
//         renderMenuOfChat(parentElement, this, HomeData);
//     }

//     async openMenu(HomeData) {
//         this.renderProfile(HomeData);
//     }

//     renderProfile(HomeData) {
//         this.#activeTab = 'profile';
//         HomeData.activeTabProfile = true;
//         HomeData.activeTabChats = this.#activeTab === 'chats';
//         HomeData.activeTabContacts = this.#activeTab === 'contacts';

//         this.renderPage(HomeData);
//     }

//     async renderChat(HomeData, chatId, messages, isGroup) {
//         this.#isChatOpen = true;
//         HomeData.isChatOpen = true;
//         this.#openChatId = chatId;
//         HomeData.chatId = chatId;
//         this.#messages = messages;
//         HomeData.messages = messages.reverse();
//         this.#isGroup = isGroup;
//         HomeData.isGroup = isGroup;
//         console.log(HomeData.messages);
//         HomeData.messages.forEach((message) => {
//             message.isMine = message.sender_id === app.user.id;
//             message.isSystem = message.type === 'system';
//         });

//         this.renderPage(HomeData);
//     }

//     async renderContacts() {
//         const HomeData = {};
//         HomeData.user = app.user;
//         this.#activeTab = 'contacts';
//         try {
//             const contacts = await getContacts();

//             HomeData.contacts = contacts.map((contactItem) => {
//                 if (
//                     !contactItem.contact.placeholder &&
//                     contactItem.contact.name
//                 ) {
//                     contactItem.contact.placeholder = getPlaceholder(
//                         contactItem.contact.name
//                     );
//                 }
//                 return contactItem;
//             });
//             HomeData.hasContacts = contacts.length > 0;
//             HomeData.activeTabChats = this.#activeTab === 'chats';
//             HomeData.activeTabContacts = this.#activeTab === 'contacts';
//             HomeData.activeTabProfile = this.#activeTab === 'profile;';
//             HomeData.isChatOpen = this.#isChatOpen;
//             HomeData.chatId = this.#openChatId;
//             HomeData.messages = this.#messages;

//             this.renderPage(HomeData);
//         } catch (error) {
//             console.error('Ошибка:', error);
//         }
//     }

//     async renderChats() {
//         const HomeData = {};
//         HomeData.user = app.user;
//         this.#activeTab = 'chats';
//         try {
//             const response = await Chat.getChats();

//             if (response.ok) {
//                 const chats = await response.json();
//                 HomeData.chats = this.processChats(chats).reverse();
//                 HomeData.hasChats = this.processChats(chats).length > 0;
//                 HomeData.activeTabChats = this.#activeTab === 'chats';
//                 HomeData.activeTabContacts = this.#activeTab === 'contacts';
//                 HomeData.activeTabProfile = this.#activeTab === 'profile;';
//                 HomeData.isChatOpen = this.#isChatOpen;
//                 HomeData.chatId = this.#openChatId;
//                 HomeData.messages = this.#messages;

//                 console.log('HomeData', HomeData);
//                 this.renderPage(HomeData);
//             } else {
//                 throw new Error(`Ошибка получения чатов: ${response.status}`);
//             }
//         } catch (error) {
//             console.error('Ошибка', error);
//         }
//     }

//     /**
//      * Рендерит домашнюю страницу с данными пользователя и чатами
//      * @returns {Promise<void>}
//      */
//     async render() {
//         const HomeData = {};
//         this.#activeTab = 'chats';
//         this.#isChatOpen = false;
//         this.#messages = {};

//         try {
//             const userData = await this.getCurrentUser();
//             if (userData) {
//                 app.user = userData;
//                 HomeData.user = userData;

//                 HomeData.user.placeholder = getPlaceholder(
//                     userData.name || userData.username
//                 );
//             }
//             this.renderChats();

//             initWebSocket();
//             window.addEventListener('beforeunload', () => {
//                 if (ws && ws.readyState === WebSocket.OPEN) {
//                     ws.close(1000, 'Page reload');
//                 }
//             });
//         } catch (error) {
//             console.error('Ошибка при рендеринге домашней страницы:', error);

//             HomeData.error = 'Не удалось загрузить данные';
//             this.#parent.innerHTML = HomeTemplate(HomeData);
//         }
//         this.initAddButton();
//     }

//     /**
//      * Создает массив чатов (заглушка для совместимости)
//      * @param {Array} chats - Массив чатов
//      * @returns {Array} Исходный массив чатов
//      */
//     createChats(chats) {
//         return chats || [];
//     }
// }
