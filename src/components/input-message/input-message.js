import { getWebSocket } from '@api/modules/websocket';

export async function inputMessage(){
    const input = document.querySelector('#inputMessage');
    const send = document.querySelector('#sendBtn')

    const container = document.querySelector('.inputMessage');
    if (!container) return;
    const chatId = container.dataset.inputmessageId;

    input.addEventListener('input', () => {
        if (input.value.trim() === '') {
            send.disabled = true;
        } else {
            send.disabled = false;
        }
    })

    send.addEventListener('click', () => {
       sendMessage(input.value, chatId);
        input.value = '';
        send.disabled = true;
    })
}

async function sendMessage(text, chatId){
    const ws = getWebSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket не подключён или не готов к отправке');
        return;
    }


    const message = {
        text: text,
        created_at: new Date().toISOString(),
        chat_id: chatId
    }

    ws.send(JSON.stringify(message))
}
