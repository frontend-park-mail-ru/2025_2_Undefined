import React from 'minireact';
import { getPlaceholder } from '@components/avatar/avatar.js';
import Chat from '@api/modules/chats.js';
export const ContactItem = ({ id, name, placeholder, onClick, contactsFor }) => {

  const addUser = async (contactId) => {
    try {
      const requestData = {
        members: [
          {
            role: "admin",
            user_id: contactId
          }
        ]
      };
      console.log('Данные о добавлении', requestData, contactsFor.chatId)
      await Chat.addToGroup(requestData, contactsFor.chatId);
    } catch (err) {
      console.warn(err)
    }
    onClick();
  }

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
    const chat = await Chat.getChat(dialogWithContactId.id);

    onClick(chat);
  }

  return (
    <div class="contact-item" data-contact-id={id} onClick={() => {
      if (contactsFor.action === 'dialog') startDialog(id);
      else if (contactsFor.action === 'add') addUser(id);
    }}>
      <div class="contact-avatar">
        <div class="avatar-placeholder">{placeholder || getPlaceholder(name)}</div>
      </div>
      <div class="contact-info">
        <div class="contact-name">{name}</div>
      </div>
    </div>
  );
};
