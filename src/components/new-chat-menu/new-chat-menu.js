import newChatMenu from '@components/new-chat-menu/new-chat-menu.hbs';

export async function renderNewChatMenu (parent, homeInstance) {
    const html = newChatMenu();
    parent.insertAdjacentHTML('beforeend', html);

    const startNewChat = document.querySelector('#startNewChat');
    const dialog = document.querySelector('#newChatMenu')

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