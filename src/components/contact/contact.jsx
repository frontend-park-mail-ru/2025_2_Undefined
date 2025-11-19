import React from 'minireact';
import { getPlaceholder } from '@components/avatar/avatar.js';

export const ContactItem = ({ id, name, placeholder, onClick }) => {
  return (
    <div class="contact-item" data-contact-id={id} onClick={onClick}>
      <div class="contact-avatar">
        <div class="avatar-placeholder">{placeholder || getPlaceholder(name)}</div>
      </div>
      <div class="contact-info">
        <div class="contact-name">{name}</div>
      </div>
    </div>
  );
};
