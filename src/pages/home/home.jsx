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
import { getRouter } from '@/router/router.jsx';
import { LeftSidebar } from '@components/leftSidebar/leftSidebar.jsx';
import { InputMessage } from '@components/input-message/inputMessage.jsx';
import { GroupInfoModal } from '@components/modalView/modalView';
import { EditGroupModal } from '@components/modalView/modalEdit';
import { ContextMenu } from '@components/context-menu/context-menu.jsx';
import { Message } from '@components/message/message';
import { getWebSocket } from '@api/modules/websocket';
import { fetchUser as apiFetchUser } from '../login/login.jsx';
import { smiles, stickers } from '@assets/smiles/smiles'

// Стили
import '@components/menu-of-chat/menu-of-chat.css';
import '@components/profile/profile.css';
import '@components/add-contact/add-contact.css';
import '@components/contact/contact.css';
import '@components/new-chat-menu/new-chat-menu.css';
import '@components/input-message/input-message.css';
import '@components/message/message.css';
import '@components/context-menu/context-menu.css';
import '@components/modalView/modalView.css';
import '@components/modalView/modalEdit.css';

const Home = ({ apiRef }) => {
  /* ===============================
     СТЕЙТЫ
  =============================== */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openChatId, setOpenChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(app.user || {});
  const [chatData, setChatData] = useState(null);
  const [infoModal, setInfoModal] = useState(false);
  const [editInfoModal, setEditInfoModal] = useState(false);
  const [contactsFor, setContactsFor] = useState('dialog');
  const [selectedMessage, setSelectedMessage] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [textOfEdit, setTextOfEdit] = useState('');
  const [updateChats, setUpdateChats] = useState(0);

  // 🔍 Поиск сообщений
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  // Меню — унифицированный стейт, как в LeftSidebar
  const [menus, setMenus] = useState({
    meatballs: { visible: false, position: { x: 0, y: 0 } },
    message: { visible: false, position: { x: 0, y: 0 } }
  });

  const parentRef = useRef(null);
  const addButtonRef = useRef(null);
  const meatballsButtonRef = useRef(null);
  const meatballsMenuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
  const messageBoxRef = useRef(null);
  const messagesRef = useRef(null);

  const openChatIdRef = useRef(openChatId);
  const menusRef = useRef(menus);
  const offset = useRef(0);
  menusRef.current = menus;
  const chatDataRef = useRef(null);

  const [notificationStatus, setNotificationStatus] = useState('default');

  useEffect(() => {
    const checkPermission = () => {
      if (!('Notification' in window)) {
        setNotificationStatus('unsupported');
        return;
      }
      if (Notification.permission === 'granted') {
        setNotificationStatus('granted');
      } else if (Notification.permission === 'denied') {
        setNotificationStatus('denied');
      }
    };

    checkPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if (notificationStatus !== 'default') return;

    try {
      const result = await Notification.requestPermission();
      setNotificationStatus(result === 'granted' ? 'granted' : 'denied');
    } catch (err) {
      console.error('Ошибка запроса разрешения на уведомления:', err);
      setNotificationStatus('denied');
    }
  };

  /* ===============================
    АВТОСКРОЛЛ К ПОСЛЕДНЕМУ СООБЩЕНИЮ — ТОЛЬКО ПОСЛЕ РЕНДЕРА
  =============================== */
  useEffect(() => {
    if (messages.length === 0) return;

    const id = requestAnimationFrame(() => {
      const el = messagesEndRef.current;
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    });

    return () => cancelAnimationFrame(id);
  }, [messages.length]);

  useEffect(() => {
    openChatIdRef.current = openChatId;
  }, [openChatId]);

  /* ===============================
     ПОДСВЕТКА ТЕКСТА
  =============================== */
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style="background-color: #ffeb3b; color: #000;">{part}</mark>
        : part
    );
  };

  /* ===============================
     ОБРАБОТЧИК ПОИСКА
  =============================== */
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    const results = messages
      .map((msg, index) => ({
        index,
        text: msg.text || '',
        matches: (msg.text || '').toLowerCase().includes(query.toLowerCase()),
      }))
      .filter(item => item.matches);

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0) {
      const el = document.querySelector(`[data-message-index="${results[0].index}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const goToNextResult = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    const el = document.querySelector(`[data-message-index="${searchResults[nextIndex].index}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToPrevResult = () => {
    if (searchResults.length === 0) return;
    const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(prevIndex);
    const el = document.querySelector(`[data-message-index="${searchResults[prevIndex].index}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ===============================
     ФОРМАТИРОВАНИЕ ВРЕМЕНИ СООБЩЕНИЯ
  =============================== */
  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  /* ===============================
     МЕНЮ ПУНКТЫ
  =============================== */
  const meatballsMenuItems = [
    {
      text: 'Добавить участника',
      icon: '/icons/edit.svg',
      danger: false,
      onClick: () => {
        setContactsFor('add');
        setMenus(prev => ({
          ...prev,
          meatballs: { visible: false, position: { x: 0, y: 0 } }
        }));
      }
    },
    {
      text: 'Редактировать',
      icon: '/icons/edit.svg',
      danger: false,
      onClick: () => {
        setEditInfoModal(true);
        setMenus(prev => ({
          ...prev,
          meatballs: { visible: false, position: { x: 0, y: 0 } }
        }));
      }
    },
    {
      text: 'Удалить',
      icon: '/icons/exit.svg',
      danger: true,
      onClick: async () => {
        console.log(openChatId);
        await Chat.deleteChat(openChatId);
        setUpdateChats(prev => prev + 1);
        setIsChatOpen(false);
        setMenus(prev => ({
          ...prev,
          meatballs: { visible: false, position: { x: 0, y: 0 } }
        }));
      }
    }
  ];

  const onMessageClickItems = [
    {
      text: 'Редактировать',
      icon: '/icons/edit.svg',
      danger: false,
      onClick: () => {
        editMessage();
        setMenus(prev => ({
          ...prev,
          message: { visible: false, position: { x: 0, y: 0 } }
        }));
      }
    },
    {
      text: 'Удалить',
      icon: '/icons/trash.svg',
      danger: true,
      onClick: () => {
        deleteMessage();
        setMenus(prev => ({
          ...prev,
          message: { visible: false, position: { x: 0, y: 0 } }
        }));
      }
    }
  ];

  const editMessage = () => {
    setIsEditing(true);
    setTextOfEdit(selectedMessage.text || '');
  };

  const sendEditMessage = async (text) => {
    const ws = getWebSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket не подключён или не готов к отправке');
      return;
    }

    const message = {
      value: {
        id: selectedMessage.id,
        text: text
      },
      chat_id: openChatId,
      type: 'edit_message'
    };

    ws.send(JSON.stringify(message));
    console.log('Сообщение отредактировано и отправлено через WebSocket');
    noEdit();
  };

  const noEdit = () => {
    setIsEditing(false);
    setSelectedMessage({});
  };

  const deleteMessage = async () => {
    const ws = getWebSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket не подключён или не готов к отправке');
      return;
    }

    const message = {
      value: { id: selectedMessage.id },
      chat_id: openChatId,
      type: 'delete_message'
    };

    ws.send(JSON.stringify(message));
    console.log('Сообщение удалено через WebSocket');
  };

  /* ===============================
     ОБРАБОТЧИКИ МЕНЮ
  =============================== */
  const handleMeatballsClick = () => {
    if (!meatballsButtonRef.current) return;

    const rect = meatballsButtonRef.current.getBoundingClientRect();
    setMenus(prev => ({
      meatballs: {
        visible: !prev.meatballs.visible,
        position: { x: rect.left, y: rect.bottom + 4 }
      },
      message: { visible: false, position: { x: 0, y: 0 } }
    }));
  };

  const handleMessageClick = (message) => (event) => {
    event.stopPropagation();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    setMenus(prev => ({
      meatballs: { visible: false, position: { x: 0, y: 0 } },
      message: {
        visible: true,
        position: { x: mouseX, y: mouseY }
      }
    }));
    setSelectedMessage(message);
  };

  /* ===============================
     КЛИК ВНЕ МЕНЮ
  =============================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      const current = menusRef.current;

      let closeMeatballs = false;
      let closeMessage = false;

      if (current.meatballs.visible) {
        if (
          meatballsMenuRef.current &&
          meatballsButtonRef.current &&
          !meatballsMenuRef.current.contains(e.target) &&
          !meatballsButtonRef.current.contains(e.target)
        ) {
          closeMeatballs = true;
        }
      }

      if (current.message.visible) {
        if (!e.target.closest('.ContextMenu') && !e.target.closest('.message')) {
          closeMessage = true;
        }
      }

      if (closeMeatballs || closeMessage) {
        setMenus({
          meatballs: closeMeatballs
            ? { visible: false, position: { x: 0, y: 0 } }
            : current.meatballs,
          message: closeMessage
            ? { visible: false, position: { x: 0, y: 0 } }
            : current.message
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* ===============================
     ФОРМАТИРОВАНИЕ ДАТЫ
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
     ЗАПРОС ПОЛЬЗОВАТЕЛЯ
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

  /* ===============================
     ВЫХОД
  =============================== */
  const signOut = async () => {
    logoutUser();
    await apiFetchUser();
    checkAuth();
  };

  /* ===============================
     ОТКРЫТЬ ЧАТ
  =============================== */
  const openChatHandler = async (chatId) => {
    const prevContainer = messageBoxRef.current;
    if (prevContainer && prevContainer.__homeScrollHandler) {
      prevContainer.removeEventListener('scroll', prevContainer.__homeScrollHandler);
      prevContainer.__homeScrollHandler = null;
    }

    offset.current = 0;

    setOpenChatId(chatId);
    setIsChatOpen(true);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentResultIndex(-1);

    try {
      const response = await Chat.getChat(chatId);
      console.log(response)
      setChatData(response);
      chatDataRef.current = response;

      if (response && Array.isArray(response.messages)) {
        const processedMessages = response.messages.reverse().map((m) => ({
          ...m,
          isMine: response.type !== 'channel' && m.sender_id === app.user?.id,
          isSystem: m.type === 'system',
        }));
        setMessages(processedMessages);
        messagesRef.current = processedMessages;
      } else {
        setMessages([]);
        messagesRef.current = [];
      }
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
      setChatData(null);
      setMessages([]);
      messagesRef.current = [];
    }

    const handleScroll = () => {
      const container = messageBoxRef.current;
      if (!container) return;

      if (container.scrollTop === 0 && !container.__loading) {
        container.__loading = true;
        loadMessages()
          .finally(() => {
            container.__loading = false;
          });
      }
    };

    const container = messageBoxRef.current;
    if (container) {
      container.__homeScrollHandler = handleScroll;
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    getRouter().navigateTo(`/chat/${chatId}`);
  };

  const getOpenChatId = () => openChatId;

  useEffect(() => {
    if (apiRef) {
      apiRef.current = { openChat: openChatHandler };
    }
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [openChatHandler]);

  const showNotification = (msg) => {
    console.log('уведомление')
    let senderName = msg.sender_name || 'Новый чат';
    let title = senderName;

    const chat = chats.find(c => c.id === msg.chat_id);
    if (chat && chat.type !== 'dialog') {
      title = chat.name || 'Группа';
    }

    const notification = new Notification(title, {
      body: msg.text || '📎 Вложение',
      icon: msg.attachment?.file_url || '/icons/logo-64.png',
      tag: `msg-${msg.id}`,
      renotify: true,
    });

    notification.onclick = () => {
      window.focus();
      openChatHandler(msg.chat_id);
      notification.close();
    };

  };

  /* ===============================
     ✅ ВЕБ-СОКЕТ — УМНЫЙ АВТОСКРОЛЛ
  =============================== */
  useEffect(() => {
    initWebSocket();
    const globalWs = getWebSocket();

    if (!globalWs) {
      console.warn('WebSocket not available');
      return;
    }

    const addNewMessage = (newMessage) => {
      setUpdateChats(prev => prev + 1);
      setMessages((prevMessages) => {
        if (newMessage.chat_id !== openChatIdRef.current) return prevMessages;
        if (prevMessages.some((msg) => msg.id === newMessage.id)) return prevMessages;

        newMessage.isSystem = newMessage.type === 'system';
        newMessage.typeOfAttachment = newMessage.attachment?.type;
        newMessage.isMine = chatDataRef.current?.type !== 'channel' && newMessage.sender_id === app.user?.id;

        if (newMessage.typeOfAttachment === 'sticker') {
          console.log(newMessage.attachment?.file_url)
          newMessage.attachment = {
            file_url: stickers[newMessage.attachment?.file_url].src,
            type: 'sticker'
          }
        }

        if (newMessage.typeOfAttachment === 'image') {
          console.log(newMessage.attachment?.file_url)
          newMessage.attachment = {
            file_url: newMessage.attachment?.file_url,
            type: 'image'
          }
        }
        messagesRef.current = [...prevMessages, newMessage];
        return [...prevMessages, newMessage];
      });

      return newMessage.isMine;
    };

    const deleteMessageLocally = (messageId) => {
      setUpdateChats(prev => prev + 1);
      setMessages((prev) => {
        const next = prev.filter((msg) => msg.id !== messageId);
        messagesRef.current = next;
        return next;
      });
    };

    const updateMessageLocally = (updatedMessage) => {
      setMessages((prev) => {
        const next = prev.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
        );
        messagesRef.current = next;
        return next;
      });
    };

    const handleMessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (e) {
        console.warn('Невалидное WS-сообщение:', event.data);
        return;
      }

      console.log('сообщение пришло', message)

      switch (message.type) {
        case 'new_message': {
          const container = messageBoxRef.current;
          const wasAtBottom = container
            ? container.scrollHeight - container.scrollTop <= container.clientHeight + 100
            : false;

          if (message.attachment) {
            console.log('atta')
          }
          console.log(message.value)

          const isNewChat = message.chat_id !== openChatIdRef.current;

          const isMine = addNewMessage(message.value);

          if (!isMine && isNewChat) {
            console.log('уведоммление')
            showNotification(message.value);
          }

          if (isMine || wasAtBottom) {
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
              });
            });
          }
          break;
        }
        case 'delete_message':
          deleteMessageLocally(message.value.id);
          break;
        case 'edit_message':
          updateMessageLocally(message.value);
          break;
        default:
          console.log('Неизвестный тип:', message.type);
      }
    };

    globalWs.addEventListener('message', handleMessage);

    return () => {
      globalWs.removeEventListener('message', handleMessage);
    };
  }, []);

  /* ===============================
     ПОДГРУЗКА СООБЩЕНИЙ
  =============================== */
  const loadMessages = async () => {
    const container = messageBoxRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const currentScrollHeight = container.scrollHeight;

    offset.current = messagesRef.current.length;
    console.log('offset:', offset.current)
    console.log(messagesRef.current)
    try {
      const newMessages = await Chat.getMessages(openChatIdRef.current, offset.current);
      // if (newMessages.length === 0) {
      //   offset.current -= 20
      //   return;
      // }
      setMessages(prev => {
        const processed = newMessages.map(m => ({
          ...m,
          isSystem: m.type === 'system',
          isMine: chatDataRef.current?.type !== 'channel' && m.sender_id === app.user?.id,
        }));
        messagesRef.current = [...processed, ...prev]
        return [...processed, ...prev];
      });

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const heightDiff = newScrollHeight - currentScrollHeight;
        container.scrollTop = currentScrollTop + heightDiff;
      });
    } catch (err) {
      console.error('Ошибка подгрузки сообщений:', err);
      // offset.current -= 20;
    }
  };

  /* ===============================
     JSX
  =============================== */
  return (
    <div class="home">
      <div style="width:25%;">
        <LeftSidebar
          onChatOpen={openChatHandler}
          getOpenChatId={getOpenChatId}
          contactsFor={contactsFor}
          changeContactsFor={() => setContactsFor('dialog')}
          updateChats={updateChats}
        />
      </div>

      {isChatOpen && (
        <div class="main-panel">
          <div
            class="header"
            onClick={() => {
              requestNotificationPermission();
              setInfoModal(true)
            }}
            style="cursor: pointer;"
          >
            <div class="header-wrapper" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {chatData ? chatData.name || `Чат ${openChatId}` : ''}
              </div>

              <div style="flex: 2; display: flex; align-items: center; justify-content: center; margin: 0 16px;">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    background: #f0f0f0;
                    border-radius: 16px;
                    padding: 4px 8px;
                    width: 100%;
                    max-width: 300px;
                  "
                >
                  <span
                    class="icon"
                    style="
                      width: 16px;
                      height: 16px;
                      background-image: url('/icons/search.svg');
                      background-size: contain;
                      background-repeat: no-repeat;
                      opacity: 0.6;
                      margin-right: 6px;
                    "
                  ></span>
                  <div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onInput={(e) => handleSearch(e.target.value)}
                      placeholder="Поиск в чате..."
                      onClick={(ev) => ev.stopPropagation()}
                      style="
                      border: none;
                      background: transparent;
                      outline: none;
                      width: 100%;
                      font-size: 14px;
                      padding: 4px 0;
                    "
                    />
                  </div>
                </div>
              </div>

              <div
                class="meatballs-div"
                ref={meatballsButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMeatballsClick();
                }}
                style="width: 24px; height: 24px; cursor: pointer;"
              >
                <i class="icon meatballs-icon"></i>
              </div>
            </div>
          </div>

          <div class="content">
            <div class="content-center">
              <div
                class="content-center-messages"
                ref={messageBoxRef}
              >
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      class='message-body'
                      key={message.id || index}
                      data-message-index={index}
                      style={searchResults.some(r => r.index === index) && currentResultIndex === searchResults.findIndex(r => r.index === index)
                        ? { backgroundColor: '#fff9c4', borderRadius: '8px', padding: '4px 8px' }
                        : {}
                      }
                    >
                      <Message
                        key={message.id || index}
                        id={message.id || index}
                        isSystem={message.isSystem}
                        isMine={message.isMine}
                        text={highlightText(message.text || '', searchQuery)}
                        time={formatMessageTime(message.created_at)}
                        onMessageClick={handleMessageClick(message)}
                        isUpdated={message.updated_at}
                        attachment={message.attachment}
                      />
                    </div>
                  ))
                ) : (
                  <div class="no-messages">
                    <p>Нет сообщений</p>
                    <p>Начните общение первым!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div class="content-center-inputMessage">
                <InputMessage
                  onSendMessage={() => console.log('Отправлено')}
                  id={openChatId}
                  isEditing={isEditing}
                  textOfEdit={textOfEdit}
                  updateMessage={sendEditMessage}
                  noEdit={noEdit}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {infoModal && (
        <GroupInfoModal
          id={chatData?.id}
          name={chatData?.name}
          description={chatData?.description || ''}
          onClose={() => setInfoModal(false)}
          onSave={() => console.log('Успешно сохранено')}
        />
      )}

      {editInfoModal && (
        <EditGroupModal
          id={chatData?.id}
          name={chatData?.name}
          description={chatData?.description || ''}
          onClose={() => setEditInfoModal(false)}
          onSave={() => {
            setUpdateChats(prev => prev + 1);
            openChatHandler(chatData?.id);
          }}
        />
      )}

      {menus.meatballs.visible && (
        <div
          ref={meatballsMenuRef}
          style={{
            position: 'fixed',
            top: `${menus.meatballs.position.y + 10}px`,
            right: `250px`,
            zIndex: 1000,
          }}
        >
          <ContextMenu items={meatballsMenuItems} />
        </div>
      )}

      {menus.message.visible && (
        <div
          style={{
            position: 'fixed',
            top: `${menus.message.position.y}px`,
            left: `${menus.message.position.x}px`,
            zIndex: 1000,
          }}
        >
          <ContextMenu items={onMessageClickItems} />
        </div>
      )}
    </div>
  );
};

export default Home;