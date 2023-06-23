// import {Event} from "scaas/models/"
// import { VM, getOrLoad } from "scaas/src/vm/vm";
import { Account, Event } from "scaas/src/models";
import { Balance, State } from "../contracts/coin";
import { Feedback, sequelize } from "../models";
import { prepareTransporter } from "../services/email";

export const startFeedbackProcess = () => {
    proc();
}


const proc = async () => {

    const [actions]: [any[], unknown] = await sequelize.sequlize.query(`SELECT a.* FROM system_actions a LEFT JOIN feedbacks f ON a.id = f."actionId" WHERE f.id IS NULL AND contract LIKE '%/src/contracts/coin' ORDER BY a.nonce ASC`);
    console.log('proc... feedback...');

    for (const action of actions) {
        const acc: any = await Account.findByPk(action.from, { raw: true });
        if (!acc) {
            continue;
        }
        const receiverEmail: any = { exists: false, action, html: '' };
        let html = `<h1>Action: #${action.nonce}, ${action.method}</h1>`;

        if (action.status === 'SUCCESS') {
            html += `<div>SUCCESS</div>`;
        } else if (action.status === 'FAILED') {
            html += `<div>FAILED</div>`
            html += `<div>reason: ${action.message}</div>`;
            receiverEmail.html = `<div>FAILED</div>`
        }

        const events: any[] = await Event.findAll({ where: { actionId: action.id }, raw: true });

        console.log({ action });
        for (const event of events) {
            console.log({ event });
            html += '<div>';
            switch (event.name) {
                case 'Coin Deployed':
                    html += `Congratulations! you have been deployed ${event?.args?.name} (symbol: ${event?.args?.symbol}) successfully`;
                    break;
                case 'Mint':
                    {
                        const coin: any = await State.bind(undefined).findOne({ where: { contractId: event.contract }, raw: true })
                        const toAcc: any = await Account.findByPk(event?.args?.addr);
                        const bal: any = await Balance.bind(undefined).findOne({ where: { addr: event?.args?.addr, contractId: event.contract }, raw: true });
                        html += `Congratulations! you have minted ${toAcc.email} with ${event?.args?.amount} ${coin.symbol} successfully. ${toAcc.email} current balance is ${bal.amount}`;

                        if (event?.args?.addr && event.args.addr !== action.from) {
                            receiverEmail.to = event.args.addr;
                            receiverEmail.exists = true;
                            receiverEmail.subject = `Mint success`;
                            receiverEmail.email = toAcc.email;
                            receiverEmail.html = `<h1>You had recieve ${coin?.symbol} coin</h1>`;
                            receiverEmail.html += `Congratulations! you have been minted by ${event?.args?.amount} ${coin.symbol} successfully. Your current balance is ${bal.amount}`;
                        }
                    }
                    break;
                case 'Transfer':
                    {
                        const coin: any = await State.bind(undefined).findOne({ where: { contractId: event.contract }, raw: true })
                        const fromAcc: any = await Account.findByPk(event?.args?.from);
                        const toAcc: any = await Account.findByPk(event?.args?.to);
                        const fromBal: any = await Balance.bind(undefined).findOne({ where: { addr: event?.args?.from, contractId: event.contract }, raw: true });
                        const toBal: any = await Balance.bind(undefined).findOne({ where: { addr: event?.args?.to, contractId: event.contract }, raw: true });
                        html += `Congratulations! you have been transfer to ${toAcc.email} with ${event?.args?.amount} ${coin.symbol} successfully. Your current balance is ${fromBal?.amount}`;

                        if (event.args.from !== event.args.to) {
                            receiverEmail.to = event.args.to;
                            receiverEmail.email = toAcc.email;
                            receiverEmail.exists = true;
                            // receiverEmail.subject = `You had recieve ${coin?.symbol} coin`;
                            receiverEmail.subject = `Transfer success`;
                            receiverEmail.html = `<h1>You had recieve ${coin?.symbol} coin</h1>`;
                            receiverEmail.html += `Congratulations! ${fromAcc.email} have transfered you ${event?.args?.amount} ${coin.symbol} successfully. Your current balance is ${toBal.amount}`;
                        }
                    }
                    break;
                case 'Balance':
                    {
                        const coin: any = await State.bind(undefined).findOne({ where: { contractId: event.contract }, raw: true })
                        html += `Your balance for ${coin.symbol} is: ${event?.args?.amount} ${coin.symbol}`;
                    }
                    break;
            }
            html += '</div>';
        }

        let subject;
        switch (action.method) {
            case 'deploy':
                subject = 'Deploy: re (feedback)'
                break;
            case 'mint':
                subject = 'Mint: re (feedback)'
                break;
        }

        const transporter = prepareTransporter();
        try {
            let info = await transporter.sendMail({
                sender: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                to: acc.email, // list of receivers
                subject,
                // replyTo: from,
                // messageId: tx.messageId,
                // inReplyTo: tx.messageId,
                // references: tx.messageId,
                // html: `Coin "${name} with symbol "${symbol}" deployed successfully`,
                html
            });
            console.log({ info });
            await Feedback.create({ actionId: action.id, messageId: info.messageId, nonce: action.nonce })

            if (receiverEmail.exists) {
                let info = await transporter.sendMail({
                    sender: `"Office" <coin.in.mail1@gmail.com>`, // sender address
                    to: receiverEmail.email, // list of receivers
                    subject: receiverEmail.subject,
                    // replyTo: from,
                    // messageId: tx.messageId,
                    // inReplyTo: tx.messageId,
                    // references: tx.messageId,
                    // html: `Coin "${name} with symbol "${symbol}" deployed successfully`,
                    html: receiverEmail.html
                });
                console.log({ info });
            }

        } catch (e: any) {
            console.error(e);
        }
    }

    setTimeout(() => {
        proc();
    }, 10000);
}