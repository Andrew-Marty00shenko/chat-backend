import express from 'express';
import { IUser } from '../models/User';
import { verifyJWTToken } from '../utils';

export default (req: any, res: any, next: any) => {
    const token = req.headers.token;

    if (req.path === '/user/signin' ||
        req.path === '/user/signup' ||
        req.path === '/user/verify'
    ) {
        return next();
    }

    verifyJWTToken(token)
        .then((user: any) => {
            req.user = user.data._doc._id;
            next();
        })
        .catch((err) => {
            res.status(403).json({ message: "Invalid auth token provided." });
        });
}