import React, { useState, useEffect, useRef } from 'minireact';
import ReactDOM from 'minireact-dom';
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

import '@components/menu-of-chat/menu-of-chat.css';
import '@components/profile/profile.css';
import '@/components/add-contact/add-contact.css';
import '@/components/contact/contact.css';
import '@/components/new-chat-menu/new-chat-menu.css';
import '@/components/input-message/input-message.css';
import '@components/message/message.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openChatId, setOpenChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(app.user || {});
  const parentRef = useRef(null);
  const addButtonRef = useRef(null);

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

  const processChats = (chatsData) => {
    if (!Array.isArray(chatsData)) return [];
    return chatsData.map((chat) => ({
      ...chat,
      last_message: chat.last_message && chat.last_message.created_at
        ? { ...chat.last_message, created_at_formatted: formatMessageDate(chat.last_message.created_at) }
        : null,
      placeholder: getPlaceholder(chat.name || ''),
    }));
  };

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

  const signOut = () => {
    logoutUser().then(() => {
      app.user = null;
      const router = getRouter();
      router.navigateTo('/login');
    });
  };

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

  const initAddButton = () => {
    const btn = addButtonRef.current;
    if (!btn) return;
    if (activeTab === 'chats') new startNewChat(btn, null, { chats: chats || [] });
    else if (activeTab === 'contacts') new AddContactButton(btn, null);
  };

  useEffect(() => {
    fetchUser();
    fetchChats();
    fetchContacts();
    initWebSocket();
  }, []);

  return (
    <div className="home" ref={parentRef}>
      <div className="header">
        <div className="header-wrapper">
          <div className="left-column">
            {activeTab === 'chats' && <i className="icon menu-icon" id="menuBtn"></i>}
            {activeTab === 'contacts' && <i className="icon menu-icon" id="backBtn"></i>}
            <div className="search-wrapper">
              <i className="search-icon"></i>
              <input className="search" type="text" placeholder="Поиск" />
            </div>
            {activeTab === 'profile' && (
              <button className="button action-button" dataAction="close-menu">
                <i className="icon leftArrow-icon"></i>
              </button>
            )}
          </div>

          <div className="middle-column">
            {isChatOpen && (
              <div className="contact-item" id="nameOfChat" data-contact-id={openChatId || ''}>
                <div className="contact-avatar">{null}</div>
                <div className="contact-info">
                  <div className="contact-name">Chat Name</div>
                </div>
              </div>
            )}
          </div>

          <div className="right-column">
            <div className="user-header">
              <div className="user-info">
                <div className="user-details">
                  <div className="user-name">{user?.name || ''}</div>
                </div>
                <div className="avatar">{null}</div>
              </div>
            </div>
            <div className="signOut-btn" onClick={signOut}>
              <i className="signOut-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="content-left-column">
          {activeTab === 'chats' && (
            <div>
              {Array.isArray(chats) && chats.length > 0 ? (
                <div className="items-list-scrollable">
                  {chats.map((chat) => (
                    <div key={chat.id || Math.random()} className="chat-item">{chat.name || 'Без названия'}</div>
                  ))}
                </div>
              ) : (
                <div className="hasNoItems"><p>У вас пока нет чатов</p></div>
              )}
              <div className="newChatButton" ref={addButtonRef}></div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              {Array.isArray(contacts) && contacts.length > 0 ? (
                <div className="items-list-scrollable">
                  {contacts.map((contact) => (
                    <div key={contact.id || Math.random()} className="contact-item">{contact.name || 'Без имени'}</div>
                  ))}
                </div>
              ) : (
                <div className="hasNoItems"><p>У вас пока нет контактов</p></div>
              )}
              <div className="newContactButton" ref={addButtonRef}></div>
            </div>
          )}

          {activeTab === 'profile' && <div className="profile">{null}</div>}
        </div>

        <div className="content-middle-column">
          {isChatOpen && (
            <div className="content-middle-column-center">
              <div className="content-middle-column-center-messages">
                {Array.isArray(messages) && messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.isMine ? 'mine' : ''}`}>
                    {msg.text || ''}
                  </div>
                ))}
              </div>
              <div className="content-middle-column-center-input">{null}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
