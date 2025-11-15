export class Stats {
    constructor(container) {
        this.container = container;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSort = { field: 'created_at', direction: 'desc' };
        this.filters = {
            period: 'week',
            type: 'all',
            dateFrom: null,
            dateTo: null,
            search: '',
        };

        this.requestsCanvas = null;
        this.typesCanvas = null;

        // Конфигурация графиков
        this.chartConfig = {
            colors: {
                total: '#667eea',
                resolved: '#48bb78',
                pending: '#ed8936',
                types: ['#667eea', '#ed8936', '#48bb78', '#9f7aea'],
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 50,
            },
        };

        // Загрузка шаблонов
        this.templates = {
            main: Handlebars.compile(`
                <div class="stats">
                    {{> header}}
                    
                    <div class="stats-content">
                        {{> controls}}
                        {{> grid}}
                    </div>
                </div>
            `),
            header: Handlebars.compile(`
                <div class="header">
                    <div class="header__wrapper">
                        <div class="header__column header__column--left">
                            <div class="menu">
                                <div class="action-button" data-action="menu">
                                    <i class="icon menu-icon"></i>
                                </div>
                                <div class="menu__wrapper">
                                    <!-- Контекстное меню будет здесь -->
                                </div>
                            </div>
                            <div class="search">
                                <i class="icon search-icon"></i>
                                <input class="search__input" type="text" placeholder="Поиск по статистике" id="statsSearch">
                            </div>
                        </div>
                        
                        <div class="header__column header__column--middle">
                            <h1 class="stats__title">Статистика обращений</h1>
                        </div>
                        
                        <div class="header__column header__column--right">
                            <div class="user-header">
                                <div class="user-header__info">
                                    <div class="user-header__details">
                                        <div class="user-header__name">Пользователь</div>
                                    </div>
                                    <div class="user-header__avatar">
                                        <div class="avatar">U</div>
                                    </div>
                                </div>
                            </div>
                            <div class="header__sign-out" id="signOut">
                                <i class="icon icon--size-lg signOut-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `),
            controls: Handlebars.compile(`
                <div class="stats-controls">
                    <div class="stats-filters">
                        <div class="filter-group">
                            <label class="filter-label">Период:</label>
                            <select class="filter-select" id="periodSelect">
                                <option value="today">Сегодня</option>
                                <option value="yesterday">Вчера</option>
                                <option value="week" selected>Неделя</option>
                                <option value="month">Месяц</option>
                                <option value="quarter">Квартал</option>
                                <option value="year">Год</option>
                                <option value="custom">Произвольный</option>
                            </select>
                        </div>
                        
                        <div class="filter-group custom-dates Hide" id="customDates">
                            <label class="filter-label">С:</label>
                            <input type="date" class="filter-date" id="dateFrom">
                            <label class="filter-label">По:</label>
                            <input type="date" class="filter-date" id="dateTo">
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Тип обращения:</label>
                            <select class="filter-select" id="typeSelect">
                                <option value="all">Все</option>
                                <option value="question">Вопрос</option>
                                <option value="complaint">Жалоба</option>
                                <option value="suggestion">Предложение</option>
                                <option value="technical">Техническая</option>
                            </select>
                        </div>
                        
                        <button class="filter-apply" id="applyFilters">Применить</button>
                        <button class="filter-export" id="exportStats">
                            <i class="icon export-icon"></i>
                            Экспорт
                        </button>
                    </div>
                </div>
            `),
            grid: Handlebars.compile(`
                <div class="stats-grid">
                    {{> cards}}
                    {{> charts}}
                    {{> table}}
                </div>
            `),
            cards: Handlebars.compile(`
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-card__icon stat-card__icon--total">
                            <i class="icon requests-icon">📊</i>
                        </div>
                        <div class="stat-card__content">
                            <div class="stat-card__value" id="totalRequests">0</div>
                            <div class="stat-card__label">Всего обращений</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card__icon stat-card__icon--resolved">
                            <i class="icon resolved-icon">✅</i>
                        </div>
                        <div class="stat-card__content">
                            <div class="stat-card__value" id="resolvedRequests">0</div>
                            <div class="stat-card__label">Решено</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card__icon stat-card__icon--pending">
                            <i class="icon pending-icon">⏳</i>
                        </div>
                        <div class="stat-card__content">
                            <div class="stat-card__value" id="pendingRequests">0</div>
                            <div class="stat-card__label">В работе</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card__icon stat-card__icon--response">
                            <i class="icon time-icon">⏱️</i>
                        </div>
                        <div class="stat-card__content">
                            <div class="stat-card__value" id="avgResponseTime">0ч</div>
                            <div class="stat-card__label">Среднее время ответа</div>
                        </div>
                    </div>
                </div>
            `),
            charts: Handlebars.compile(`
                <div class="stats-charts">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title">Обращения по дням</h3>
                            <div class="chart-legend">
                                <div class="legend-item">
                                    <span class="legend-color legend-color--total"></span>
                                    <span class="legend-text">Все обращения</span>
                                </div>
                                <div class="legend-item">
                                    <span class="legend-color legend-color--resolved"></span>
                                    <span class="legend-text">Решено</span>
                                </div>
                            </div>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="requestsChart" width="400" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title">Распределение по типам</h3>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="typesChart" width="400" height="300"></canvas>
                        </div>
                    </div>
                </div>
            `),
            table: Handlebars.compile(`
                <div class="stats-table-container">
                    <div class="table-header">
                        <h3 class="table-title">Детализация обращений</h3>
                        <div class="table-controls">
                            <select class="table-select" id="tableSort">
                                <option value="newest">Сначала новые</option>
                                <option value="oldest">Сначала старые</option>
                                <option value="type">По типу</option>
                                <option value="status">По статусу</option>
                            </select>
                        </div>
                    </div>
                    <div class="stats-table-wrapper scrollable">
                        <table class="stats-table" id="requestsTable">
                            <thead>
                                <tr>
                                    <th data-sort="id">ID</th>
                                    <th data-sort="created_at">Дата создания</th>
                                    <th data-sort="type">Тип</th>
                                    <th data-sort="theme">Тема</th>
                                    <th data-sort="status">Статус</th>
                                    <th data-sort="response_time">Время ответа</th>
                                    <th data-sort="operator">Оператор</th>
                                </tr>
                            </thead>
                            <tbody id="requestsTableBody">
                                <!-- Данные будут заполняться через JavaScript -->
                            </tbody>
                        </table>
                    </div>
                    <div class="table-pagination" id="tablePagination">
                        <!-- Пагинация будет генерироваться через JavaScript -->
                    </div>
                </div>
            `),
        };

        // Регистрируем partials
        Handlebars.registerPartial('header', this.templates.header);
        Handlebars.registerPartial('controls', this.templates.controls);
        Handlebars.registerPartial('grid', this.templates.grid);
        Handlebars.registerPartial('cards', this.templates.cards);
        Handlebars.registerPartial('charts', this.templates.charts);
        Handlebars.registerPartial('table', this.templates.table);
    }

    render() {
        // Очищаем контейнер
        this.container.innerHTML = '';

        // Рендерим основной шаблон
        this.container.innerHTML = this.templates.main();

        // Инициализируем компоненты
        this.initCharts();
        this.bindEvents();
        this.loadStats();

        return this.container;
    }

    // Остальные методы класса остаются без изменений...
    bindEvents() {
        // Фильтры
        document
            .getElementById('periodSelect')
            .addEventListener('change', (e) => {
                this.filters.period = e.target.value;
                this.toggleCustomDates();
            });

        document
            .getElementById('typeSelect')
            .addEventListener('change', (e) => {
                this.filters.type = e.target.value;
            });

        document
            .getElementById('applyFilters')
            .addEventListener('click', () => {
                this.applyFilters();
            });

        // Поиск
        document
            .getElementById('statsSearch')
            .addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.debounce(() => this.applyFilters(), 300);
            });

        // Сортировка таблицы
        document
            .querySelectorAll('#requestsTable th[data-sort]')
            .forEach((th) => {
                th.addEventListener('click', () =>
                    this.sortTable(th.dataset.sort)
                );
            });

        // Экспорт
        document.getElementById('exportStats').addEventListener('click', () => {
            this.exportStats();
        });

        // Кастомные даты
        document.getElementById('dateFrom').addEventListener('change', (e) => {
            this.filters.dateFrom = e.target.value;
        });

        document.getElementById('dateTo').addEventListener('change', (e) => {
            this.filters.dateTo = e.target.value;
        });

        // Сортировка через select
        document.getElementById('tableSort').addEventListener('change', (e) => {
            const value = e.target.value;
            const sortMap = {
                newest: { field: 'created_at', direction: 'desc' },
                oldest: { field: 'created_at', direction: 'asc' },
                type: { field: 'type', direction: 'asc' },
                status: { field: 'status', direction: 'asc' },
            };

            this.currentSort = sortMap[value] || {
                field: 'created_at',
                direction: 'desc',
            };
            this.applyFilters();
        });
    }

    initCharts() {
        this.requestsCanvas = document.getElementById('requestsChart');
        this.typesCanvas = document.getElementById('typesChart');
    }

    // ... остальные методы класса (loadStats, updateCharts, drawLineChart, drawPieChart и т.д.)
}
