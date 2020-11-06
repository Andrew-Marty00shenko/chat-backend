import express from 'express';
import { UserModel } from '../models';

export default (_: express.Request, __: express.Response, next: express.NextFunction) => {
    UserModel.findOneAndUpdate({ _id: '5fa3eda73ae8f50980db9d9c' }, {
        fullname: "asd",
        last_seen: new Date()
    }, {
        new: true
    },
        () => { }
    );
    next();
}