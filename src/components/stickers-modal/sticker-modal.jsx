import React from 'minireact';
import './sticker-modal.css';

export const StickersModal = ({ 
    onClose,
    addSmile
}) => {
    const smiles = [
        '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉',
        '😊', '😋', '😌', '😍', '😎', '😏', '😐', '😑', '😒', '😓',
        '😔', '😕', '😖', '😗', '😘', '😙', '😚', '😛', '😜', '😝',
        '😞', '😟', '😠', '😡', '😢', '😣', '😤', '😥', '😦', '😧',
        '😨', '😩', '😪', '😫', '😬', '😭', '😮', '😯', '😰', '😱',
        '😲', '😳', '😴', '😵', '😶', '😷', '😸', '😹', '😺', '😻',
        '😼', '😽', '😾', '😿', '🙀', '🙁', '🙂', '🙃', '🙄', '🫃'
    ];

    const handleStickerClick = (sticker) => {
        console.log('lala')
        addSmile(sticker)
        if (onClose) onClose(sticker);
    };

    return (
        <div class="stickers-modal-overlay" onClick={onClose}>
            <div 
                class="stickers-modal-content" 
                onClick={(e) => e.stopPropagation()}
            >
                <div class="stickers-grid">
                    {smiles.map((sticker, index) => (
                        <button
                            key={index}
                            class="sticker-button"
                            onClick={() => handleStickerClick(sticker)}
                            type="button"
                            aria-label={`Стикер: ${sticker}`}
                        >
                            {sticker}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};