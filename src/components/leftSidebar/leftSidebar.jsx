import React, { useState, useEffect, useRef } from 'minireact';
import { ContextMenu } from '@components/context-menu/context-menu.jsx';
import { ActionButton } from '@components/action-button/action-button.jsx';
import { ChatItem } from '@components/chat/chat.jsx';
import { ContactItem } from '@components/contact/contact.jsx';
import { getPlaceholder } from '@components/avatar/avatar.js';
import { Form } from '@components/form/form.jsx';
import { getContacts } from '@api/modules/contacts';
import { Profile } from '@components/profile/profile.jsx';
import { EditProfile } from '@components/profile/editProfile.jsx';
import Chat from '@api/modules/chats.js';
import { logoutUser } from '@api/modules/auth';
import { getRouter } from '@/router/router.jsx';

import { fetchUser } from '@/main.jsx';
import { closeWebSocket } from '@api/modules/websocket';

export function LeftSidebar({ onChatOpen, getOpenChatId, contactsFor, changeContactsFor, updateChats }) {
  const [activeTab, setActiveTab] = useState('chats');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formForCreateGroup, setFormForCreateGroup] = useState(false);
  const [formForCreateChannel, setFormForCreateChannel] = useState(false);

  const [menus, setMenus] = useState({
    main: { visible: false, position: { x: 0, y: 0 } },
    newChat: { visible: false, position: { x: 0, y: 0 } },
    exit: { visible: false, position: { x: 0, y: 0 } }
  });

  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);

  const menuButtonRef = useRef(null);
  const menuNewChatButtonRef = useRef(null);
  const menuRef = useRef(null);
  const menuNewChatRef = useRef(null);
  const exitMenuButtonRef = useRef(null);
  const exitMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const menusRef = useRef(menus);
  menusRef.current = menus;

  /* ===============================
     ЭЛЕМЕНТЫ МЕНЮ
  =============================== */
  const menuItems = [
    {
      text: 'Профиль',
      icon: '/icons/trash.svg',
      danger: false,
      onClick: () => {
        setActiveTab('profile');
        setMenus({
          main: { visible: false, position: { x: 0, y: 0 } },
          newChat: { visible: false, position: { x: 0, y: 0 } },
          exit: { visible: false, position: { x: 0, y: 0 } }
        });
      }
    },
    {
      text: 'Контакты',
      icon: '/icons/edit.svg',
      danger: false,
      onClick: () => {
        setActiveTab('contacts');
        setSearch(''); // ← сброс поиска при переходе
        setMenus({
          main: { visible: false, position: { x: 0, y: 0 } },
          newChat: { visible: false, position: { x: 0, y: 0 } },
          exit: { visible: false, position: { x: 0, y: 0 } }
        });
      }
    },
  ];

  const newChatMenuItems = [
    {
      text: 'Создать канал',
      icon: '/icons/trash.svg',
      danger: false,
      onClick: () => {
        setFormForCreateChannel(true);
        setMenus({
          main: { visible: false, position: { x: 0, y: 0 } },
          newChat: { visible: false, position: { x: 0, y: 0 } },
          exit: { visible: false, position: { x: 0, y: 0 } }
        });
      }
    },
    {
      text: 'Создать группу',
      icon: '/icons/edit.svg',
      danger: false,
      onClick: () => {
        setFormForCreateGroup(true);
        setMenus({
          main: { visible: false, position: { x: 0, y: 0 } },
          newChat: { visible: false, position: { x: 0, y: 0 } },
          exit: { visible: false, position: { x: 0, y: 0 } }
        });
      }
    },
    {
      text: 'Начать чат',
      icon: '/icons/edit.svg',
      danger: false,
      onClick: () => {
        setActiveTab('contacts');
        setSearch(''); // ← сброс поиска
        setMenus({
          main: { visible: false, position: { x: 0, y: 0 } },
          newChat: { visible: false, position: { x: 0, y: 0 } },
          exit: { visible: false, position: { x: 0, y: 0 } }
        });
      }
    },
  ];

  const exitMenuItems = [
    {
      text: 'Выйти',
      icon: '/icons/trash.svg',
      danger: true,
      onClick: async () => {
        await logoutUser();
        closeWebSocket();
        setMenus({
          main: { visible: false, position: { x: 0, y: 0 } },
          newChat: { visible: false, position: { x: 0, y: 0 } },
          exit: { visible: false, position: { x: 0, y: 0 } }
        });
        await fetchUser();
        getRouter().navigateTo('/login');

      }
    }
  ];

  /* ===============================
     ОБРАБОТЧИКИ СОБЫТИЙ
  =============================== */
  const handleMenuClick = () => {
    if (!menuButtonRef.current) return;
    const rect = menuButtonRef.current.getBoundingClientRect();
    setMenus((prev) => ({
      main: {
        visible: !prev.main.visible,
        position: { x: rect.left, y: rect.bottom }
      },
      newChat: { visible: false, position: { x: 0, y: 0 } },
      exit: { visible: false, position: { x: 0, y: 0 } }
    }));
  };

  const handleNewChatMenuClick = () => {
    if (!menuNewChatButtonRef.current) return;
    const rect = menuNewChatButtonRef.current.getBoundingClientRect();
    setMenus((prev) => ({
      main: { visible: false, position: { x: 0, y: 0 } },
      newChat: {
        visible: !prev.newChat.visible,
        position: { x: rect.left, y: rect.top }
      },
      exit: { visible: false, position: { x: 0, y: 0 } }
    }));
  };

  const handleExitMenuClick = () => {
    if (!exitMenuButtonRef.current) return;
    const rect = exitMenuButtonRef.current.getBoundingClientRect();
    setMenus((prev) => ({
      main: { visible: false, position: { x: 0, y: 0 } },
      newChat: { visible: false, position: { x: 0, y: 0 } },
      exit: {
        visible: !prev.exit.visible,
        position: { x: rect.left, y: rect.top }
      }
    }));
  };

  /* ===============================
     ЭФФЕКТЫ
  =============================== */
  useEffect(() => {
    // При изменении contactsFor — переключаем вкладку И сбрасываем поиск
    if (contactsFor === 'add') {
      setActiveTab('contacts');
      setSearch('');
    } else if (contactsFor === 'dialog') {
      setActiveTab('chats');
    }
  }, [contactsFor]);

  useEffect(() => {
    loadChats();
  }, [updateChats])

  useEffect(() => {
    const handleClickOutside = (e) => {
      const currentMenus = menusRef.current;
      let shouldCloseMain = false;
      let shouldCloseNewChat = false;
      let shouldCloseExit = false;

      if (currentMenus.main.visible) {
        if (menuRef.current && menuButtonRef.current) {
          shouldCloseMain =
            !menuRef.current.contains(e.target) &&
            !menuButtonRef.current.contains(e.target);
        }
      }

      if (currentMenus.newChat.visible) {
        if (menuNewChatRef.current && menuNewChatButtonRef.current) {
          shouldCloseNewChat =
            !menuNewChatRef.current.contains(e.target) &&
            !menuNewChatButtonRef.current.contains(e.target);
        }
      }

      if (currentMenus.exit.visible) {
        if (exitMenuRef.current && exitMenuButtonRef.current) {
          shouldCloseExit =
            !exitMenuRef.current.contains(e.target) &&
            !exitMenuButtonRef.current.contains(e.target);
        }
      }

      if (shouldCloseMain || shouldCloseNewChat || shouldCloseExit) {
        setMenus({
          main: shouldCloseMain
            ? { visible: false, position: { x: 0, y: 0 } }
            : currentMenus.main,
          newChat: shouldCloseNewChat
            ? { visible: false, position: { x: 0, y: 0 } }
            : currentMenus.newChat,
          exit: shouldCloseExit
            ? { visible: false, position: { x: 0, y: 0 } }
            : currentMenus.exit
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    loadContacts();
    loadChats();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔥 ВОЗВРАТ ФОКУСА В ПОИСК ПОСЛЕ ПЕРЕРЕНДЕРА
  useEffect(() => {
    if (
      searchInputRef.current &&
      (activeTab === 'chats' || activeTab === 'contacts')
    ) {
      const id = requestAnimationFrame(() => {
        searchInputRef.current.focus();
        const len = searchInputRef.current.value.length;
        searchInputRef.current.setSelectionRange(len, len);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [search, activeTab]);

  const loadContacts = async () => {
    try {
      const rawContacts = await getContacts();
      const contactList = Array.isArray(rawContacts) ? rawContacts : [];
      const processedContacts = contactList.map((item) => {
        const name = item.contact.name || '';
        return {
          ...item,
          contact: {
            ...item.contact,
            placeholder: item.contact.placeholder || getPlaceholder(name)
          }
        };
      });
      setContacts(processedContacts);
    } catch (error) {
      console.error('Ошибка загрузки контактов:', error);
    }
  };

const loadChats = async () => {
  try {
    const rawChats = await Chat.getChats();
    const chatList = Array.isArray(rawChats.chats) ? rawChats.chats : [];

    const processedChats = chatList
      .map((item) => {
        const name = item.name || '';
        return {
          ...item,
          placeholder: item.placeholder || getPlaceholder(name),
          _sortTime: item.last_message?.created_at
            ? new Date(item.last_message.created_at).getTime()
            : 0, 
        };
      })
      .sort((a, b) => b._sortTime - a._sortTime); 

    const cleanChats = processedChats.map(({ _sortTime, ...chat }) => chat);

    setChats(cleanChats);
  } catch (error) {
    console.error('Ошибка загрузки чатов:', error);
  }
};

  const isActive = (id) => id === getOpenChatId() ? 'active' : '';

  /* ===============================
     ФИЛЬТРАЦИЯ
  =============================== */
  const filteredChats = chats.filter((chat) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const nameMatch = chat.name?.toLowerCase().includes(term);
    const lastMsgMatch = chat.last_message?.text?.toLowerCase().includes(term);
    return nameMatch || lastMsgMatch;
  });

  const filteredContacts = contacts.filter((contact) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = contact.contact.name || '';
    return name.toLowerCase().includes(term);
  });

  /* ===============================
     ОТРИСОВКА
  =============================== */
  return (
    <div class="sidebar-left" style="width: 100%; height: 100%;">
      <div class="sidebar-top">
        <div
          class="sidebar-menu-btn"
          ref={menuButtonRef}
          onClick={() => {
            if (activeTab === 'chats') {
              handleMenuClick();
            } else if (activeTab === 'contacts' || activeTab === 'profile') {
              loadChats();
              setActiveTab('chats');
              setSearch(''); // ← сброс при возврате к чатам
              changeContactsFor();
            } else if (activeTab === 'editProfile') {
              setActiveTab('profile');
            }
          }}
        >
          {activeTab === 'chats' && (
            <i class="icon menu-icon" style={{ backgroundColor: 'white' }}></i>
          )}
          {activeTab !== 'chats' && (
            <i class="icon leftArrow-icon" style={{ backgroundColor: 'white' }}></i>
          )}
        </div>

        {activeTab === 'profile' && (
          <div style="display:flex; flex-direction:row;">
            <div
              className="editProfile"
              onClick={() => setActiveTab('editProfile')}
            >
              <i class="icon edit-icon" style={{ backgroundColor: 'white' }}></i>
            </div>
            <div
              className="exitProfile"
              onClick={handleExitMenuClick}
              ref={exitMenuButtonRef}
            >
              <i class="icon meatballs-icon" style={{ backgroundColor: 'white' }}></i>
            </div>
          </div>
        )}

        {/* Поиск */}
        {(activeTab === 'chats' || activeTab === 'contacts') && (
          <div class="input-wrapper">
            <div
              class="search-icon"
              style={{ backgroundImage: "url('./icons/search.svg')" }}
            ></div>
            <input
              class="search-input"
              placeholder={activeTab === 'chats' ? 'Поиск по чатам' : 'Поиск по контактам'}
              value={search}
              onInput={(e) => setSearch(e.target.value)}
              ref={searchInputRef}
            />
          </div>
        )}
      </div>

      <div class="sidebar-content">
        {activeTab === 'chats' && (
          <>
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  id={chat.id}
                  name={chat.name}
                  placeholder={chat.placeholder}
                  isChannel={chat.isChannel}
                  isGroup={chat.isGroup}
                  last_message={chat.last_message}
                  // lastMessageDate={chat.last_message.created_at}
                  messageStatus={chat.messageStatus}
                  unreadCount={chat.unreadCount}
                  muted={chat.muted}
                  onClick={() => {
                    console.log(chat)
                    onChatOpen(chat.id)
                  }
                  }
                  isActive={(id) => isActive(id)}
                />
              ))
            ) : (
              <div class="no-results">
                {search ? 'Чаты не найдены' : 'Нет чатов'}
              </div>
            )}
          </>
        )}

        {activeTab === 'contacts' && (
          <>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.contact.id}
                  id={contact.contact.id}
                  name={contact.contact.name}
                  placeholder={contact.contact.placeholder}
                  onClick={(chat) => {
                    if (chat) {
                      onChatOpen(chat.id);
                    }
                    setActiveTab('chats');
                    changeContactsFor();
                  }}
                  contactsFor={{
                    action: contactsFor,
                    chatId: getOpenChatId()
                  }}
                />
              ))
            ) : (
              <div class="no-results">
                {search ? 'Контакты не найдены' : 'Нет контактов'}
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <Profile
            name={app.user.name}
            username={app.user.username}
            phone_number={app.user.phone_number}
          />
        )}

        {activeTab === 'editProfile' && (
          <EditProfile
            name={app.user.name}
            username={app.user.username}
            phone_number={app.user.phone_number}
            onSave={async () => {
              await fetchUser();
              setActiveTab('profile');
            }}
          />
        )}

        {activeTab === 'chats' && (
          <ActionButton
            icon="edit"
            onClick={handleNewChatMenuClick}
            ref={menuNewChatButtonRef}
          />
        )}
        {activeTab === 'contacts' && (
          <ActionButton
            icon="userAdd"
            onClick={() => setIsFormOpen(true)}
            ref={menuNewChatButtonRef}
          />
        )}

        {/* Меню */}
        {menus.main.visible && (
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menus.main.position.y + 10}px`,
              left: `${menus.main.position.x}px`,
              zIndex: 1000
            }}
          >
            <ContextMenu items={menuItems} />
          </div>
        )}

        {menus.newChat.visible && (
          <div
            ref={menuNewChatRef}
            style={{
              position: 'fixed',
              top: `${menus.newChat.position.y - 120}px`,
              left: `${menus.newChat.position.x - 120}px`,
              zIndex: 1000
            }}
          >
            <ContextMenu items={newChatMenuItems} />
          </div>
        )}

        {menus.exit.visible && (
          <div
            ref={exitMenuRef}
            style={{
              position: 'fixed',
              top: `${menus.exit.position.y + 10}px`,
              left: `${menus.exit.position.x}px`,
              zIndex: 1000
            }}
          >
            <ContextMenu items={exitMenuItems} />
          </div>
        )}
      </div>

      {isFormOpen && (
        <Form
          title="Добавить контакт"
          placeholderForInput="Введите номер телефона"
          action="Добавить"
          onClose={() => {
            setIsFormOpen(false);
            setSearch(''); 
          }}
          onSuccess={() => loadContacts()}
          isAddContact={true}
        />
      )}

      {formForCreateGroup && (
        <Form
          title="Создать группу"
          placeholderForInput="Название группы"
          action="Создать"
          onClose={() => setFormForCreateGroup(false)}
          onSuccess={() => loadChats()}
          isCreateGroup={true}
        />
      )}

      {formForCreateChannel && (
        <Form
          title="Создать канал"
          placeholderForInput="Название канала"
          action="Создать"
          onClose={() => setFormForCreateChannel(false)}
          onSuccess={() => loadChats()}
          isCreateChannel={true}
        />
      )}
    </div>
  );
}