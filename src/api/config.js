export const SERVER_API = `${location.origin}/api/v1/`;

const WEBSOCKET_ADDRESS = location.hostname === 'localhost' ? 'localhost:3000' : location.hostname;
export const WEBSOCKET = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${WEBSOCKET_ADDRESS}`;
