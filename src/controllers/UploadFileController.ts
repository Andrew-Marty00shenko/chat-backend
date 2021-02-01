import express from 'express';
import cloudinary from '../core/cloudinary';
import { UploadFileModel } from '../models';
import { IUploadFile, IUploadFileDocument } from "../models/UploadFile";

class UploadFileController {

    create = (req: express.Request, res: express.Response): void => {
        const userId: any = req.user;
        const file: any = req.file;

        cloudinary.v2.uploader
            .upload_stream(
                { resource_type: "auto" },
                (
                    error: any,
                    result: any
                ) => {
                    if (error || !result) {
                        return res.status(500).json({
                            status: "error",
                            message: error || "upload error",
                        });
                    }

                    const fileData: any = {
                        filename: result.original_filename,
                        size: result.bytes,
                        ext: result.format,
                        url: result.url,
                        user: userId,
                    };

                    const uploadFile: IUploadFileDocument = new UploadFileModel(fileData);

                    uploadFile
                        .save()
                        .then((fileObj: IUploadFile) => {
                            res.json({
                                status: "success",
                                file: fileObj,
                            });
                        })
                        .catch((err: any) => {
                            res.json({
                                status: "error",
                                message: err,
                            });
                        });
                }
            )
            .end(file.buffer);
    };

    delete = (req: express.Request, res: express.Response): void => {
        const fileId: any = req.user;
        UploadFileModel.deleteOne({ _id: fileId }, function (err: any) {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: err,
                });
            }
            res.json({
                status: "success",
            });
        });
    };
}

export default UploadFileController;