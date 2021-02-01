import express from 'express';
import bcrypt from 'bcrypt';
import socket from 'socket.io';

import mailer from '../core/mailer';
import { UserModel } from '../models';
import { IUser } from "../models/User";
import { createJWTToken } from '../utils';
import { SentMessageInfo } from "nodemailer/lib/sendmail-transport";
import { validationResult, Result, ValidationError } from 'express-validator';

class UserController {
    io: socket.Server;

    constructor(io: socket.Server) {
        this.io = io
    }

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

    verify = (req: express.Request, res: express.Response): void => {
        const hash: any = req.query.hash;

        if (!hash) {
            res.status(422).json({ errors: "Invalid hash" });
        } else {
            UserModel.findOne({ confirm_hash: hash }, (err: any, user: IUser) => {
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
                        });
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
        UserModel.findById(id, (err, user: IUser) => {
            if (err || !user) {
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            res.json(user);
        });
    }

    delete = (req: express.Request, res: express.Response): void => {
        const id: string = req.params.id;
        UserModel.findOneAndRemove({ _id: id })
            .then((user: IUser | null) => {
                if (user) {
                    res.json({
                        message: `User ${user.fullname} deleted`
                    });
                } else {
                    res.status(404).json({
                        status: "error",
                    });
                }
            })
            .catch((err: any) => {
                res.json({
                    message: err
                });
            });
    }

    create = (req: express.Request, res: express.Response) => {
        const postData: { email: string; fullname: string; password: string } = {
            email: req.body.email,
            fullname: req.body.fullname,
            password: req.body.password
        };

        const errors: Result<ValidationError> = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const user = new UserModel(postData);

            user
                .save()
                .then((obj: IUser) => {
                    res.json(obj);
                    mailer.sendMail(
                        {
                            from: 'andriei.martyshienko@mail.ru',
                            to: postData.email,
                            subject: 'Подтверждение почты AndrewhaGramm',
                            html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:3000/signup/verify?hash=${obj.confirm_hash}">по этой ссылке</a>`,
                        },

                        (err: Error | null, info: SentMessageInfo) => {
                            console.log(obj.confirm_hash);
                            if (err) {
                                console.log(err, 123);
                            } else {
                                console.log(info);
                            }
                        }
                    );
                }).catch((reason) => {
                    res.status(500).json({
                        status: 'error',
                        message: reason
                    })
                });
        }
    };

    login = (req: express.Request, res: express.Response): void => {
        const postData: { email: string; password: string } = {
            email: req.body.email,
            password: req.body.password
        };

        const errors: Result<ValidationError> = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
        } else {
            UserModel.findOne({ email: postData.email }, (err, user: IUser) => {
                if (err || !user) {
                    return res.status(404).json({
                        message: 'User not found'
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
                        status: 'err',
                        message: 'Incorrect password or email'
                    });
                }
            });
        }
    }

    findUsers = (req: express.Request, res: express.Response) => {
        const query: any = req.query.query;

        UserModel.find()
            .or([
                { fullname: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ])
            .then((users: IUser[]) => {
                res.json(users);
            }).catch((err: any) => {
                return res.status(404).json({
                    status: 'error',
                    message: err
                });
            });
    }
}

export default UserController;