// const ws = new WebSocket('ws://localhost:8080/api/v1/message/ws');

// ws.onopen = function() {
//     console.log('сокет есть')
// }

// ws.onerror = function(error) {
//   console.log("Ошибка " + error.message);
// };

// ws.onclose = function(event) {
//     console.log("WebSocket соединение закрыто. Код:", event.code, "Причина:", event.reason, "Was clean:", event.wasClean);
// };



let globalWs = null;

export function initWebSocket() {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        return globalWs;
    }

    globalWs = new WebSocket('ws://localhost:8080/api/v1/message/ws');

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