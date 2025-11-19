// @components/form/form.jsx
import React, { useState, useEffect, useRef } from 'minireact';
import { addContact } from '@api/modules/contacts';

export function Form({ title, placeholderForInput, action = 'Добавить', onClose, onSuccess, onClick }) {
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

    const formatPhoneNumber = (value) => {
        let digits = value.replace(/\D/g, '');

        if (digits.startsWith('7') || digits.startsWith('8')) {
            digits = digits.substring(1);
        }

        let formatted = '+7 ';
        if (digits.length >= 3) {
            formatted += `(${digits.substring(0, 3)})`;
            if (digits.length >= 6) {
                formatted += ` ${digits.substring(3, 6)}`;
                if (digits.length >= 8) {
                    formatted += `-${digits.substring(6, 8)}`;
                    if (digits.length >= 10) {
                        formatted += `-${digits.substring(8, 10)}`;
                    }
                }
            }
        } else if (digits.length > 0) {
            formatted += `(${digits}`;
        }

        return formatted;
    };

    const handleInput = (e) => {
        const rawValue = e.target.value || '';
        const formatted = formatPhoneNumber(rawValue);
        setInputValue(formatted);
        clearError();
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const rawNumber = inputValue.replace(/\D/g, '');
        if (rawNumber.length < 10) {
            showError('Введите номер полностью');
            return;
        }

        setIsSubmitting(true);
        try {
            await addContact(`+7${rawNumber}`);
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
                    <button
                        type="button"
                        class="modal-close-btn"
                        onClick={handleClose}
                        aria-label="Закрыть"
                    >
                        &times;
                    </button>
                </div>

                <div class="modal-body">
                    <div class="input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            class={`modal-input ${error ? 'error' : ''}`}
                            placeholder={placeholderForInput}
                            maxlength="50"
                            value={inputValue}
                            onInput={handleInput}
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
                    <div
                        type="button"
                        class="btn btn-secondary"
                        disabled={isSubmitting}
                        ref={cancelBtnRef}
                        onClick={() => console.log(123)}
                    >
                        Отменить
                    </div>

                    <button
                        type="button"
                        class={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                        disabled={isSubmitting}
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
