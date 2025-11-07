import newChatMenu from '@components/new-chat-menu/new-chat-menu.hbs';
import {renderCreateGroupDialog} from '@components/create-group/create-group.js';

export async function renderNewChatMenu (parent, homeInstance, HomeData) {
    const html = newChatMenu();
    parent.insertAdjacentHTML('beforeend', html);

    const startNewChat = document.querySelector('#startNewChat');
    const createNewGroup = document.querySelector('#createNewGroup');
    const dialog = document.querySelector('#newChatMenu');

    createNewGroup?.addEventListener('click', ()=>{
        renderCreateGroupDialog(document.body, homeInstance, HomeData);
    })

    startNewChat?.addEventListener('click', ()=>{
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