import '../env';


import fs from "fs";
// import { Account, EmailMessage } from "scass/src/models";
import { Account, EmailMessage, sequelize } from "scass/src/models";
import { getOrLoad } from "scass/src/vm/vm";

import { Addr, ContractDeploy, ContractMethod } from 'scass/src/vm/core';
import '../../src/contracts';
import { sequelize as wrapSequelize } from '../../src/models';

async function main() {
    const er = {};
    const { actions }: { actions: any[] } = JSON.parse(fs.readFileSync('./actions.case.1.json').toString());
    // console.log({ ...data });
    await sequelize.sync({ force: false });
    await wrapSequelize.sync({ force: false });
    // const t = await sequelize.transaction();
    // sequelize.sync({force: true, })
    const logins: { [index: string]: any } = {};

    actions.unshift({
        contract: 'users_generator',
        account: 0,
        method: 'genUser',
        from: '0000', to: 'users_generator/0',
        data: {
            email: 'lipnergroup@gmail.com'
        }
    });

    actions.unshift({
        contract: 'users_generator',
        account: 0,
        method: 'genUser',
        from: '0000', to: 'users_generator/0',
        data: {
            email: 'assa.daniel@gmail.com'
        }
    });


    const vm = await getOrLoad();
    for (const action of actions) {
        const { account, method, data: { email } } = action;
        if (account === 0 && method === 'genUser') {
            let a: any = await Account.findOne({ where: { email }, raw: true });
            if (!a) {
                await vm.genUser({ email, userId: '0000' });
                a = await Account.findOne({ where: { email }, raw: true });
            }
            const passMail: any = await EmailMessage.findOne({ where: { to: email }, order: [['id', 'DESC']], raw: true });
            const pass = passMail.message.substring('your pass is '.length);
            const session = await vm.login(email, pass);
            logins[email] = session;
            console.log({ a });
            logins[a.id] = session;

        } else if (action.status === 'SUCCESS') {

            const { contract, method, data, from, account, } = action;

            for (const m of vm.methods) {

                if (m.contract === contract && m.name === method) {
                    console.log({ action });
                    if (method === 'deploy') {
                        await vm.deploy((m.fn as ContractDeploy<any, Addr>), data, logins[from]);
                    } else {
                        await vm.action(account, (m.fn as ContractMethod<any, unknown>), data, logins[from])
                    }
                }
                // if ()
            }
            // const contract = '../../' + c1.substring('d978bc12d1e11900f9b1a13ad553961bab309f93/backend/'.length);
            console.log({ contract });

            // console.log({from})
            // console.log({ action });
        }
    }
    // console.log([ ...vm.methods ]);
    // console.log(vm.env().db.transaction);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
