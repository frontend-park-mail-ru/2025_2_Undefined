import { SERVER_API } from '../config.js';

class User {
    async getMe() {
        return fetch(`${SERVER_API}me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    }

    async updateMe(updateData) {
        try {
            console.log(updateData)
            const csrfToken = localStorage.getItem('csrf_token');
            if (!csrfToken) {
                console.warn('CSRF-токен отсутствует. Запрос может быть отклонён.');
            }

            const response = await fetch(`${SERVER_API}/me`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message || 'Ошибка удаления чата');
                error.errors = errorData.errors;
                throw error;
            }
        } catch(error) {
            console.error(error);
        }
    }
}

export default new User();
