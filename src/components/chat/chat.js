import { SERVER_API } from '../config.js';

class Auth {
  // Функция для получения токена из cookies
  /**
   * Функция для выхода из системы (logout)
   * @returns {Promise<Object>} Результат операции
   */
  async logout() {
    try {
      const response = await fetch('http://localhost:8080/api/v1/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Добавьте здесь заголовок авторизации, если требуется
          // 'Authorization': 'Bearer ' + token
        },
        credentials: 'include', // Важно для работы с cookie
      });

      if (response.ok) {
        console.log('Logout successful');
        return { success: true, message: 'Logout successful' };
      } else if (response.status === 401) {
        const errorData = await response.json();
        throw new Error(`Неавторизованный доступ: ${errorData.message}`);
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
