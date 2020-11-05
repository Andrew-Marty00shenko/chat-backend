import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    text: {
        type: string;
        require: boolean;
    };
    dialog: string;
    unread: {
        type: boolean;
        default: boolean
    };
}

const MessageSchema = new Schema({
    text: { type: String, require: Boolean },
    dialog: { type: Schema.Types.ObjectId, ref: 'Dialog', require: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', require: true },
    unread: {
        type: Boolean,
        default: false
    },
    //attachments:
}, {
    timestamps: true
});

const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;