import { Server } from 'socket.io';
import express from 'express';
import {createServer} from 'http';
import Connection from './database/db.js';

import { getDocument, updateDocument } from './controller/document-controller.js'

const URL = process.env.MONGODB_URI || `mongodb+srv://ankitadhakad03:ankitadhakad03@text-editor.orj1or5.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 9000;
    
Connection(URL);

const app = express();
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));
}
const httpServer = createServer(app);
httpServer.listen(PORT);

const io = new Server(httpServer);

io.on('connection', socket => {
    socket.on('get-document', async documentId => {
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })

        socket.on('save-document', async data => {
            await updateDocument(documentId, data);
        })
    })
});