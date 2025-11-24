import React from 'minireact';
import { getPlaceholder } from '@components/avatar/avatar.js';
import Chat from '@api/modules/chats.js';
import { app } from '@/main';

export const ContactItem = ({ id, name, placeholder }) => {

  const startDialog = async (contactId) => {

    const contactData = {
      members: [
        {
          user_id: contactId,
          role: 'admin'
        },
        {
          user_id: app.user.id,
          role: 'admin'
        }
      ],
      name: 'pew pew pew',
      type: 'dialog',
    };


    let dialogWithContactId;
    try {
      dialogWithContactId = await Chat.getChatByContact(contactId);
      console.log('Чат получен')
    } catch {
      await Chat.createChat(contactData);
      dialogWithContactId = await Chat.getChatByContact(contactId);
      console.log('Чат создан')
    }
    console.log('dialogWithContactId', dialogWithContactId)
    const chat = await Chat.getChat(dialogWithContactId.id);
    console.log(chat)
  }

  return (
    <div class="contact-item" data-contact-id={id} onClick={() => startDialog(id)}>
      <div class="contact-avatar">
        <div class="avatar-placeholder">{placeholder || getPlaceholder(name)}</div>
      </div>
      <div class="contact-info">
        <div class="contact-name">{name}</div>
      </div>
    </div>
  );
};
