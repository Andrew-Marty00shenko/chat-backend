import mongoose from "mongoose";
const dotenv = require("dotenv");

dotenv.config()

mongoose.connect(process.env.MONGODB_URI || '',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    },
    (err: any) => {
        if (err) {
            throw Error(err);
        }
    }
);