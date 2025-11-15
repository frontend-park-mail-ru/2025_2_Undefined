import { getAppealStats } from '@api/modules/appeals.js';
import { logoutUser } from '@api/modules/auth.js';
import User from '@api/modules/user.js';
import { getPlaceholder } from '@components/avatar/avatar.js';

import * as ContextMenu from '@/components/context-menu/context-menu.js';
import { app } from '@/main.js';
import StatsTemplate from '@/pages/stats/stats.hbs';
import { getRouter } from '@/router/router';

/**
 * Класс для управления страницей статистики
 */
export class Stats {
    #parent;
    #isMainMenuOpen = false;
    #currentUser = null;
    #statsData = null;
    #isLoading = false;
    #error = null;

    /**
     * Создает экземпляр класса Stats
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.#parent = parent;
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
     * Закрывает главное меню
     */
    closeMainMenu() {
        this.#isMainMenuOpen = false;
        this.updateMenuState();
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
            home: () => this.goHome(),
            logout: () => this.signOut(),
        };

        const handler = actionHandlers[action];
        if (handler) {
            handler();
            this.closeMainMenu();
        } else {
            console.warn('Unknown action:', action);
        }
    }

    /**
     * Переходит на домашнюю страницу
     */
    goHome() {
        const router = getRouter();
        router.navigateTo('/home');
    }

    /**
     * Обрабатывает открытие контактов
     */
    handleContacts() {
        console.log('Open contacts');
    }

    /**
     * Открывает панель профиля
     */
    openProfile() {
        console.log('Opening profile...');
        // Реализация открытия профиля
    }

    /**
     * Загружает статистику обращений
     */
    async loadStats(startDate = null, endDate = null) {
        this.#isLoading = true;
        this.#error = null;

        try {
            const params = {};
            if (startDate) {
                params.start_date = startDate;
            }
            if (endDate) {
                params.end_date = endDate;
            }

            const response = await getAppealStats(params);

            if (response.ok) {
                this.#statsData = await response.json();
            } else {
                throw new Error(
                    `Ошибка загрузки статистики: ${response.status}`
                );
            }
        } catch (error) {
            console.error('Ошибка при загрузке статистики:', error);
            this.#error = error.message;
        } finally {
            this.#isLoading = false;
            this.render();
        }
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
     * Обработчик глобальных кликов
     */
    globalClickHandler = (e) => {
        if (this.#isMainMenuOpen) {
            const menuWrapper = this.#parent.querySelector('.menu__wrapper');
            const menuButton = this.#parent.querySelector(
                '.menu .action-button'
            );

            const isClickOutsideMainMenu =
                menuWrapper &&
                !menuWrapper.contains(e.target) &&
                !(menuButton && menuButton.contains(e.target));

            if (isClickOutsideMainMenu && this.#isMainMenuOpen) {
                this.closeMainMenu();
            }
        }
    };

    /**
     * Обработчик глобальных нажатий клавиш
     */
    globalKeydownHandler = (e) => {
        if (e.key === 'Escape') {
            if (this.#isMainMenuOpen) {
                this.closeMainMenu();
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

        // Обработчики для фильтров даты
        const startDateInput = this.#parent.querySelector('#startDate');
        const endDateInput = this.#parent.querySelector('#endDate');

        if (startDateInput && endDateInput) {
            const updateStats = () => {
                const startDate = startDateInput.value;
                const endDate = endDateInput.value;
                this.loadStats(startDate, endDate);
            };

            startDateInput.addEventListener('change', updateStats);
            endDateInput.addEventListener('change', updateStats);
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
     * Подготавливает данные для рендеринга
     */
    async prepareRenderData() {
        const statsData = {};

        try {
            // Получаем данные пользователя
            const userData = await this.getCurrentUser();
            statsData.user = {
                ...userData,
                placeholder: getPlaceholder(
                    userData.name || userData.username || 'Пользователь'
                ),
            };

            // Добавляем данные статистики
            statsData.stats = this.#statsData || {
                total: {
                    total_appeals: 0,
                    open_appeals: 0,
                    in_work_appeals: 0,
                    closed_appeals: 0,
                    feature_requests: 0,
                    bug_reports: 0,
                    claims: 0,
                    others: 0,
                },
                by_category: {},
                by_status: {},
                by_date_range: [],
            };

            statsData.isLoading = this.#isLoading;
            statsData.error = this.#error;
        } catch (error) {
            console.error('Ошибка при подготовке данных:', error);
            statsData.error = error.message;
        }

        // Всегда добавляем эти данные
        statsData.mainMenu = [
            ...ContextMenu.mainMenu,
            { text: 'Домой', action: 'home', icon: 'home' },
        ];

        return statsData;
    }

    /**
     * Рендерит страницу статистики
     */
    async render() {
        try {
            console.log('Starting stats render...');

            // Загружаем статистику если еще не загружена
            if (!this.#statsData && !this.#isLoading && !this.#error) {
                await this.loadStats();
            }

            // Подготавливаем данные
            const renderData = await this.prepareRenderData();
            console.log('Stats render data prepared:', renderData);

            // Удаляем старые обработчики
            this.removeAllEventListeners();

            // Рендерим шаблон
            const html = StatsTemplate(renderData);
            this.#parent.innerHTML = html;

            // Инициализируем новые обработчики
            this.initEventListeners();
            this.updateMenuState();

            console.log('Stats render completed successfully');
        } catch (error) {
            console.error(
                'Критическая ошибка при рендеринге статистики:',
                error
            );

            // Показываем простой fallback
            this.#parent.innerHTML = `
                <div class="stats">
                    <div class="header">
                        <div style="color: white; padding: 20px;">
                            Ошибка загрузки статистики. <button onclick="location.reload()">Перезагрузить</button>
                        </div>
                    </div>
                    <div class="stats-content">
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
