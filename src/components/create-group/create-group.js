import createGroupDialogTemplate from '@components/create-group/create-group.hbs';
import Chat from '@api/modules/chats';

export async function renderCreateGroupDialog(parent, homeInstance, HomeData) {
    const html = createGroupDialogTemplate();
    parent.insertAdjacentHTML('beforeend', html);

    const dialog = parent.querySelector('#createGroupDialog');

    const input = dialog.querySelector('#nameOfGroup');
    const createBtn = dialog.querySelector('#createGroupBtn');
    const cancelBtn = dialog.querySelector('#cancelGroupBtn');
    const errorEl = dialog.querySelector('#createGroupNameError');

    const showError = (message) => {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        input.classList.add('error');
    };

    const clearError = () => {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
        input.classList.remove('error');
    };

    const handleCancel = () => {
        dialog.remove();
    };

    const handleCreate = async () => {
        const name = input.value.trim();
        if (name.length > 30) {
            showError('Слишком длинное название');
            return;
        }

        const groupData = {
            members: [
                {
                    user_id: app.user.id,
                    role: 'admin'
                }
            ],
            name: name,
            type: 'group',
        };

        const groupId = await Chat.createChat(groupData);
        const chat = await Chat.getChat(groupId.id);

        homeInstance.renderChat(HomeData, chat.id, chat.messages);
        homeInstance.renderChats();    
        
        dialog.remove();
    }

    createBtn?.addEventListener('click', handleCreate);
    cancelBtn?.addEventListener('click', handleCancel);
    input?.addEventListener('input', clearError);

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            handleCancel();
            window.removeEventListener('keydown', handleEscape);
        }
    };
    window.addEventListener('keydown', handleEscape);

}