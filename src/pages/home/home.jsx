import React, { useState, useEffect, useRef } from 'minireact';
import { logoutUser } from '@api/modules/auth.js';
import Chat from '@api/modules/chats.js';
import { getContacts } from '@api/modules/contacts.js';
import User from '@api/modules/user.js';
import { initWebSocket } from '@api/modules/websocket.js';
import { AddContactButton } from '@components/add-contact-btn/add-contact-btn';
import { getPlaceholder } from '@components/avatar/avatar.js';
import { startNewDialog } from '@components/contact/contact';
import { startNewChat } from '@/components/action-button/action-button';
import { openChat } from '@/components/chat/chat';
import { inputMessage } from '@/components/input-message/input-message';
import { app } from '@/main.js';
import { getRouter } from '@/router/router.js';
import { ContextMenu } from '@components/context-menu/context-menu.jsx';
import { ActionButton } from '@components/action-button/action-button.jsx'
import { Button } from '@components/button/button.jsx';

import '@components/menu-of-chat/menu-of-chat.css';
import '@components/profile/profile.css';
import '@components/add-contact/add-contact.css';
import '@components/contact/contact.css';
import '@components/new-chat-menu/new-chat-menu.css';
import '@components/input-message/input-message.css';
import '@components/message/message.css';
import '@components/context-menu/context-menu.css';
import '@components/button/button.css';

const Home = () => {
  /* ===============================
     СТЕЙТЫ
  =============================== */
  const [activeTab, setActiveTab] = useState('chats');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openChatId, setOpenChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(app.user || {});
  const [search, setSearch] = useState('');

  const parentRef = useRef(null);
  const addButtonRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuNewChatButtonRef = useRef(null);
  const menuRef = useRef(null);

  const [menuState, setMenuState] = useState({
    visible: false,
    position: { x: 0, y: 0 }
  })

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
      placeholder: getPlaceholder(chat.name || ''),
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
            placeholder: c.contact?.placeholder || getPlaceholder(c.contact?.name || ''),
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
     ИНИЦИАЛИЗАЦИЯ КНОПКИ ДОБАВЛЕНИЯ
  =============================== */
  const initAddButton = () => {
    const btn = addButtonRef.current;
    if (!btn) return;

    if (activeTab === 'chats') {
      new startNewChat(btn, null, { chats: chats || [] });
    } else if (activeTab === 'contacts') {
      new AddContactButton(btn, null);
    }
  };

  /* ===============================
     КОНТЕКСТНОЕ МЕНЮ
  =============================== */
  const handleMenuClick = () => {
    if (!menuButtonRef.current) return;
    const rect = menuButtonRef.current.getBoundingClientRect();
    setMenuState(prev => ({
      visible: !prev.visible,
      position: { x: rect.left, y: rect.bottom }
    }))

  };

  const handleClickOutside = (e) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      !menuButtonRef.current.contains(e.target) &&
      !menuNewChatButtonRef.current.contains(e.target)
    ) {
      console.log(menuButtonRef.current.contains(e.target))
      setMenuState({
        visible: false,
        position: { x: 0, y: 0 }
      })
    }
  };

  useEffect(() => {
    fetchUser();
    fetchChats();
    fetchContacts();
    initWebSocket();
    initAddButton();

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNewChatMenuClick = () => {
    console.log(menuNewChatButtonRef.current)
    if (!menuNewChatButtonRef.current) return;
    const rect = menuNewChatButtonRef.current.getBoundingClientRect();
    console.log(rect.left)
    setMenuState(prev => ({
      visible: !prev.visible,
      position: { x: rect.left, y: rect.bottom }
    }))
  };

  /* ===============================
     ЭЛЕМЕНТЫ МЕНЮ
  =============================== */
  const menuItems = [
    { text: 'Профиль', icon: '/icons/trash.svg', danger: false, onClick: () => alert('Профиль') },
    { text: 'Контакты', icon: '/icons/edit.svg', danger: false, onClick: () => alert('Контакты') },
  ];

  /* ===============================
     JSX
  =============================== */
  return (
    <div class="home">
      <div class="sidebar-left">
        <div class="sidebar-top">
          {/* Бургер-кнопка */}
          <Button
            variant="secondary"
            icon="menu"
            iconOnly
            onClick={handleMenuClick}
            ref={menuButtonRef}
            className="sidebar-menu-btn"
          />

          {/* Поиск */}
          <div class="search-wrapper">
            <div class="search-icon" style={{ backgroundImage: "url('./icons/search.svg')" }}></div>
            <input
              class="search-input"
              placeholder="Поиск…"
              value={search}
              onInput={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Контекстное меню */}
        {menuState.visible && (
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuState.position.y + 'px',
              left: menuState.position.x + 'px',
              zIndex: 1000,
            }}
          >
            <ContextMenu items={menuItems} />
          </div>
        )}

        {/* Контент */}
        <div class="sidebar-content">
          {/* Можно вставлять другие компоненты */}
          <div class='actionButton-wrapper'>
            <Button
              icon="edit"
              iconOnly
              onClick={handleNewChatMenuClick}
              ref={menuNewChatButtonRef}
              variant="primary"
              size="lg"
            />
          </div>
        </div>
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
