import { app } from '@/main.js';
import Chat from '@api/modules/chats.js'
import { openChat } from '@components/chat/chat';

export async function startNewDialog(HomeData, homeInstance) {
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', async () => {
            const clickedItem = event.target.closest('.contact-item');

            const contactId = clickedItem.dataset.contactId;
            if (clickedItem) {
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
                    name: 'pew pew pew'
                    
                };

                console.log('Нажатие')
                
                let dialogWithContactId;
                try{
                    dialogWithContactId = await Chat.getChatByContact(contactId);
                    console.log('Это tryz')
                } catch {
                    console.log('begin')
                    
                    dialogWithContactId = await Chat.createChat(contactData);
                    console.log('Чат создан')
                }
                
                console.log(dialogWithContactId);
                const chat = await Chat.getChat(dialogWithContactId.id);

                homeInstance.renderChat(HomeData, chat.id, chat.messages);
                homeInstance.renderChats();
            }
        })
    })
}