
import express from 'express';
import socket from 'socket.io';

import { MessageModel, DialogModel } from '../models';
import { IMessage } from "../models/Message";

class MessageController {
    io: socket.Server;

    constructor(io: socket.Server) {
        this.io = io
    }

    updateReadStatus = (
        res: express.Response,
        userId: string,
        dialogId: string
    ): void => {
        MessageModel.updateMany(
            { dialog: dialogId, user: { $ne: userId } },
            { $set: { read: true } },
            (err: any): void => {
                if (err) {
                    res.status(500).json({
                        status: "error",
                        message: err,
                    });
                } else {
                    this.io.emit("SERVER:MESSAGES_READED", {
                        userId,
                        dialogId,
                    });
                }
            }
        );
    };

    index = (req: express.Request, res: express.Response) => {
        const dialogId: any = req.query.dialog;
        const userId: any = req.user;

        this.updateReadStatus(res, userId, dialogId);

        MessageModel.find({ dialog: dialogId })
            .populate(["dialog", "user", "attachments"])
            .exec(function (err, messages) {
                if (err) {
                    return res.status(404).json({
                        status: "error",
                        message: "Messages not found",
                    });
                }
                res.json(messages);
            });
    }

    create = (req: express.Request, res: express.Response): void => {
        const userId = req.user;

        const postData = {
            text: req.body.text,
            dialog: req.body.dialog_id,
            user: userId,
            attachments: req.body.attachments
        };

        const message = new MessageModel(postData);

        message
            .save()
            .then((obj: any) => {
                obj.populate('dialog user attachments',
                    (err: any, message: IMessage) => {
                        if (err) {
                            return res.status(500).json({
                                status: "error",
                                message: err
                            });
                        }

                        DialogModel.findOneAndUpdate(
                            { _id: postData.dialog },
                            { lastMessage: message._id },
                            { upsert: true },
                            function (err) {
                                if (err) {
                                    return res.status(500).json({
                                        status: "error",
                                        message: err,
                                    });
                                }
                            }
                        );

                        res.json(message);
                        this.io.emit('SERVER:NEW_MESSAGE', message)
                    });

            }).catch((reason: any) => {
                res.json(reason);
            });
    }

    delete = (req: express.Request, res: express.Response): void => {
        const id = req.query.id;
        const userId = req.user;

        MessageModel.findById(id, (err, message: any) => {
            if (err || !message) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Message not found'
                });
            }

            if (message.user.toString() === userId) {

                const dialogId = message.dialog;
                message.remove();

                MessageModel.findOne(
                    { dialog: dialogId },
                    { sort: { 'created_at': -1 } },
                    (err, lastMessage) => {
                        if (err) {
                            res.status(500).json({
                                status: 'error',
                                message: err
                            });
                        }

                        DialogModel.findById(dialogId, (err, dialog) => {
                            if (err) {
                                res.status(500).json({
                                    status: 'error',
                                    message: err
                                });
                            }

                            if (!dialog) {
                                return res.status(404).json({
                                    status: 'not found',
                                    message: err
                                });
                            }

                            dialog.lastMessage = lastMessage ? lastMessage.toString() : "";
                            dialog.save();
                        });
                    });

                return res.json({
                    status: 'success',
                    message: 'Message deleted'
                });
            } else {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not have permission'
                });
            }
        });
    }
}

export default MessageController;