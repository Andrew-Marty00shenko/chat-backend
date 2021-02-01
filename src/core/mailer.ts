import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const options = {
    // host: process.env.NODEMAILER_HOST || 'smtp.mailtrap.io',
    // port: Number(process.env.NODEMAILER_PORT) || 2525,
    // auth: {
    //     user: 'd4799fdb2afe5a',
    //     pass: 'f5c604cd3b41aa'
    // }
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS // naturally, replace both with your real credentials or an application-specific password
    }
};

const transport = nodemailer.createTransport(options);

export default transport;