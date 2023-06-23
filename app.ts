import "./env";




import { VM, getOrLoad } from "scaas/src/vm/vm";

import "./src/config";
import { Mail, sequelize } from "./src/models";

import { Op } from "sequelize";
import * as contracts from "./src/contracts";
import { State } from "./src/contracts/coin";
import { fetchTransactions } from "./src/mail";

import * as proc from "./src/process";




export const smtpConfig = {
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
        vm = await vm.clone(true);

        fetchTransactions().catch((e: any) => {
            if (e.message === 'Too many simultaneous connections. (Failure)') {
                // console.log(e.message);
                // console.error(e);
                // setTimeout(() => {
                //     processActions(vm);
                // }, 20000);
                process.exit(0);
                return;
            } else if (e.message !== 'Nothing to fetch') {
                console.log(e.message);
                console.error(e);
                process.exit(0);
            }
        }).then(() => { console.log('SUCC') });

        const pendingTxs: any[] = await Mail.findAll({ where: { processed: { [Op.is]: null } }, raw: true });
        pendingTxs.reverse();

        const txs: any[] = [];
        const overrides: any = {};
        const txByUser: any = {};
        for (const tx of pendingTxs) {
            if (overrides[tx.from]) {
                overrides[tx.from].push(tx.id);
                continue;
            }
            txs.push(tx);
            txByUser[tx.from] = tx.id;
            overrides[tx.from] = [];
        }
        txs.reverse();

        for (const from in overrides) {
            if (overrides[from].length) {
                await Mail.update({ override: txByUser[from] }, { where: { id: { [Op.in]: overrides[from] } }, transaction: vm.transaction });
            }
        }

        for (const tx of txs) {
            const m: any = await Mail.findByPk(tx.id);
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

                let parts = text.split('\n');
                parts.map((p: any) => p.trim());


                const ses = await vm.login(from, '123');
                try {

                    switch (subject.toLowerCase()) {
                        case 'deploy':
                            const name = parts[0];
                            const symbol = parts[1];
                            await vm.deploy(contracts.coin.deploy, {
                                name, symbol
                            }, ses);
                            break;

                        case 'mint':
                            {
                                const symbol = parts[0];
                                let coin: any = await State.bind(undefined).findByPk(symbol, { raw: true });
                                coin = await State.bind(undefined).findOne({ where: { symbol }, raw: true });
                                const amount = parts[1];
                                await vm.action(coin.contractId, contracts.coin.mint, { addr: toAcc.id, amount: amount }, ses);
                            }
                            break;
                        case 'burn':
                            {
                                const symbol = parts[0];
                                let coin: any = await State.bind(undefined).findByPk(symbol, { raw: true });
                                coin = await State.bind(undefined).findOne({ where: { symbol }, raw: true });
                                const amount = parts[1];
                                await vm.action(coin.contractId, contracts.coin.burn, { addr: toAcc.id, amount: amount }, ses);
                            }
                            break;
                        case 'balance':
                            {
                                const symbol = parts[0];
                                let coin: any = await State.bind(undefined).findByPk(symbol, { raw: true });
                                coin = await State.bind(undefined).findOne({ where: { symbol }, raw: true });
                                await vm.action(coin.contractId, contracts.coin.balanceOf, fromAcc.id, ses);
                            }
                            break;
                        case 'name':
                            break;
                        case 'symbol':
                            break;
                        case 'transfer':
                            {
                                const symbol = parts[0];
                                let coin: any = await State.bind(undefined).findByPk(symbol, { raw: true });
                                coin = await State.bind(undefined).findOne({ where: { symbol }, raw: true });
                                const amount = parts[1];
                                console.log({ symbol });
                                await vm.action(coin.contractId, contracts.coin.transfer, { addr: toAcc.id, amount: amount }, ses);
                            }
                            break;
                        case 'transferFrom':
                            break;
                        case 'allowance':
                            break;
                        case 'approve':
                            break;
                    }
                } catch (e) {
                    console.error(e);
                }
                await Mail.update({ processed: new Date() }, { where: { id: tx.id } });
            }

        }

        await vm.endSim(true);

    } catch (e: any) {
        console.error(e);
        // process.exit(0);
    }

    setTimeout(() => {
        processActions(vm);
    }, 1000);
}

(async () => {
    let force = false;
    await sequelize.sync({ force });

    proc.feedback.startFeedbackProcess();

    const vm: VM = await getOrLoad();
    processActions(vm);

})();
