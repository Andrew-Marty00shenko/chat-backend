import express from 'express';
import { DialogModel, MessageModel } from '../models'

class DialogController {
    index(req: express.Request, res: express.Response) {
        const authorId = '5fa3eda73ae8f50980db9d9c';

        DialogModel
            .find({ author: authorId })
            .populate(['author', 'partner'])
            .exec((err: any, dialogs: any) => {
                if (err) {
                    return res.status(404).json({
                        message: 'Dialogs not found'
                    });
                }
                return res.json(dialogs);
            });
    }

    create(req: express.Request, res: express.Response) {
        const postData = {
            author: req.body.author,
            partner: req.body.partner,
        };
        const dialog = new DialogModel(postData);
        dialog
            .save()
            .then((dialogObj: any) => {
                const message = new MessageModel({
                    text: req.body.text,
                    dialog: dialogObj._id,
                    user: req.body.author
                });

                message
                    .save()
                    .then(() => {
                        res.json(dialogObj)
                    })
                    .catch((reason: any) => {
                        res.json(reason);
                    });
            })
            .catch((reason: any) => {
                res.json(reason);
            });
    }

    delete(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        DialogModel.findOneAndRemove({ _id: id })
            .then((dialog: any) => {
                if (dialog) {
                    res.json({
                        message: `Dialog deleted`
                    });
                }
            })
            .catch(() => {
                res.json({
                    message: 'Dialog not found'
                });
            });
    }
}

export default DialogController;