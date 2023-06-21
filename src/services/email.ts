
import nodemailer from 'nodemailer';
import * as config from "../config";
import { logger } from '../logger';

let configOptions = {
    host: "smtp.example.com",
    port: 587,
    tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
    }
}

const pass = 'pialifjdduebyavu';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'assa.daniel@gmail.com',
        pass
    }
});

const mailOptions = {
    from: 'assa.daniel@gmail.com',
    to: 'assa.daniel@gmail.com',
    subject: 'Subject',
    text: 'Email content'
};

export const sendMail = async (to: string, subject: string, text: string) => {
    if (config.SEND_EMAILS) {
        const info = await transporter.sendMail({ ...mailOptions, to, subject, html: text });
        console.log({ info });
    } else {
        logger.info(`send mail disabled: ${JSON.stringify({ ...mailOptions, to, subject, html: text })}`);
    }
}
