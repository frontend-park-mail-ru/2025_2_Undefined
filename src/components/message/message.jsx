import React from 'minireact';

export function Message({ isSystem, isMine, text, time, onMessageClick, id, isUpdated, attachment }) {
    if (isSystem) {
        return (
            <div class="systemMessage">
                {text}
            </div>
        );
    }
    if (isMine) {
        return (
            <div class={`myMessage ${attachment?.type === 'sticker' ? 'sticker' : attachment?.type === 'image' ? 'image message' : 'message'}`}
                onContextMenu={(event) => {
                    event.preventDefault();
                    onMessageClick(event);
                }}
            >
                <div class="message-text">
                    {attachment?.type === 'sticker' &&
                        <img
                            src={attachment.file_url}
                            alt="1111"
                            class="sticker-message"
                            loading="lazy"
                        />
                    }
                    <div class="subtext">
                        {attachment?.type === 'image' &&
                            <img
                                src={attachment.file_url}
                                alt="1111"
                                class="image-message"
                                loading="lazy"
                            />
                        }
                        {attachment?.type !== 'sticker' && text}
                    </div>
                </div>
                {isUpdated &&
                    <div class="message-time">
                        Изменено
                    </div>
                }
                <div class="message-time">
                    {time}
                </div>
            </div>
        );
    }

    return (
        <div class={`notMyMessage ${attachment?.type === 'sticker' ? 'sticker' : attachment?.type === 'image' ? 'image message' : 'message'}`}
            onContextMenu={() => {
                event.preventDefault();
                onMessageClick(event);
            }}
        >
            <div class="message-text">
                {attachment?.type === 'sticker' &&
                    <img
                        src={attachment.file_url}
                        alt="1111"
                        class="sticker-message"
                        loading="lazy"
                    />
                }
                <div class="subtext">
                    {attachment?.type === 'image' &&
                        <img
                            src={attachment.file_url}
                            alt="1111"
                            class="image-message"
                            loading="lazy"
                        />
                    }
                    {attachment?.type !== 'sticker' && text}
                </div>
            </div>
            <div class="message-time">
                {time}
            </div>
        </div>
    );
}