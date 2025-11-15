/**
 * Базовый URL для API сервера
 * @type {string}
 */
const SERVER_API = `${location.origin}/api/v1`;

/**
 * Отправляет POST-запрос на сервер
 * @param {string} path - Путь к endpoint API
 * @param {Object} data - Данные для отправки
 * @returns {Promise<Response>} Ответ сервера
 * @throws {Error} Ошибка запроса с дополнительными данными об ошибках
 */
export async function sendPOSTRequest(path, data) {
    try {

        const csrfToken = localStorage.getItem('csrf_token');
        if (!csrfToken) {
            console.warn('CSRF-токен отсутствует. Запрос может быть отклонён.');
        }

        const response = await fetch(SERVER_API + path, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            credentials: 'include',
            mode: 'cors',
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `HTTP error ${response.status}` };
            }
            const error = new Error(errorData.message || 'Ошибка');
            console.log(errorData);
            console.log("SERVER VALIDATION ERRORS:", errorData.errors);
            error.errors = errorData.errors;
            error.statusCode = response.status;

            throw error;
        }

        return response;
    } catch (error) {
        throw error;
    }
}
