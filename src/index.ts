import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';

import { UserController } from './controllers';

const app = express();

app.use(bodyParser.json());

const User = new UserController();

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
});

app.get('/user/:id', User.show);
app.post('/user/registration', User.create);
app.delete('/user/:id', User.delete);

app.listen(3000, () => {
    console.log(`Example app listening at http://localhost:${3000}`)
});