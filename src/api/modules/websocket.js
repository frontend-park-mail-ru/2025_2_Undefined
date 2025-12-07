import {WEBSOCKET} from '@api/config.js';

let globalWs = null;

export function initWebSocket() {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        console.log('popa')
        return globalWs;
    }

    
    globalWs = new WebSocket(`${WEBSOCKET}/api/v1/message/ws`);    
    
    globalWs.onopen = () => console.log('WebSocket подключён', globalWs);

    // globalWs.onmessage = (event) => {
    //     console.log('01010101010101010110111011010')
    //     const data = event.data;
    //     const message = JSON.parse(data);
    
    //     console.log('Прислали сообщение:', message);
    // }

    globalWs.onerror = (error) => console.log('WebSocket ошибка:', error);

    globalWs.onclose = (event) => {
        console.log('WebSocket закрыт:', event);
        globalWs = null;
    };

    return globalWs;
}

export function getWebSocket() {
    return globalWs;
}

export function closeWebSocket() {
    if (globalWs) {
        if (globalWs.readyState === WebSocket.OPEN || globalWs.readyState === WebSocket.CONNECTING) {
            globalWs.close(1000, 'Client closed connection'); 
        }
        globalWs = null;
        console.log('WebSocket закрыт и сброшен');
    } else {
        console.log('Нет активного WebSocket для закрытия');
    }
}