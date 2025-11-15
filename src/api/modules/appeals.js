import { SERVER_API } from '../config.js';
/**
 * Получить статистику обращений
 * @param {Object} params - Параметры запроса (start_date, end_date)
 * @returns {Promise<Response>}
 */
export async function getAppealStats(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.start_date) {
        queryParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
        queryParams.append('end_date', params.end_date);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/appeal/stats?${queryString}` : '/appeal/stats';

    return fetch(`${SERVER_API}${url}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
