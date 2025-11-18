import React from 'minireact';

export function ContextMenu({ items = [] }) {
  return (
    <div class="ContextMenu">
      <div class="ContextMenu-container">
        {items.map((item, index) => (
          <div
            key={index}
            class={`ContextMenu-item ${item.danger ? 'ContextMenu-item--danger' : ''}`}
            onClick={item.onClick}
          >
            {item.icon && (
              <div
                class="ContextMenu-item-icon"
                style={{ backgroundImage: `url(${item.icon})` }}
              ></div>
            )}
            <span class="ContextMenu-item-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContextMenu;

