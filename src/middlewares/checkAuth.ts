import express from 'express';
import { IUser } from '../models/User';
import { verifyJWTToken } from '../utils';

export default (req: any, res: any, next: any) => {
    const token = req.headers.token;

    if (token) {
        verifyJWTToken(token)
            .then((user) => {
                req.user = user
                next();
            })
            .catch(() => {
                res.status(403).json({ message: "Invalid auth token provided." });
            });
    }
}