import menuOfChat from '@components/menu-of-chat/menu-of-chat.hbs';
import Chat from '@api/modules/chats.js';

export async function renderMenuOfChat (parent, homeInstance, HomeData) {
    const html = menuOfChat({
        isGroup: HomeData.isGroup === true // Строгая проверка на true
    });
    parent.insertAdjacentHTML('beforeend', html);

    const addUser = document.querySelector('#addUser');
    const deleteChat = document.querySelector('#deleteChat');
    const dialog = document.querySelector('#menuOfChat');

    deleteChat?.addEventListener('click', ()=>{
        Chat.deleteChat(HomeData.chatId);
        homeInstance.renderChats();
    })

    addUser?.addEventListener('click', ()=>{
        if (homeInstance && typeof homeInstance.renderContacts === 'function') {
            homeInstance.renderContacts(); 
        } else {
            console.error("homeInstance или метод renderContacts не определен.");
        }
    })

    const handleCancel = () => {
        dialog.remove();
    };

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    };

    dialog.addEventListener('mouseleave', handleCancel);
    dialog.addEventListener('click', handleCancel);
    window.addEventListener('keydown', handleEscape);
}
