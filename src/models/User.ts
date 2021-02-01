import mongoose, { Schema, Document } from 'mongoose';
import isEmail from "validator/lib/isEmail";
import { generatePasswordHash } from '../utils';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import { parseISO } from 'date-fns';

export interface IUser extends Document {
    email: string;
    fullname: string;
    password: string;
    confirmed: boolean;
    avatar: string;
    confirm_hash: string;
    last_seen: Date;
    data?: IUser;
}

const UserSchema = new Schema({
    email: {
        type: String,
        require: 'Email address is required',
        validate: [isEmail, 'Invalid email'],
        unique: true
    },
    fullname: {
        type: String,
        required: 'Fullname address is required'
    },
    password: {
        type: String,
        required: 'Password address is required'
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    avatar: String,
    confirm_hash: String,
    last_seen: {
        type: Date,
        default: new Date()
    },
}, {
    timestamps: true
});

UserSchema.virtual('isOnline').get(function (this: any) {
    let date: any = new Date();
    return differenceInMinutes(parseISO(date.toISOString()), this.last_seen) < 5;
});

UserSchema.set('toJSON', {
    virtuals: true
});

UserSchema.pre<IUser>("save", async function (next) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const user: any = this;

    if (!user.isModified("password")) {
        return next();
    }

    user.password = await generatePasswordHash(user.password);
    user.confirm_hash = await generatePasswordHash(new Date().toString());
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;