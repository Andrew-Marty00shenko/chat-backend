const socket = require('socket.io');
import http from 'http';

export default (http: http.Server) => {

    const io = socket(http, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    })

    io.on('connection', function (socket: any) {
        socket.on('DIALOGS:JOIN', (dialogId: string) => {
            socket.dialogId = dialogId;
            socket.join(dialogId);
        });
        socket.on('DIALOGS:TYPING', (obj: any) => {
            socket.broadcast.emit('DIALOGS:TYPING', obj);
        });
    });

    return io;
}