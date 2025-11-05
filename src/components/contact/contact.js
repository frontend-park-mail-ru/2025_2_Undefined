import { app } from '@/main.js';
import Chat from '@api/modules/chats.js';

export async function startNewDialog() {
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', async () => {
            const clickedItem = event.target.closest('.contact-item');

            if (clickedItem) {
                const contactData = {
                    members: [
                        {
                            user_id: clickedItem.dataset.contactId,
                            role: 'admin'
                        },
                        {
                            user_id: app.user.id,
                            role: 'admin'
                        }
                    ],
                    name: 'pew pew pew'
                    
                };

                await Chat.createChat(contactData);
            }
        })
    })
}