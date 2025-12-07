import React, { useState, useEffect, useRef } from 'minireact';
import { getWebSocket } from '@api/modules/websocket';

export function InputMessage({ id, onSendMessage, isEditing, textOfEdit, updateMessage, noEdit }) {
    const [messageText, setMessageText] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const textareaRef = useRef(null);
    const sendButtonRef = useRef(null);


    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const text = String(messageText || '').trim();

        if (sendButtonRef.current) {
            sendButtonRef.current.disabled = text === '';
        }
        setIsDisabled(text === '');
    }, [messageText]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.value = textOfEdit || '';
        }
    }, [textareaRef, textOfEdit]);

    const handleInputChange = (e) => {
        setMessageText(e.target.value);
    };

    const handleSend = () => {
        if (isEditing) {
            updateMessage(messageText);
            setMessageText('');
            if (textareaRef.current) textareaRef.current.value = '';
            noEdit();
        } else if (messageText.trim() && onSendMessage) {
            sendMessage();
            setMessageText('');
            if (textareaRef.current) textareaRef.current.value = '';
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleKeyDown = (e) => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const clearInput = () => {
        setMessageText('');
        noEdit();
        if (textareaRef.current) {
            textareaRef.current.value = '';
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
        }
    };

    const sendMessage = async () => {
        const ws = getWebSocket();

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket не подключён или не готов к отправке');
            return;
        }

        const message = {
            value: {
                text: messageText,
                created_at: new Date().toISOString(),
                chat_id: id,
            },
            chat_id: id,
            type: 'new_message'
        }

        console.log('Сообщение для отправки', message)
        ws.send(JSON.stringify(message));
        console.log('Сообщение отправлено через WebSocket');
    }

    return (
        <div class="inputMessage" data-inputmessage-id={id} style={{ position: 'relative' }}>
            <div class="inputMessage-item" style={{ flex: 1, position: 'relative' }}>
                <textarea
                    class="inputMessage-item-input"
                    placeholder="Сообщение"
                    onInput={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onKeyDown={handleKeyDown}
                    ref={textareaRef}
                    rows="1"
                    style={{
                        resize: 'none',
                        overflow: 'hidden',
                        minHeight: '40px',
                        maxHeight: '120px',
                        // paddingRight: messageText.trim() ? '32px' : '12px', // ← место под крестик
                        boxSizing: 'border-box'
                    }}
                />

                {/* ✅ Кнопка крестика */}
                {/* {messageText.trim() && ( */}
                    <button
                        type="button"
                        onClick={clearInput}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '8px',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            color: '#999',
                            cursor: 'pointer',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            margin: 0,
                            zIndex: 1
                        }}
                        aria-label="Очистить"
                    >
                        ✕
                    </button>
                {/* )} */}
            </div>
            <div class="inputMessage-item">
                <button
                    class={`button`}
                    onClick={() => handleSend()}
                    ref={sendButtonRef}
                >
                    <i class="icon post-icon"></i>
                </button>
            </div>
        </div>
    );
}