import menuOfChat from '@components/menu-of-chat/menu-of-chat.hbs';
import Chat from '@api/modules/chats.js';
import { renderAdduserDialog } from '@components/add-to-group/add-to-group';

export async function renderMenuOfChat (parent, homeInstance, HomeData) {
    const html = menuOfChat({
        isGroup: HomeData.isGroup === true 
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
        renderAdduserDialog(document.body, homeInstance, HomeData);
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
