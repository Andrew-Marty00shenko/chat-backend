import nodemailer from 'nodemailer';

const options = {
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
};

const transport = nodemailer.createTransport(options);

export default transport;