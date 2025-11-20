// @components/leftSidebar/leftSidebar.jsx
import React, { useState, useEffect, useRef } from 'minireact';
import { ContextMenu } from '@components/context-menu/context-menu.jsx';
import { ActionButton } from '@components/action-button/action-button.jsx';
import { ChatItem } from '@components/chat/chat.jsx';
import { ContactItem } from '@components/contact/contact.jsx';
import { getPlaceholder } from '@components/avatar/avatar.js';
import { Form } from '@components/form/form.jsx';
import { getContacts } from '@api/modules/contacts';

export function LeftSidebar() {
    /* ===============================
       СТЕЙТЫ КОМПОНЕНТА
    =============================== */
    const [activeTab, setActiveTab] = useState('chats');
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [menuState, setMenuState] = useState({
        visible: false,
        position: { x: 0, y: 0 }
    });
    const [newChatMenuState, setNewChatMenuState] = useState({
        visible: false,
        position: { x: 0, y: 0 }
    });

    const [contacts, setContacts] = useState([]);

    const menuButtonRef = useRef(null);
    const menuNewChatButtonRef = useRef(null);
    const menuRef = useRef(null);
    const menuNewChatRef = useRef(null);

    /* ===============================
       ЗАГЛУШКИ ДАННЫХ
    =============================== */
    const dummyChats = [
        {
            id: "1",
            name: "Telegram Team",
            placeholder: "TT",
            isChannel: false,
            isGroup: false,
            last_message: { text: "Welcome to Telegram!" },
            lastMessageDate: "10:12",
            messageStatus: "sent",
            unreadCount: 0,
            muted: false,
        },
        {
            id: "2",
            name: "Рабочий чат",
            placeholder: "РЧ",
            isChannel: false,
            isGroup: true,
            last_message: { text: "Планёрка переносится" },
            lastMessageDate: "09:01",
            messageStatus: "read",
            unreadCount: 3,
            muted: false,
        },
        {
            id: "3",
            name: "Новости",
            placeholder: "Н",
            isChannel: true,
            isGroup: false,
            last_message: { text: "🔥 Срочная новость!" },
            lastMessageDate: "08:40",
            messageStatus: "",
            unreadCount: 1,
            muted: true,
        },
    ];

    const dummyContacts = [
        { id: 1, name: "Алексей Петров", lastMessage: "Привет! Как дела?" },
        { id: 2, name: "Мария Иванова", lastMessage: "Окей, договорились." },
        { id: 3, name: "Дмитрий Соколов", lastMessage: "Список я отправил." },
        { id: 4, name: "Ольга Сергеева", lastMessage: "Нужно обсудить." },
        { id: 5, name: "Илья Смирнов", lastMessage: "Спасибо!" },
        { id: 6, name: "Екатерина Волкова", lastMessage: "Когда встретимся?" },
        { id: 7, name: "Антон Кузнецов", lastMessage: "Понял." },
        { id: 8, name: "Виктория Крылова", lastMessage: "Буду позже." },
        { id: 9, name: "Роман Федоров", lastMessage: "Супер!" },
        { id: 10, name: "Алина Лебедева", lastMessage: "Да, конечно." },
    ].map(contact => ({
        ...contact,
        placeholder: getPlaceholder(contact.name)
    }));

    /* ===============================
       ЭЛЕМЕНТЫ МЕНЮ
    =============================== */
    const menuItems = [
        { text: 'Профиль', icon: '/icons/trash.svg', danger: false, onClick: () => alert('Профиль') },
        {
            text: 'Контакты', icon: '/icons/edit.svg', danger: false, onClick: () => {
                setActiveTab('contacts');
                setMenuState({ visible: false, position: { x: 0, y: 0 } });
                setNewChatMenuState({ visible: false, position: { x: 0, y: 0 } });
            }
        },
    ];

    const newChatMenuItems = [
        { text: 'Создать канал', icon: '/icons/trash.svg', danger: false, onClick: () => alert('Канал') },
        { text: 'Создать группу', icon: '/icons/edit.svg', danger: false, onClick: () => alert('Группа') },
        { text: 'Начать чат', icon: '/icons/edit.svg', danger: false, onClick: () => alert('Чат') },
    ];

    /* ===============================
       ОБРАБОТЧИКИ СОБЫТИЙ
    =============================== */
    const handleMenuClick = () => {
        if (!menuButtonRef.current) return;
        const rect = menuButtonRef.current.getBoundingClientRect();
        setMenuState(prev => ({
            visible: !prev.visible,
            position: { x: rect.left, y: rect.bottom }
        }));
    };

    const handleNewChatMenuClick = () => {
        if (!menuNewChatButtonRef.current) return;
        const rect = menuNewChatButtonRef.current.getBoundingClientRect();
        setNewChatMenuState(prev => ({
            visible: !prev.visible,
            position: { x: rect.left, y: rect.top }
        }));
    };

    const handleClickOutside = (e) => {
        if (
            menuRef.current &&
            menuNewChatRef.current &&
            !menuRef.current.contains(e.target) &&
            !menuNewChatRef.current.contains(e.target) &&
            !menuButtonRef.current.contains(e.target) &&
            !menuNewChatButtonRef.current.contains(e.target)
        ) {
            setMenuState({ visible: false, position: { x: 0, y: 0 } });
            setNewChatMenuState({ visible: false, position: { x: 0, y: 0 } });
        }
    };

    /* ===============================
       ЭФФЕКТЫ
    =============================== */
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        const loadContacts = async () => {
            try {
                console.log(contacts)
                const rawContacts = await getContacts()

                const isArray = Array.isArray(rawContacts);
                const contactList = isArray ? rawContacts : [];

                const processedContacts = contactList.map(item => {
                    const name = item.contact.name || '';
                    console.log(item.contact)
                    return {
                        ...item,
                        contact: {
                            ...item.contact,
                            placeholder: item.contact.placeholder || getPlaceholder(name)
                        }
                    };

                });

                setContacts(processedContacts);
                console.log(contacts)
            } catch (error) {
                console.error('Ошибка загрузки контактов:', error);
            }
        }
        loadContacts();

        // 3️⃣ Отписка от событий при размонтировании
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    /* ===============================
       ОТРИСОВКА КОМПОНЕНТА
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
                        } else if (activeTab === 'contacts') {
                            setActiveTab('chats')
                        }
                    }}
                >
                    {activeTab === 'chats' &&
                        <i class="icon menu-icon" style={{ backgroundColor: 'white' }}></i>
                    }
                    {activeTab === 'contacts' &&
                        <i class="icon leftArrow-icon" style={{ backgroundColor: 'white' }}></i>
                    }
                </div>


                {/* Поиск */}
                <div class="search-wrapper">
                    <div
                        class="search-icon"
                        style={{ backgroundImage: "url('./icons/search.svg')" }}
                    ></div>
                    <input
                        class="search-input"
                        placeholder="Поиск…"
                        value={search}
                        onInput={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Контекстное меню профиля */}
            {menuState.visible && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: `${menuState.position.y + 10}px`,
                        left: `${menuState.position.x}px`,
                        zIndex: 1000,
                    }}
                >
                    <ContextMenu items={menuItems} />
                </div>
            )}

            {/* Основной контент сайдбара */}
            <div class="sidebar-content">
                {activeTab === 'chats' &&
                    <ActionButton
                        icon="edit"
                        onClick={handleNewChatMenuClick}
                        ref={menuNewChatButtonRef}
                    />
                }
                {activeTab === 'contacts' &&
                    <ActionButton
                        icon="userAdd"
                        onClick={() => setIsFormOpen(true)}
                        ref={menuNewChatButtonRef}
                    />
                }
                <div class="chat-list">
                    {activeTab === 'chats' && dummyChats.map(chat => (
                        <ChatItem
                            key={chat.id}
                            id={chat.id}
                            name={chat.name}
                            placeholder={chat.placeholder}
                            isChannel={chat.isChannel}
                            isGroup={chat.isGroup}
                            last_message={chat.last_message}
                            lastMessageDate={chat.lastMessageDate}
                            messageStatus={chat.messageStatus}
                            unreadCount={chat.unreadCount}
                            muted={chat.muted}
                            onClick={() => console.log("open chat:", chat.id)}
                        />
                    ))}

                    {activeTab === 'contacts' && contacts.map(contact => (
                        <ContactItem
                            key={contact.contact.id}
                            id={contact.contact.id}
                            name={contact.contact.name}
                            placeholder={contact.contact.placeholder}
                            onClick={() => console.log("open contact:", contact.contact.id)}
                        />
                    ))}
                </div>

                {/* Контекстное меню нового чата */}
                {newChatMenuState.visible && (
                    <div
                        ref={menuNewChatRef}
                        style={{
                            position: 'fixed',
                            top: `${newChatMenuState.position.y - 120}px`,
                            left: `${newChatMenuState.position.x - 120}px`,
                            zIndex: 1000,
                        }}
                    >
                        <ContextMenu items={newChatMenuItems} />
                    </div>
                )}
            </div>

            {isFormOpen && (
                <Form
                    title="Добавить контакт"
                    placeholderForInput="Введите номер телефона"
                    action="Добавить"
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        console.log('все четко');
                    }}
                    onClick={() => console.log(123321)}
                />
            )}
        </div>
    );
}