import "./env";

import nodemailer from 'nodemailer';



import { VM, getOrLoad } from "scaas/src/vm/vm";

import "./src/config";
import { fetchTransactions } from "./src/mail";
import { Mail, sequelize } from "./src/models";

import * as contracts from "./src/contracts";
import { State } from "./src/contracts/coin";



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



const processActions = async (vm: VM) => {

    try {
        const txs = await fetchTransactions();
        for (const tx of txs) {
            const m: any = await Mail.findByPk(tx.messageId);
            if (!m || !m.processed) {
                const { from, to, text, subject } = tx;
                let fromAcc: any = await vm.getUserByEmail(from, '0000');
                let toAcc: any = await vm.getUserByEmail(to, '0000');
                if (!fromAcc) {
                    await vm.genUser({ name: from, email: from, pass: '123', userId: '0000' });
                }
                if (!toAcc) {
                    await vm.genUser({ name: to, email: to, pass: '123', userId: '0000' });
                }
                fromAcc = await vm.getUserByEmail(from, '0000');
                toAcc = await vm.getUserByEmail(to, '0000');
                console.log({ fromAcc, toAcc });
                // process.exit(0);
                let parts = text.split('\n');
                parts.map((p: any) => p.trim());

                let coin: any = await State.bind(undefined).findOne({ where: { owner: fromAcc.id }, raw: true });
                const ses = await vm.login(from, '123');
                let transporter = nodemailer.createTransport(smtpConfig);

                switch (subject.toLowerCase()) {
                    case 'deploy':
                        const name = parts[0];
                        const symbol = parts[1];

                        await vm.deploy(contracts.coin.deploy, {
                            name, symbol
                        }, ses);

                        let info = await transporter.sendMail({
                            sender: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                            to: from, // list of receivers
                            subject: "Hello ✔", // Subject line
                            html: `Coin "${name} with symbol "${symbol}" deployed successfully`,
                            replyTo: from,
                            inReplyTo: tx.messageId
                        });

                        // console.log({ name, symbol });
                        // process.exit(0);
                        break;
                    case 'mint':
                        {
                            const symbol = parts[0];
                            coin = await State.bind(undefined).findOne({ where: { symbol }, raw: true });
                            // console.log({ coin });
                            // if (!coin) {
                            //     throw new Error("Asdfsadf");
                            // }
                            // process.exit(0);

                            const amount = parts[1];
                            await vm.action(coin.contractId, contracts.coin.mint, { addr: toAcc.id, amount: amount }, ses);
                            await transporter.sendMail({
                                from: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                                to, // list of receivers
                                subject: "Hello ✔", // Subject line
                                html: `You got minted with coin symbol "${coin.symbol}"<br /><br />` +
                                    `your current balance is: ${await vm.view(coin.id, contracts.coin.balanceOf, toAcc.id, ses)}`,
                                replyTo: to,
                                inReplyTo: tx.messageId
                            });
                            await transporter.sendMail({
                                from: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                                to: from, // list of receivers
                                subject: "Hello ✔", // Subject line
                                html: `You had minted ${to} with coin symbol "${coin.symbol}"<br /><br />` +
                                    `${to} current balance is: ${await vm.view(coin.id, contracts.coin.balanceOf, toAcc.id, ses)}`,
                                replyTo: from,
                                inReplyTo: tx.messageId
                            });
                        }
                        break;
                    case 'burn':
                        {
                            const symbol = parts[0];
                            coin = await State.bind(undefined).findOne({ where: { symbol }, raw: true });
                            const amount = parts[1];
                            await vm.action(coin.contractId, contracts.coin.burn, { addr: toAcc.id, amount: amount }, ses);
                            await transporter.sendMail({
                                from: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                                to, // list of receivers
                                subject: "Hello ✔", // Subject line
                                html: `You got burned with coin symbol "${coin.symbol}"<br /><br />` +
                                    `your current balance is: ${await vm.view(coin.id, contracts.coin.balanceOf, toAcc.id, ses)}`,
                                replyTo: to,
                                inReplyTo: tx.messageId
                            });
                            await transporter.sendMail({
                                from: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                                to: from, // list of receivers
                                subject: "Hello ✔", // Subject line
                                html: `You had burned ${to} with coin symbol "${coin.symbol}"<br /><br />` +
                                    `your current balance is: ${await vm.view(coin.id, contracts.coin.balanceOf, toAcc.id, ses)}`,
                                replyTo: from,
                                inReplyTo: tx.messageId
                            });
                        }
                        break;
                    case 'balanceOf':

                        break;
                    case 'name':
                        break;
                    case 'symbol':
                        break;
                    case 'transfer':
                        {
                            const symbol = parts[0];
                            coin = await State.bind(undefined).findOne({ where: { symbol }, raw: true });
                            const amount = parts[1];
                            await vm.action(coin.contractId, contracts.coin.transfer, { addr: toAcc.id, amount: amount }, ses);

                            await transporter.sendMail({
                                from: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                                to: from, // list of receivers
                                subject: "Hello ✔", // Subject line
                                html: `You transferred successfully with coin symbol "${coin.symbol}"<br /><br />` +
                                    `your current balance is: ${await vm.view(coin.id, contracts.coin.balanceOf, fromAcc.id, ses)}`,
                                replyTo: from,
                                inReplyTo: tx.messageId
                            });
                            await transporter.sendMail({
                                from: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                                to, // list of receivers
                                subject: "Hello ✔", // Subject line
                                html: `You have been got transfer from ${to} with coin symbol "${coin.symbol}"<br /><br />` +
                                    `${to} current balance is: ${await vm.view(coin.id, contracts.coin.balanceOf, toAcc.id, ses)}`,
                                replyTo: to,
                                inReplyTo: tx.messageId
                            });
                        }
                        break;
                    case 'transferFrom':
                        break;
                    case 'allowance':
                        break;
                    case 'approve':
                        break;
                }
                await Mail.create({ id: tx.messageId, processed: true });
            }
        }

    } catch (e: any) {
        console.error(e);
        process.exit(0);
    }

    setTimeout(() => {
        processActions(vm);
    }, 1000);
}

(async () => {
    let force = false;
    await sequelize.sync({ force });

    const vm: VM = await getOrLoad();
    processActions(vm);

})();


// import bodyParser from 'body-parser';
// import cors from 'cors';
// import express from 'express';
// import { getOrLoad, VM } from 'scaas/src/vm/vm';
// import { logger } from './src/logger';
// import { sequelize, Settings } from './src/models';
// import routes from './src/routes';
// import { initContracts } from './traveltech/contracts';

// const app = express();
// const port = 3000;


// // ws.connection.start();

// app.use(express.json({ limit: '25mb' }));
// app.use(express.urlencoded({ limit: '25mb' }));
// app.use(bodyParser.json());

// app.use(cors({
//     origin: '*', methods: '*'
// }));

// // app.use(fileUpload({
// //     createParentPath: true
// // }));
// // app.get('/', (req, res) => {
// //     res.send('Hello World!');
// // });

// // app.use('/', routes);
// app.use('/', routes);

// (async () => {
//     let force = false;
//     await sequelize.sync({ force });
//     console.log({ ...sequelize.sequlize })
//     console.log('!@!!@!@\n\n\n\n\n\n\n\n')
//     // await Account.destroy({ where: {} });
//     // const users = await Account.findAll();

//     // await initContracts();

//     logger.info('....');

//     const settings: any = await Settings.bind(undefined).findOne({ raw: true });
//     if (!settings) {
//         const vm: VM = await getOrLoad();

//         await vm.genUser({
//             name: 'Daniel',
//             email: 'assa.daniel@gmail.com',
//             pass: '123123123',
//             userId: '0000'
//         });

//         await vm.genUser({
//             name: 'Liad',
//             email: 'liad.shekel@gmail.com',
//             pass: '123123123',
//             userId: '0000'
//         });

//         // const login = await auth.login("assa.daniel@gmail.com", "123123123");
//         // const addr = await vm.deploy<any>(
//         //     contracts.agencies_manager.deploy,
//         //     {},
//         //     login
//         // )
//         // // await Settings.create({
//         // //     master: login.uid,
//         // //     agenciesManager: `${addr.id}`
//         // // });

//         // await vm.action<any, void>(
//         //     addr.id.toString(),
//         //     contracts.agencies_manager.addMember,
//         //     { email: 'lipnergroup@gmail.com' },
//         //     login
//         // )
//     }

//     if (force) {
//         // auth.registerAccount({
//         //   username: 'daniel',
//         //   email: 'assa.daniel@gmail.com',
//         //   password: '123123123'
//         // });
//     }
// })();


// app.listen(port, () => {
//     // sequelize.
//     return console.log(`Express is listening at http://localhost:${port}`);
// });