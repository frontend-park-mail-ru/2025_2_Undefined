import React, { useState, useEffect, useRef } from 'minireact';
import { getWebSocket } from '@api/modules/websocket';
import { StickersModal } from '@components/stickers-modal/sticker-modal';
import Chat from '@api/modules/chats';

export function InputMessage({ id, onSendMessage, isEditing, textOfEdit, updateMessage, noEdit }) {
    const [messageText, setMessageText] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [showStickerModal, setShowStickerModal] = useState(false)

    const textareaRef = useRef(null);
    const sendButtonRef = useRef(null);
    const fileInputRef = useRef(null);


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

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Сброс значения инпута — чтобы можно было выбрать тот же файл снова
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Проверим тип: только изображения
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение (jpeg, png, gif и т.д.)');
            return;
        }

        try {
            // Можно отправить сразу как attachment, аналогично стикеру
            await sendMessage(-2, file);
        } catch (err) {
            console.error('Ошибка отправки изображения:', err);
            alert('Не удалось отправить изображение');
        }
    };

    const sendImage = async (file) => {
        const ws = getWebSocket();
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket не подключён');
        }

        // Преобразуем в base64
        // const base64 = await new Promise((resolve, reject) => {
        //     const reader = new FileReader();
        //     reader.onload = () => resolve(reader.result.split(',')[1]); // только data без prefix
        //     reader.onerror = reject;
        //     reader.readAsDataURL(file);
        // });

        const message = {
            value: {
                created_at: new Date().toISOString(),
                chat_id: id,
                attachment: {
                    type: 'image',

                },
            },
            chat_id: id,
            type: 'new_message'
        };

        console.log('Отправка изображения...', { filename: file.name, size: file.size });
        ws.send(JSON.stringify(message));
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

    const sendMessage = async (stickerId = -1, file) => {
        const ws = getWebSocket();

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket не подключён или не готов к отправке');
            return;
        }

        let message = {};
        if (stickerId === -1) {
            message = {
                value: {
                    text: messageText,
                    created_at: new Date().toISOString(),
                    chat_id: id,
                },
                chat_id: id,
                type: 'new_message'
            }
        } else if (file) {
            const data = {
                file: file,
                chat_id: id,
            }
            const attachmentId = await Chat.getAttachmentId(data);
            console.log(attachmentId)

            message = {
                value: {
                    created_at: new Date().toISOString(),
                    chat_id: id,
                    text: textareaRef.current.value,
                    attachment: {
                        type: 'image',
                        attachment_id: attachmentId.id,
                    },
                },
                chat_id: id,
                type: 'new_message'
            }

            setMessageText('');
            if (textareaRef.current) textareaRef.current.value = '';
        } else {
            message = {
                value: {
                    created_at: new Date().toISOString(),
                    chat_id: id,
                    attachment: {
                        type: 'sticker',
                        sticker_id: '0000000000000000000000000000000000' + stickerId.toString(),
                        // attachment_id: stickerId.toString(),
                    },
                },
                chat_id: id,
                type: 'new_message'
            }
        }

        console.log('Сообщение для отправки', message)
        ws.send(JSON.stringify(message));
    }

    const addSmile = (smile) => {
        setMessageText(prev => prev + smile);
        textareaRef.current.value += smile;
    };

    const sendSticker = (stickerId) => {
        sendMessage(stickerId);
    }

    return (
        <div class="inputMessage" data-inputmessage-id={id} style={{ position: 'relative' }}>
            {/* Скрытый файловый инпут */}
            <input
                type="file"
                ref={(el) => (fileInputRef.current = el)}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            <div class="inputMessage-item" style={{ flex: 1, position: 'relative' }}>
                <div>
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
                            paddingRight: messageText.trim() ? '32px' : '12px',
                            boxSizing: 'border-box'
                        }}
                    />
                    {/* ✅ Кнопка крестика */}
                    {messageText.trim() && (
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
                    )}

                    {!isEditing && (
                        <>
                            {/* ✅ Кнопка clip (скрепка) */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: '56px', // отступ от края: 8px (крестик) + 24px (кнопка) + 8px зазор ≈ 56px
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
                                aria-label="Прикрепить файл"
                            >
                                <i class="clip-icon icon"></i>
                            </button>

                            {/* ✅ Кнопка смайлика */}
                            <button
                                type="button"
                                onClick={() => setShowStickerModal(!showStickerModal)}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: '30px',
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
                                aria-label="Эмодзи и стикеры"
                            >
                                <i class="smile-icon icon"></i>
                            </button>
                        </>
                    )}
                </div>

                {showStickerModal && (
                    <StickersModal
                        onClose={() => setShowStickerModal(false)}
                        addSmile={addSmile}
                        sendSticker={sendSticker}
                    />
                )}
            </div>

            <div class="inputMessage-item">
                <button
                    class={`button`}
                    onClick={handleSend}
                    ref={sendButtonRef}
                    disabled={isDisabled}
                >
                    <i class="icon post-icon"></i>
                </button>
            </div>
        </div>

    );
}