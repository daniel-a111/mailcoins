
const Imap = require('imap');
const { simpleParser } = require('mailparser');

var nodeoutlook = require('nodejs-nodemailer-outlook')


const MESSAGE = './ariel/data/message.txt';
async function fetchIncome() {

    // const res = await nodeoutlook.sendEmail({
    //     auth: {
    //         user: "office@mailcoins.co",
    //         pass: 'Wjuw4vU4QDydithvB1Vj'
    //     },
    //     from: 'office@mailcoins.co',
    //     to: 'assa.daniel@gmail.com',
    //     subject: 'Hey you, awesome!',
    //     html: '<b>This is bold text</b>',
    //     text: 'This is text version!',

    // });

    // imap.gmail.com
    // console.log({ res });

    // process.exit(0);
    //     BOOK@ONLYTRAVELTECH.CO
    // $v4)m4~C#3t}
    // const imapConfig = {
    //     // service: "goDaddy",
    //     host: "giow1084.siteground.us",
    //     // host: "book@onlytraveltech.c",
    //     port: 993,
    //     secure: true,
    //     // requireTLS: true,
    //     user: 'book@onlytraveltech.co',
    //     password: '$v4)m4~C#3t}',
    //     // auth: {
    //     //     user: 'book@onlytraveltech.co',
    //     //     pass: '$v4)m4~C#3t}',
    //     //     //    user: "admin@hengeproperties.co.uk",
    //     //     //    pass: "xxxxx" 
    //     // },
    //     tls: true
    //     // tls: {
    //     //     ciphers: 'SSLv3',
    //     //     rejectUnauthorized: false
    //     // }
    // };

    // const imapConfig = {
    //     host: "smtp-mail.outlook.com", // hostname
    //     port: 587,
    //     tls: true,
    //     auth: {
    //         user: "office@mailcoins.co",
    //         pass: 'Wjuw4vU4QDydithvB1Vj'
    //     }
    // };

    // const imapConfig = {
    //     host: "imap.gmail.com", // hostname
    //     port: 993,
    //     tls: true,
    //     auth: {
    //         user: "office@mailcoins.co",
    //         pass: 'Wjuw4vU4QDydithvB1Vj'
    //     }
    // };




    const imapConfig = {
        user: 'coin.in.mail1@gmail.com',
        password: 'taseuhkopyniqxwz',
        host: "imap.gmail.com", // hostname
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        }
    };

    // console.log({ imapConfig2 });

    return new Promise<any[]>(async (acc: Function, rej: Function) => {
        // var transport = nodemailer.createTransport({
        //     host: "smtp-mail.outlook.com", // hostname
        //     secureConnection: false, // TLS requires secureConnection to be false
        //     port: 587, // port for secure SMTP
        //     auth: {
        //         user: "office@mailcoins.co",
        //         pass: 'Wjuw4vU4QDydithvB1Vj'
        //     },
        //     tls: {
        //         ciphers: 'SSLv3'
        //     }
        // });
        // const message = {
        //     from: "office@mailcoins.co",
        //     to: "assa.daniel@gmail.com",
        //     subject: "Message title",
        //     text: "Plaintext version of the message",
        //     html: "<p>HTML version of the message</p>"
        // };
        // // await transport.readMail();
        // // await transport.
        // console.log(transport.transporter);
        try {
            const incomes: any[] = [];
            const imap = new Imap(imapConfig);
            imap.once('ready', () => {
                imap.openBox('INBOX', false, () => {
                    // imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
                    imap.search(['UNSEEN'], (err, results) => {
                        try {
                            const f = imap.fetch(results, { bodies: '' });
                            f.on('message', msg => {
                                msg.on('body', stream => {
                                    simpleParser(stream, async (err, parsed) => {
                                        // const {from, subject, textAsHtml, text} = parsed;
                                        try {
                                            const { text, subject, date, from: { value: [{ address: from }] }, to: { value: [{ address: to }] }, messageId } = parsed;
                                            const participants = parsed.to.value.map((t: any) => t.address);
                                            console.log({ participants })
                                            // process.exit(0);
                                            incomes.push({ text, subject, date, from, to, messageId });
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    });
                                });
                                // msg.once('attributes', attrs => {
                                //     const { uid } = attrs;
                                //     // imap.addFlags(uid, ['\\Seen'], () => {
                                //     //     // Mark the email as read after reading it
                                //     //     console.log('Marked as read!');
                                //     // });
                                // });
                            });

                            f.once('error', ex => {
                                return Promise.reject(ex);
                            });
                            f.once('end', () => {
                                console.log('Done fetching all messages!');
                                imap.end();
                                console.log({ incomes });
                                // acc(incomes);
                            });
                        } catch (e: any) {
                            // console.error(e);
                            rej(e);
                        }

                    });
                });
            });

            imap.once('error', err => {
                console.log(err);
            });

            imap.once('end', () => {
                console.log('Connection ended');
                acc(incomes);
            });

            imap.connect();
        } catch (ex) {
            console.log('an error occurred');
            rej(ex);
        }
    });
}

export const fetchTransactions = async () => {
    const inbox = await fetchIncome();
    console.log({ inbox });
    return inbox;
}

