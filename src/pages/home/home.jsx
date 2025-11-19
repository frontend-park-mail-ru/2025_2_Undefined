// home.jsx
import React, { useState, useEffect, useRef } from 'minireact';
import { logoutUser } from '@api/modules/auth.js';
import Chat from '@api/modules/chats.js';
import { getContacts } from '@api/modules/contacts.js';
import User from '@api/modules/user.js';
import { initWebSocket } from '@api/modules/websocket.js';
import { AddContactButton } from '@components/add-contact-btn/add-contact-btn';
import { startNewDialog } from '@components/contact/contact';
import { startNewChat } from '@/components/action-button/action-button';
import { openChat } from '@/components/chat/chat';
import { inputMessage } from '@/components/input-message/input-message';
import { app } from '@/main.js';
import { getRouter } from '@/router/router.js';
import { LeftSidebar } from '@components/leftSidebar/leftSidebar.jsx';

// Стили (оставлены, т.к. могут влиять на другие части, но можно убрать, если они относятся только к sidebar)
import '@components/menu-of-chat/menu-of-chat.css';
import '@components/profile/profile.css';
import '@components/add-contact/add-contact.css';
import '@components/contact/contact.css';
import '@components/new-chat-menu/new-chat-menu.css';
import '@components/input-message/input-message.css';
import '@components/message/message.css';
import '@components/context-menu/context-menu.css';

const Home = () => {
  /* ===============================
     СТЕЙТЫ (только для основной панели)
  =============================== */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openChatId, setOpenChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(app.user || {});

  const parentRef = useRef(null);
  const addButtonRef = useRef(null);

  /* ===============================
     ПАРСИНГ ДАТЫ
  =============================== */
  const formatMessageDate = (dateString) => {
    if (!dateString) return '';
    const inputDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    const diffDays = Math.floor((inputDay - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return inputDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays >= -6 && diffDays < 0) {
      return inputDate.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
      return inputDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  /* ===============================
     ПОДГОТОВКА ЧАТОВ
  =============================== */
  const processChats = (chatsData) => {
    if (!Array.isArray(chatsData)) return [];
    return chatsData.map((chat) => ({
      ...chat,
      last_message:
        chat.last_message && chat.last_message.created_at
          ? { ...chat.last_message, created_at_formatted: formatMessageDate(chat.last_message.created_at) }
          : null,
    }));
  };

  /* ===============================
     ЗАПРОС ПОЛЬЗОВАТЕЛЯ, ЧАТОВ, КОНТАКТОВ
  =============================== */
  const fetchUser = async () => {
    try {
      const response = await User.getMe();
      if (response.ok) {
        const userData = await response.json();
        setUser(userData || {});
        app.user = userData || {};
      }
    } catch (error) {
      console.error('Ошибка получения пользователя', error);
      setUser({});
    }
  };

  const fetchChats = async () => {
    try {
      const response = await Chat.getChats();
      if (response.ok) {
        const chatsData = await response.json();
        setChats(processChats(chatsData).reverse());
      }
    } catch (error) {
      console.error('Ошибка получения чатов', error);
      setChats([]);
    }
  };

  const fetchContacts = async () => {
    try {
      const contactsData = await getContacts();
      setContacts(
        Array.isArray(contactsData)
          ? contactsData.map((c) => ({
              ...c.contact,
            }))
          : []
      );
    } catch (error) {
      console.error('Ошибка получения контактов', error);
      setContacts([]);
    }
  };

  /* ===============================
     ВЫХОД ИЗ АККАУНТА
  =============================== */
  const signOut = () => {
    logoutUser().then(() => {
      app.user = null;
      const router = getRouter();
      router.navigateTo('/login');
    });
  };

  /* ===============================
     ОТКРЫТЬ ЧАТ
  =============================== */
  const openChatHandler = (chatId, chatMessages = [], isGroup = false) => {
    setOpenChatId(chatId);
    setIsChatOpen(true);
    setMessages(
      Array.isArray(chatMessages)
        ? chatMessages.reverse().map((m) => ({
            ...m,
            isMine: m.sender_id === app.user?.id,
            isSystem: m.type === 'system',
          }))
        : []
    );
  };

  /* ===============================
     ИНИЦИАЛИЗАЦИЯ (только глобальные эффекты)
  =============================== */
  useEffect(() => {
    fetchUser();
    fetchChats();
    fetchContacts();
    initWebSocket();
  }, []);

  /* ===============================
     JSX
  =============================== */
  return (
    <div class="home">
      <div style="width:25%;">
        <LeftSidebar />
      </div>


      <div class="main-panel">
        <div class="header">
          <div class="header-wrapper">
            <div>Заголовок</div>
          </div>
        </div>
        <div class="content">
          {/* Можно вставлять другие компоненты */}
        </div>
      </div>
    </div>
  );
};

export default Home;