import { getPlaceholder } from '@components/avatar/avatar.js';
import React, { useRef, useState } from 'minireact';
import { ActionButton } from '@components/action-button/action-button.jsx';
import Chat from '@api/modules/chats';

export const EditGroupModal = ({
    id,
    placeholder,
    name,
    description,
    onSave,
    onClose,
    isChannel = false
}) => {
    const nameRef = useRef(null);
    const descriptionRef = useRef(null);
    const [hasChanges, setHasChanges] = useState(false);

    const checkChanges = () => {
        const nameValue = nameRef.current?.value ?? '';
        const descriptionValue = descriptionRef.current?.value ?? '';

        const nameChanged = nameValue.trim() !== (name || '');
        const descriptionChanged = descriptionValue.trim() !== (description || '');

        setHasChanges(nameChanged || descriptionChanged);
    };

    const handleSubmit = async () => {
        const nameValue = nameRef.current?.value ?? '';
        // const descriptionValue = descriptionRef.current?.value ?? '';

        const updateData = {
            name: nameValue.trim(),
            description: ''
        };

        console.log(updateData)

        await Chat.editChat(id, updateData);
        await onSave(updateData);
        onClose();
    };

    const handleClose = () => {
        if (hasChanges) {
            onClose();
        } else {
            onClose();
        }
    };

    return (
        <div class="modal-overlay" onClick={handleClose}>
            <div
                class="modal-dialog edit-group-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`Редактирование ${isChannel ? 'канала' : 'группы'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Заголовок модального окна */}
                <div class="modal-header">
                    <h2>Редактирование {isChannel ? 'канала' : 'группы'}</h2>
                </div>

                {/* Основной контент */}
                <div class="modal-body edit-group-body">
                    {/* Аватар и название */}
                    <div class="edit-group-avatar-section">
                        <div class="edit-group-avatar">
                            {placeholder || getPlaceholder(nameRef.current?.value || name || '')}
                        </div>
                    </div>

                    {/* Поля редактирования */}
                    <div class="edit-group-fields">
                        {/* Название */}
                        <div class="edit-group-field">
                            <div class="edit-group-label">
                                <i class="icon user-icon"></i>
                                Название {isChannel ? 'канала' : 'группы'}
                            </div>
                            <div class="input-wrapper">
                                <input
                                    ref={nameRef}
                                    class="editProfile-input"
                                    type="text"
                                    value={name || ''}
                                    // onInput={checkChanges}
                                    placeholder={`Введите название ${isChannel ? 'канала' : 'группы'}`}
                                />
                            </div>
                        </div>

                        {/* Описание */}
                        {/* <div class="edit-group-field">
                            <div class="edit-group-label">
                                <i class="icon info-icon"></i>
                                Описание
                            </div>
                            <div class="input-wrapper">
                                <textarea
                                    ref={descriptionRef}
                                    class="editProfile-textarea"
                                    value={description || ''}
                                    onInput={checkChanges}
                                    placeholder="Введите описание"
                                    rows="3"
                                />
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Футер с кнопками */}
                <div class="modal-footer edit-group-footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Отменить
                    </button>

                    <button
                        type="button"
                        class="btn btn-primary"
                        onClick={handleSubmit}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};