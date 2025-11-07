// import { SERVER_API } from '../config.js';
import Chat from '@api/modules/chats.js'
import {getPlaceholder} from '@components/avatar/avatar.js'

class Auth {
    // Функция для получения токена из cookies
    /**
     * Функция для выхода из системы (logout)
     * @returns {Promise<Object>} Результат операции
     */
    async logout() {
        try {
            const response = await fetch(
                'http://localhost:8080/api/v1/logout',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Добавьте здесь заголовок авторизации, если требуется
                        // 'Authorization': 'Bearer ' + token
                    },
                    credentials: 'include', // Важно для работы с cookie
                }
            );

            if (response.ok) {
                console.log('Logout successful');
                return { success: true, message: 'Logout successful' };
            } else if (response.status === 401) {
                const errorData = await response.json();
                throw new Error(
                    `Неавторизованный доступ: ${errorData.message}`
                );
            } else {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
export default new Auth();



export async function openChat(HomeData, homeInstance) {
    console.log('HomeData: ', HomeData)
    const chat = document.querySelectorAll('.chat-item');
    chat.forEach(item => {
        item.addEventListener('click',async () => {
            const clickedItem = event.target.closest('.chat-item');
            if(clickedItem) {
                const chat = await Chat.getChat(clickedItem.dataset.chatId);
                console.log('Инфа о нажатом чате',chat);
                HomeData.chatName = chat.name;
                HomeData.placeholder = getPlaceholder(HomeData.chatName);
                homeInstance.renderChat(HomeData, chat.id, chat.messages);
            }
        })
    })
}

