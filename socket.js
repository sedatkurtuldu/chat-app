import { io } from 'socket.io-client';

export const socket = io('http://192.168.1.207:3000'); // LOCAL İÇİN PC'NİN IP'Sİ CANLI İÇİN DE SERVER'IN