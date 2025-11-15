const newChat = [
    {
        text: 'Создать канал',
        icon: 'channel',
        danger: false,
        action: 'create-channel',
    },
    {
        text: 'Создать группу',
        icon: 'group',
        danger: false,
        action: 'create-group',
    },
    {
        text: 'Создать чат',
        icon: 'user',
        danger: false,
        action: 'create-chat',
    },
];

const mainMenu = [
    {
        text: 'Профиль',
        icon: 'user',
        danger: false,
        action: 'profile',
    },
    {
        text: 'Контакты',
        icon: 'group',
        danger: false,
        action: 'contacts',
    },
    {
        text: 'Поддержка',
        icon: 'compas',
        danger: false,
        action: 'support',
    },
    {
        text: 'Выход',
        icon: 'exit',
        danger: true,
        action: 'logout',
    },
];

const exit = [
    {
        text: 'Выход',
        icon: 'exit',
        danger: true,
        action: 'logout',
    },
];

const chatActions = [
    {
        text: 'Покинуть группу',
        icon: 'exit',
        danger: true,
        action: 'leave-group',
    },
    {
        text: 'Удалить чат',
        icon: 'exit',
        danger: true,
        action: 'delete-chat',
    },
];

export { newChat, mainMenu, exit, chatActions };
