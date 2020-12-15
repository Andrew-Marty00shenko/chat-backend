import express from 'express';
import bcrypt from 'bcrypt';
import socket from 'socket.io';

import { UserModel } from '../models';
import { createJWTToken } from '../utils';
import { validationResult } from 'express-validator';
import { userInfo } from 'os';

class UserController {
    io: socket.Server;

    constructor(io: socket.Server) {
        this.io = io
    }
    // constructor() {
    //     io.on('connection', (socket: any) => {

    //     })
    // }

    show = (req: express.Request, res: express.Response) => {
        const id: string = req.params.id;
        UserModel.findById(id, (err, user) => {
            if (err) {
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            res.json(user);
        });
    }

    verify = (req: express.Request, res: express.Response) => {
        const hash: any = req.query.hash;

        if (!hash) {
            return res.status(404).json({
                message: 'Invalid hash'
            });
        } else {

            UserModel.findOne({ confirm_hash: hash }, (err: any, user: any) => {
                if (err || !user) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'hash Not found'
                    });
                }

                user.confirmed = true;

                user.save((err: any) => {
                    if (err) {
                        return res.status(404).json({
                            status: 'error',
                            message: err
                        })
                    }
                    res.json({
                        status: 'success',
                        message: 'Аккаунт успешно подтвержден!'
                    });
                });
            });
        }
    }

    getMe = (req: express.Request, res: express.Response) => {
        const id = req.user;
        UserModel.findById(id, (err, user: any) => {
            if (err) {
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            console.log(user.isOnline)
            res.json(user);
        });
    }

    delete = (req: express.Request, res: express.Response) => {
        const id: string = req.params.id;
        UserModel.findOneAndRemove({ _id: id })
            .then((user) => {
                if (user) {
                    res.json({
                        message: `User ${user.fullname} deleted`
                    });
                }
            })
            .catch(() => {
                res.json({
                    message: 'User not found'
                });
            });
    }

    create = (req: express.Request, res: express.Response) => {
        const postData = {
            email: req.body.email,
            fullname: req.body.fullname,
            password: req.body.password
        };

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const user = new UserModel(postData);

        user.save().then((obj: any) => {
            res.json(obj);
        }).catch((reason) => {
            res.status(500).json({
                status: 'error',
                message: reason
            })
        });
    }

    login = (req: express.Request, res: express.Response) => {
        const postData = {
            email: req.body.email,
            password: req.body.password
        };

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        UserModel.findOne({ email: postData.email }, (err, user: any) => {
            if (err || !user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (bcrypt.compareSync(postData.password, user.password)) {
                const token = createJWTToken(user);
                res.json({
                    status: 'success',
                    token
                });
            } else {
                res.status(403).json({
                    status: 'error',
                    message: 'incorect password or email'
                });
            }
        });
    }
}

export default UserController;