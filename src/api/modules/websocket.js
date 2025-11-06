import {WEBSOCKET} from '@api/config.js';

let globalWs = null;

export function initWebSocket() {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        return globalWs;
    }

    
    globalWs = new WebSocket(`${WEBSOCKET}/api/v1/message/ws`);    

    globalWs.onopen = () => console.log('WebSocket подключён');

    globalWs.onmessage = (event) => {
        const data = event.data;
        const message = JSON.parse(data);
    
        console.log('Прислали сообщение: ' + message.text);
    }

    globalWs.onerror = (error) => console.log('WebSocket ошибка:', error);

    globalWs.onclose = (event) => {
        console.log('WebSocket закрыт:', event);
    };

    return globalWs;
}

export function getWebSocket() {
    return globalWs;
}