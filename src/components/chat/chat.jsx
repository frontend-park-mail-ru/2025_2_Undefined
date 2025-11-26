import React from "minireact";
import { getPlaceholder } from '@components/avatar/avatar.js';

export function ChatItem({
  id,
  name,
  placeholder,
  isChannel,
  isGroup,
  last_message = {},
  messageStatus,
  lastMessageDate,
  unreadCount,
  muted,
  onClick,
  ref,
  isActive
}) {
  isActive(id);
  return (
    <div
      class={`chat-item ${isActive(id) ? 'active' : ''}`}
      data-chat-id={id}
      ref={ref}
      onClick={onClick}
    >
      {/* Аватар */}
      <div class="chat-avatar">
        <div class="avatar-placeholder">{placeholder || getPlaceholder(name)}</div>
      </div>

      {/* Правая часть */}
      <div class="chat-info">
        <div class="info-row">

          {/* Название + тип чата */}
          <div class="title">
            <div class="chat-type">
              {isChannel && <i class="channel-icon"></i>}
              {isGroup && <i class="group-icon"></i>}
            </div>

            <div class="chat-name">{name}</div>
          </div>

          <div class="separator"></div>

          {/* Метаданные последнего сообщения */}
          <div class="lastMessageMeta">
            <div class={`MessageStatus ${messageStatus || ""}`}></div>
            <div class="time">{lastMessageDate}</div>
          </div>
        </div>

        {/* Подзаголовок */}
        <div class="subtitle">
          <div class="last-message">{last_message?.text || ""}</div>

          {unreadCount > 0 && (
            <div class={`ChatBadge unread ${muted ? "muted" : ""}`}>
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
