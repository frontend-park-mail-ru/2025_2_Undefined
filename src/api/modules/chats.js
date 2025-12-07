import { SERVER_API } from '../config.js';
import { sendPOSTRequest } from './server.js';

class Chat {
    // Функция для получения токена из cookies
    getToken() {
        const name = 'token='; // или другое имя вашего токена
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    async getChats() {
        const token = this.getToken();
        const response = await fetch(`${SERVER_API}chats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
        });
        const chats = await response.json();
        return chats;
    }

    async createChat(data) {
        try {
            const response = await sendPOSTRequest('/chats', {
                members: data.members,
                name: data.name,
                type: data.type,
            })

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message || 'Ошибка создания чата');
                error.errors = errorData.errors;
                throw error;
            }

            console.log(response)
            const dataOfResponse = await response.json();
            console.log(dataOfResponse)
            return dataOfResponse;
        } catch (error) {
            console.error('Ошибка при создании чата' + error);
        }

    }

    async getChat(chatId) {
        try {
            const response = await fetch(`${SERVER_API}chats/${chatId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message || 'Ошибка получения чата');
                error.errors = errorData.errors;
                throw error;
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Ошибка при получении диалога' + error);
        }
    }

    async getChatByContact(contactId) {
        const response = await fetch(`${SERVER_API}chats/dialog/${contactId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка получения чата');
            error.errors = errorData.errors;
            throw error;
        }

        const data = await response.json();
        return data;

    }

    async deleteChat(chatId) {

        try {
            const csrfToken = localStorage.getItem('csrf_token');
            if (!csrfToken) {
                console.warn('CSRF-токен отсутствует. Запрос может быть отклонён.');
            }

            const response = await fetch(`${SERVER_API}chats/${chatId}`, {
                method: 'DELETE',
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
        } catch (error) {
            console.error(error);
        }


    }


    async addToGroup(members, chatId) {

        try {
            const csrfToken = localStorage.getItem('csrf_token');
            if (!csrfToken) {
                console.warn('CSRF-токен отсутствует. Запрос может быть отклонён.');
            }

            const response = await fetch(`${SERVER_API}chats/${chatId}/members`, {
                method: 'PATCH',
                body: JSON.stringify(members),
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
        } catch (error) {
            console.error(error);
        }


    }

    async editChat(chatId, dataOfChat) {
        try {
            const csrfToken = localStorage.getItem('csrf_token');
            if (!csrfToken) {
                console.warn('CSRF-токен отсутствует. Запрос может быть отклонён.');
            }

            const response = await fetch(`${SERVER_API}chats/${chatId}`, {
                method: 'PATCH',
                body: JSON.stringify(dataOfChat),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message || 'Ошибка изменения чата');
                error.errors = errorData.errors;
                throw error;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async getMessages (chatId, offset) {
        const response = await fetch(`${SERVER_API}chats/${chatId}/messages?offset=${offset}&limit=20`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка получения сообщений');
            error.errors = errorData.errors;
            throw error;
        }

        const data = await response.json();
        return data;
    }
}

export default new Chat();
