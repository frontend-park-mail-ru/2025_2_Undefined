/**
 * Базовый URL для API сервера
 * @type {string}
 */
const API_BASE = `${location.origin}/api/v1`;

/**
 * Внутренняя утилита запроса
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object|null} [data=null]
 * @param {boolean} [needsAuth=true]
 * @returns {Promise<any>}
 */
async function request(url, method = 'GET', data = null, needsAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (needsAuth && ['POST', 'PATCH', 'DELETE'].includes(method)) {
        const csrfToken = localStorage.getItem('csrf_token');
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        } else {
            console.warn('[API] CSRF-токен отсутствует в localStorage. Запрос может быть отклонён.');
        }
    }

    const config = {
        method,
        headers,
        credentials: 'include',
        mode: 'cors'
    };

    if (data !== null && data !== undefined) {
        config.body = JSON.stringify(data);
    }

    const res = await fetch(`${API_BASE}${url}`, config);

    let body = null;
    const contentType = res.headers.get('content-type');
    try {
        if (contentType?.includes('application/json')) {
            body = await res.json();
        } else {
            body = await res.text();
        }
    } catch (e) {
        body = null;
    }

    // Обновляем CSRF, если сервер прислал новый
    const newCsrf = res.headers.get('X-CSRF-Token');
    if (newCsrf) {
        localStorage.setItem('csrf_token', newCsrf);
    }

    if (!res.ok) {
        const error = new Error(body?.message || `HTTP ${res.status}`);
        error.status = res.status;
        error.data = body;
        throw error;
    }

    return body;
}

// ========================
//   Авторизованные обращения
// ========================

export const appealsApi = {
    async list() {
        return request('/appeal/all');
    },

    async getById(id) {
        if (!id) throw new Error('ID is required');
        return request(`/appeal/${id}`);
    },

    async create(data) {
        return request('/appeal', 'POST', data, true);
    },

    async update(data) {
        return request('/appeal', 'PATCH', data, true);
    },

    async addMessage(data) {
        return request('/appeal/message', 'POST', data, true);
    },

    async listForSupport({ limit, offset } = {}) {
        const params = new URLSearchParams();
        if (limit != null) params.append('limit', limit);
        if (offset != null) params.append('offset', offset);
        return request(`/appeal/support?${params}`);
    }
};

// ========================
//   Анонимные обращения
// ========================

export const anonymousAppealsApi = {
    async list(anonym_id) {
        if (!anonym_id) throw new Error('anonym_id is required');
        const params = new URLSearchParams({ anonym_id });
        return request(`/public/appeal?${params}`, 'GET', null, false);
    },

    async create(data) {
        return request('/public/appeal', 'POST', data, false);
    },

    async addMessage(data) {
        return request('/public/appeal/message', 'POST', data, false);
    }
};

// Утилиты (если нужно)
export function setCsrfToken(token) {
    localStorage.setItem('csrf_token', token);
}

export function getCsrfToken() {
    return localStorage.getItem('csrf_token');
}