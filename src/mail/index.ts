import { Mail } from "../models";

const Imap = require('imap');
const { simpleParser } = require('mailparser');

interface MailMessage {
    id: string;
    from: string;
    to: string;
    subject: string;
    text: string;
    date: Date;
}
class MailFetcher {
    messages: MailMessage[] = [];
    seenIds: Set<string> = new Set();
    attrs: { [index: string]: any } = {};
    uids: { [index: number]: number } = {};

    imap: any;
    closed: boolean = false;
    constructor(imap: any) {
        this.imap = imap;
    }

    // open() { }

    async close() {
        if (this.closed) {
            throw new Error('aleady closed');
        }
        this.closed = true;
        console.log(this.messages);
        for (const message of this.messages) {
            console.log({ message });

            // process.exit(0);
            await Mail.create({ ...message });
        }
        // process.exit(0);

        this.imap.end();
    }

    add(idx: number, message: MailMessage) {
        if (this.seenIds.has(message.id)) {
            throw new Error(`${message.id} already exists.`);
        }
        this.seenIds.add(message.id);
        this.messages.push(message);
    }

    attr(idx: number, uid: number) {
        this.uids[idx] = uid;
    }


    wait() {

    }
}

async function fetchIncome() {
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
    return new Promise<any[]>(async (acc: Function, rej: Function) => {
        const imap = new Imap(imapConfig);
        try {
            const incomes: any[] = [];
            const fetcher = new MailFetcher(imap);
            let i = 0;
            imap.once('ready', () => {
                imap.openBox('INBOX', false, () => {
                    // imap.search(['UNSEEN'], (err, results) => {
                    imap.search(['UNSEEN'], (err, results) => {
                        try {
                            const f = imap.fetch(results, { bodies: '' });

                            // f.on('open', () => {
                            //     console.log('OPEN!');
                            //     process.exit(0);
                            // });
                            f.on('message', (msg: any) => {
                                msg.idx = i++;
                                console.log({ msg });
                                // console.log(msg.)
                                // process.exit(0);
                                msg.on('body', stream => {
                                    simpleParser(stream, async (err, parsed) => {
                                        try {
                                            const { text, subject, date, from: { value: [{ address: from }] }, to: { value: [{ address: to }] }, messageId: id } = parsed;
                                            fetcher.add(msg.idx, { text, subject, date, from, to, id })
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    });
                                });
                                msg.once('attributes', async (attrs: any) => {
                                    const { uid } = attrs;

                                    // await Mail.fi
                                    fetcher.attr(msg.idx, uid);
                                    // console.log({ id, from, to, subject, text, date });
                                    // await Mail.create({ id, from, to, subject, text, date });
                                    imap.addFlags(uid, ['\\Seen'], async () => {
                                        // Mark the email as read after reading it
                                        console.log('Marked as read!');
                                    });
                                });
                            });

                            f.once('error', ex => {
                                return Promise.reject(ex);
                            });
                            f.once('end', async () => {
                                console.log('Done fetching all messages!');
                                imap.end();
                                acc(incomes);
                            });
                        } catch (e: any) {
                            // console.error(e);
                            try {
                                imap.end();
                            } catch { }
                            rej(e);
                        }

                    });
                });
            });

            imap.once('error', err => {
                console.log(err);
            });

            imap.once('end', async () => {
                console.log('Connection ended');
                await fetcher.close();

                acc(true);
            });

            imap.connect();
        } catch (ex) {
            console.log('an error occurred');
            rej(ex);
        }
    });
}

export const fetchTransactions = async () => {
    try {
        const inbox = await fetchIncome();
        console.log({ inbox });
        return inbox;
    } catch (e) {
        if (e.message !== 'Nothing to fetch') {
            console.log(e.message);
            process.exit(0);
        }
    }
}

