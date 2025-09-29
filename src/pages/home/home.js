import HomeTemplate from './home.hbs';
import Auth from '../../api/modules/auth.js';
import Chat from '../../api/modules/chats.js';
import User from '../../api/modules/user.js';

export class Home {
  #parent;

  constructor(parent) {
    this.#parent = parent;
  }

  /**
   * Преобразует дату created_at в человеческий формат
   * @param {string} dateString - Дата в строковом формате из API
   * @returns {string} Дата в человеческом формате
   */
  formatMessageDate(dateString) {
    if (!dateString) {
      return 'Дата не указана';
    }

    const date = new Date(dateString);

    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      return 'Неверный формат даты';
    }

    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Сегодня
    if (diffInDays === 0) {
      if (diffInMinutes < 1) {
        return 'только что';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} мин. назад`;
      } else {
        return `${diffInHours} ч. назад`;
      }
    }
    // Вчера
    else if (diffInDays === 1) {
      return `вчера в ${date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    // В течение недели
    else if (diffInDays < 7) {
      return `${diffInDays} дн. назад`;
    }
    // Более недели назад
    else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  /**
   * Получает первую букву из имени чата для placeholder
   * @param {string} name - Название чата
   * @returns {string} Первая буква в верхнем регистре или заглушка
   */
  getChatPlaceholder(name) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return '?';
    }

    const trimmedName = name.trim();
    const firstChar = trimmedName.charAt(0).toUpperCase();

    // Проверяем, является ли символ буквой (кириллица или латиница)
    if (/[a-zA-Zа-яА-Я]/.test(firstChar)) {
      return firstChar;
    } else {
      return '?';
    }
  }

  /**
   * Обрабатывает список чатов, преобразуя даты последних сообщений
   * @param {Array} chats - Массив чатов из API
   * @returns {Array} Обработанный массив чатов с человеческими датами
   */
  processChats(chats) {
    if (!Array.isArray(chats)) {
      console.error('Ожидался массив чатов');
      return [];
    }

    return chats.map((chat) => {
      if (chat.last_message && chat.last_message.created_at) {
        // Создаем копию, чтобы не мутировать исходные данные
        const processedChat = { ...chat };
        processedChat.last_message = {
          ...chat.last_message,
          created_at_formatted: this.formatMessageDate(chat.last_message.created_at),
          created_at_original: chat.last_message.created_at, // сохраняем оригинальную дату
        };
        processedChat.placeholder = this.getChatPlaceholder(chat.name);
        return processedChat;
      }
      return chat;
    });
  }

  /**
   * Получает данные текущего пользователя
   * @returns {Promise<Object>} Данные пользователя
   */
  async getCurrentUser() {
    try {
      const response = await User.getMe();

      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        throw new Error(`Ошибка получения данных пользователя: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return null;
    }
  }

  signOut() {
    Auth.logout().then((result) => {
      if (result.success) {
        console.log('Успешный выход');
        // Перенаправить на страницу логина или обновить состояние приложения
      } else {
        console.error('Ошибка выхода:', result.error);
      }
    });
  }

  async render() {
    const HomeData = {};

    try {
      // Получаем данные пользователя
      const userData = await this.getCurrentUser();
      if (userData) {
        HomeData.user = userData;

        // Добавляем placeholder для аватара пользователя
        HomeData.user.placeholder = this.getChatPlaceholder(userData.name || userData.username);
      }

      // Получаем список чатов
      const response = await Chat.getChats();

      if (response.ok) {
        const chats = await response.json();
        HomeData.chats = this.processChats(chats);

        // Рендерим шаблон с данными
        this.#parent.innerHTML = HomeTemplate(HomeData);

        // Добавляем обработчик выхода
        const signOutButton = this.#parent.querySelector('#signOut');
        if (signOutButton) {
          signOutButton.addEventListener('click', () => this.signOut());
        }
      } else {
        throw new Error(`Ошибка получения чатов: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка при рендеринге домашней страницы:', error);

      // Рендерим шаблон с ошибкой
      HomeData.error = 'Не удалось загрузить данные';
      this.#parent.innerHTML = HomeTemplate(HomeData);
    }
  }
  createChats(chats) {
    return chats || [];
  }
}
