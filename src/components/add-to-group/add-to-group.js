import userDialogTemplate from '@components/add-to-group/add-to-group.hbs';
import Chat from '@api/modules/chats';
import { getUserByNumber } from '@api/modules/contacts';

export function renderAdduserDialog(parent, homeInstance, HomeData){
    const html = userDialogTemplate();
    parent.insertAdjacentHTML('beforeend', html);

    const dialog = parent.querySelector('#userDialog');
    if (!dialog) return null;

    const input = dialog.querySelector('#userNumberInput');
    const createBtn = dialog.querySelector('#createuserBtn');
    const cancelBtn = dialog.querySelector('#canceluserBtn');
    const errorEl = dialog.querySelector('#userNameError');

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
        const number = input.value.trim();
        if (number.length < 18) {
            showError('Введите номер полностью');
            return;
        }
        try{
            const userId = await getUserByNumber(number);
            if (!userId || !userId.id) {
                showError('Пользователь не найден');
                return;
            }

            const requestData = {
                members: [
                    {
                        role: "admin", 
                        user_id: userId.id
                    }
                ]
            };
            await Chat.addToGroup(requestData, HomeData.chatId);
            dialog.remove();
        } catch(error) {
            switch (error.statusCode) {
                case 404: 
                    showError("Пользователь не найден");
                    break;
                case 409: 
                    showError("Пользователь уже в группе");
                    break;
                case 500: 
                    showError("Ошибка сервера");
                    break;
            }
            
            return;
        }
        
    };
    
    const telValidate = (event) => {
        let value = event.target.value.replace(/\D/g, '');

        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.substring(1);
        }

        let formattedValue = '+7 (';

        if (value.length > 0) {
            formattedValue += value.substring(0, 3);
        }
        if (value.length > 3) {
            formattedValue += ') ' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formattedValue += '-' + value.substring(6, 8);
        }
        if (value.length > 8) {
            formattedValue += '-' + value.substring(8, 10);
        }

        event.target.value = formattedValue;
    }

    createBtn?.addEventListener('click', handleCreate);
    cancelBtn?.addEventListener('click', handleCancel);
    input?.addEventListener('input', clearError);
    input?.addEventListener('input', telValidate);

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            handleCancel();
            window.removeEventListener('keydown', handleEscape);
        }
    };
    window.addEventListener('keydown', handleEscape);
}
