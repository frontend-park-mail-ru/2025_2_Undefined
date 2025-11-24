// @components/form/form.jsx
import React, { useState, useEffect, useRef } from 'minireact';
import { addContact } from '@api/modules/contacts';

export function Form({ title, placeholderForInput, action = 'Добавить', onClose, onSuccess }) {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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


        // Очистка
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, []); // выполняется один раз при маунте

    const handleClose = () => {
        if (onClose) onClose();
    };

    const clearError = () => {
        setError('');
    };

    const showError = (message) => {
        setError(message);
        // фокус на ошибку (опционально)
        if (errorRef.current && typeof errorRef.current.focus === 'function') {
            try { errorRef.current.focus(); } catch (e) { }
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
    const handleSubmit = async () => {

        if (isSubmitting) return;

        const rawNumber = inputRef.current.value.replace(/\D/g, '');
        if (rawNumber.length < 10) {
            showError('Введите номер полностью');
            return;
        }
        console.log(rawNumber)

        setIsSubmitting(true);
        try {

            await addContact(`+${rawNumber}`);
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            let message = 'Неизвестная ошибка';
            const code = error?.statusCode ?? error?.status;
            if (code === 404) message = 'Пользователь не найден';
            else if (code === 409) message = 'Пользователь уже в контактах';
            else if (code === 500) message = 'Ошибка сервера';
            showError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // предотвращаем двойную отправку, если форма внутри <form>
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
                    {/* <button
                        type="button"
                        class="modal-close-btn"
                        onClick={handleClose}
                        aria-label="Закрыть"
                    >
                        &times;
                    </button> */}
                </div>

                <div class="modal-body">
                    <div class="input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            class={`modal-input ${error ? 'error' : ''}`}
                            placeholder={placeholderForInput}
                            maxlength="50"
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
                        class={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                        ref={submitBtnRef}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Добавление...' : action}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Form;
