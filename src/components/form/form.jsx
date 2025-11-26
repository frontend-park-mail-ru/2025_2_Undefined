// @components/form/form.jsx
import React, { useState, useEffect, useRef } from 'minireact';
import { addContact as apiAddContact } from '@api/modules/contacts'; // ⚠️ Переименовали импорт
import Chat from '@api/modules/chats.js';

export function Form({ title, placeholderForInput, action = 'Добавить', onClose, onSuccess, isAddContact, isCreateGroup, isCreateChannel }) {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const inputRef = useRef(null);
    const errorRef = useRef(null);
    const cancelBtnRef = useRef(null);
    const submitBtnRef = useRef(null);

    useEffect(() => {
        if (inputRef.current && typeof inputRef.current.focus === 'function') {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleClose = () => {
        if (onClose) onClose();
    };

    const clearError = () => {
        setError('');
    };

    const showError = (message) => {
        setError(message);
        if (errorRef.current && typeof errorRef.current.focus === 'function') {
            try { errorRef.current.focus(); } catch (e) { }
        }
    };

    const telValidate = (event) => {
        if (!isAddContact) return;

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

    // ⚠️ ИСПРАВЛЕНИЕ: Переименовали локальную функцию
    const handleAddContact = async () => {
        const rawNumber = inputRef.current.value.replace(/\D/g, '');
        if (rawNumber.length < 10) {
            showError('Введите номер полностью');
            return;
        }
        console.log('Номер для добавления:', rawNumber);

        try {
            // ⚠️ Используем переименованный импорт
            await apiAddContact(`+${rawNumber}`);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            let message = 'Неизвестная ошибка';
            const code = error?.statusCode ?? error?.status;
            if (code === 404) message = 'Пользователь не найден';
            else if (code === 409) message = 'Пользователь уже в контактах';
            else if (code === 500) message = 'Ошибка сервера';
            showError(message);
        }
    }

    const createGroupOrChannel = async () => {
        console.log(isCreateGroup)
        const type = isCreateGroup ? 'group' : 'channel';
        const chatData = {
            members: [
                {
                    user_id: app.user.id,
                    role: 'admin'
                }
            ],
            name: inputRef.current.value,
            type: type
        }

        try {
            const response = await Chat.createChat(chatData);
            console.log('Чат создан:', response);
        } catch(err) {
            console.warn('Ошибка создания чата:', err);
        }
    }

    const handleSubmit = async () => {
        if (isAddContact) {
            await handleAddContact(); // ⚠️ Используем переименованную функцию
        }
        if (isCreateGroup || isCreateChannel) {
            await createGroupOrChannel();
        }

        if (onSuccess) onSuccess();
        if (onClose) onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault && e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div
            class="modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div class="modal-dialog" role="dialog" aria-modal="true" aria-label={title || 'Modal'}>
                <div class="modal-header">
                    <h2>{title}</h2>
                </div>

                <div class="modal-body">
                    <div class="input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            class={`modal-input ${error ? 'error' : ''}`}
                            placeholder={placeholderForInput}
                            maxLength="50"
                            onInput={telValidate}
                            onKeyDown={handleKeyDown}
                        />
                        {error && (
                            <div ref={errorRef} class="error-message" tabIndex="-1">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        ref={cancelBtnRef}
                        onClick={handleClose}
                    >
                        Отменить
                    </button>

                    <button
                        type="button"
                        class={`btn btn-primary`}
                        ref={submitBtnRef}
                        onClick={handleSubmit}
                    >
                        {action}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Form;