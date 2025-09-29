import { SERVER_API } from '../config.js';

class Auth {
  /**
   * Функция для выхода из системы (logout)
   * @returns {Promise<Object>} Результат операции
   */
  async logout() {
    try {
      const response = await fetch(`${SERVER_API}logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
