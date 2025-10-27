import { io } from 'socket.io-client';

// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://192.168.137.1:5051/';
const URL = process.env.NODE_ENV === 'production' ? undefined : 'https://iot.vcompcenter.com/';

export const socket = io(URL, {
    autoConnect: false
});
