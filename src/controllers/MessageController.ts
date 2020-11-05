import express from 'express';
import { MessageModel } from '../models'

class MessageController {
    index(req: express.Request, res: express.Response) {
        const dialogId: any = req.query.dialog;

        MessageModel.find({ dialog: dialogId })
            .populate(["dialog"])
            .exec((err: any, messages: any) => {
                if (err) {
                    return res.status(404).json({
                        status: "error",
                        message: "Messages not found",
                    });
                }
                res.json(messages);
            });
    }

    create(req: express.Request, res: express.Response) {
        const userId = '5fa3eda73ae8f50980db9d9c';

        const postData = {
            text: req.body.text,
            dialog: req.body.dialog_id,
            user: userId,
        };

        const message = new MessageModel(postData);
        message
            .save()
            .then((obj: any) => {
                res.json(obj);
            }).catch((reason: any) => {
                res.json(reason);
            });
    }

    delete(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        MessageModel.findOneAndRemove({ _id: id })
            .then((message: any) => {
                if (message) {
                    res.json({
                        message: `Message deleted`
                    });
                }
            })
            .catch(() => {
                res.json({
                    message: 'Message not found'
                });
            });
    }
}

export default MessageController;