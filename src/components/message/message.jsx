import React from 'minireact';

export function Message({ isSystem, isMine, text, time, onMessageClick, id }) {

    if (isSystem) {
        return (
            <div class="systemMessage">
                {text}
            </div>
        );
    }

    if (isMine) {
        return (
            <div class="myMessage message"
                onContextMenu={(event) => {
                    event.preventDefault();
                    onMessageClick(event);
                }}
            >
                <div class="message-text">
                    {text}
                </div>
                <div class="message-time">
                    {time}
                </div>
            </div>
        );
    }

    return (
        <div class="notMyMessage message"
            onContextMenu={() => {
                event.preventDefault();
                onMessageClick(event);
            }}
        >
            <div class="message-text">
                {text}
            </div>
            <div class="message-time">
                {time}
            </div>
        </div>
    );
}