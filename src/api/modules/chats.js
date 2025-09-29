import { SERVER_API } from '../config.js';

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
    return response;
  }
}

export default new Chat();
