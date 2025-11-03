import { logoutUser } from '@api/modules/auth.js';
import Chat from '@api/modules/chats.js';
import User from '@api/modules/user.js';
import { getPlaceholder } from '@components/avatar/avatar.js';

import { app } from '@/main.js';
import HomeTemplate from '@/pages/home/home.hbs';
import { getRouter } from '@/router/router';

/**
 * Класс для управления домашней страницей приложения
 */
export class Home {
    #parent;

    /**
     * Создает экземпляр класса Home
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.#parent = parent;
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

        // Приводим даты к локальному времени для корректного сравнения
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

        // Разница в днях
        const diffTime = inputDay - today;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Начало текущей недели (понедельник)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(
            today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
        );

        if (diffDays === 0) {
            // Сегодня - возвращаем только время
            return inputDate.toLocaleTimeString('ru-RU', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (diffDays >= -6 && diffDays < 0) {
            // На этой неделе (но не сегодня) - возвращаем день недели
            return inputDate.toLocaleDateString('ru-RU', {
                timeZone,
                weekday: 'short',
            });
        } else {
            // Больше чем на этой неделе - возвращаем число и сокращенный месяц
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
                // Создаем копию, чтобы не мутировать исходные данные
                const processedChat = { ...chat };
                processedChat.last_message = {
                    ...chat.last_message,
                    created_at_formatted: this.formatMessageDate(
                        chat.last_message.created_at
                    ),
                    created_at_original: chat.last_message.created_at, // сохраняем оригинальную дату
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
                HomeData.hasChats = this.processChats(chats).length > 0;

                this.#parent.innerHTML = HomeTemplate(HomeData);

                const signOutButton = this.#parent.querySelector('#signOut');
                if (signOutButton) {
                    signOutButton.addEventListener('click', () =>
                        this.signOut()
                    );
                }
            } else {
                throw new Error(`Ошибка получения чатов: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка при рендеринге домашней страницы:', error);

            HomeData.error = 'Не удалось загрузить данные';
            this.#parent.innerHTML = HomeTemplate(HomeData);
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
