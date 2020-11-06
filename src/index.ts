import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { UserController, DialogController, MessageController } from './controllers';
import { updateLastSeen, checkAuth } from './middlewares'

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(updateLastSeen);
app.use(checkAuth);

const User = new UserController();
const Dialog = new DialogController();
const Message = new MessageController();

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

process.on('unhandledRejection', (...args) => console.error(...args));

app.get('/user/:id', User.show);
app.post('/user/registration', User.create);
app.post('/user/login', User.login);
app.delete('/user/:id', User.delete);

app.get('/dialogs', Dialog.index);
app.post('/dialogs', Dialog.create);
app.delete('/dialogs/:id', Dialog.delete);

app.get('/messages', Message.index);
app.post('/messages', Message.create);
app.delete('/messages/:id', Message.delete);

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`)
});