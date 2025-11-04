const newChat = [
    {
        text: 'Создать канал',
        icon: 'channel',
        danger: false,
    },
    {
        text: 'Создать группу',
        icon: 'group',
        danger: false,
    },
    {
        text: 'Создать чат',
        icon: 'user',
        danger: false,
    },
];

const mainMenu = [
    {
        text: 'Профиль',
        icon: 'user',
        danger: false,
    },
    {
        text: 'Контакты',
        icon: 'group',
        danger: false,
    },
];

const exit = [
    {
        text: 'Выход',
        icon: 'exit',
        danger: true,
    },
];

const chatActions = [
    {
        text: 'Покинуть группу',
        icon: 'exit',
        danger: true,
    },
    {
        text: 'Удалить чат',
        icon: 'exit',
        danger: true,
    },
];

export { newChat, mainMenu, exit, chatActions };
