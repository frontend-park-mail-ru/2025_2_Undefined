import React from 'minireact';
import { useState } from 'minireact';
import './sticker-modal.css';
import { smiles, stickers } from '@assets/smiles/smiles'

export const StickersModal = ({
    onClose,
    addSmile,
    sendSticker
}) => {
    const [activeTab, setActiveTab] = useState('smiles');

    const handleSmileClick = (sticker) => {
        addSmile(sticker)
        // if (onClose) onClose(sticker);
    };

    const handleStickerClick = (sticker) => {
        sendSticker(sticker.id)
        if (onClose) onClose(sticker);
    };

    return (
        <div class="stickers-modal-overlay">
            <div
                class="stickers-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {activeTab === 'smiles' &&
                    <div class="smile-grid">
                        {smiles.map((smile, index) => (
                            <button
                                key={index}
                                class="smile-button"
                                onClick={() => handleSmileClick(smile)}
                                type="button"
                                aria-label={`Стикер: ${smile}`}
                            >
                                {smile}
                            </button>
                        ))}
                    </div>
                }
                {activeTab === 'stickers' &&
                    <div class="stickers-grid">
                        {stickers.map((sticker, index) => (
                            <button
                                key={index}
                                class="sticker-button"
                                onClick={() => {
                                    console.log(sticker)
                                    handleStickerClick(sticker)

                                }}
                                type="button"
                                aria-label={`Стикер: ${sticker}.png`}
                            >
                                <img
                                    src={sticker.src}
                                    alt="1111"
                                    class="sticker-image"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                }
            </div>
            <div
                class="stickers-modal-footer"
            >
                <div
                    class={`stickers-modal-footer-item ${activeTab === 'stickers' ? 'inActive' : ''}`}
                    onClick={() => setActiveTab('smiles')}
                >
                    <p>Эмодзи</p>
                </div>
                <div
                    class={`stickers-modal-footer-item ${activeTab === 'smiles' ? 'inActive' : ''}`}
                    onClick={() => setActiveTab('stickers')}
                >
                    <p>Стикеры</p>
                </div>
            </div>
        </div>
    );
};