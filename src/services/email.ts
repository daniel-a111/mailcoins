
import nodemailer from 'nodemailer';


export const smtpConfig = {
    // host: process.env.MAILER_IMAP_HOST,
    // port: parseInt(process.env.MAILER_SMTP_PORT),
    // user: process.env.MAILER_IMAP_USER,
    // pass: process.env.MAILER_IMAP_PASS,
    // auth: {
    //     user: process.env.MAILER_IMAP_USER,
    //     pass: process.env.MAILER_IMAP_PASS,
    // },
    // secure: true,
    // tls: true

    user: 'coin.in.mail1@gmail.com',
    password: 'taseuhkopyniqxwz',
    pass: 'taseuhkopyniqxwz',
    auth: {
        user: 'coin.in.mail1@gmail.com',
        password: 'taseuhkopyniqxwz',
        pass: 'taseuhkopyniqxwz',
    },
    host: "smtp.gmail.com", // hostname
    port: 587,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    }
}


export const prepareTransporter = () => {
    return nodemailer.createTransport(smtpConfig);
}
// let configOptions = {
//     host: "smtp.example.com",
//     port: 587,
//     tls: {
//         rejectUnauthorized: true,
//         minVersion: "TLSv1.2"
//     }
// }

// const pass = 'pialifjdduebyavu';


// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'assa.daniel@gmail.com',
//         pass
//     }
// });

// const mailOptions = {
//     from: 'assa.daniel@gmail.com',
//     to: 'assa.daniel@gmail.com',
//     subject: 'Subject',
//     text: 'Email content'
// };

// export const sendMail = async (to: string, subject: string, text: string) => {
//     if (config.SEND_EMAILS) {
//         const info = await transporter.sendMail({ ...mailOptions, to, subject, html: text });
//         console.log({ info });
//     } else {
//         logger.info(`send mail disabled: ${JSON.stringify({ ...mailOptions, to, subject, html: text })}`);
//     }
// }
