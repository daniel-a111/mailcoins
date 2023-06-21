import '../env';


import { getStatusByPath } from 'scaas/src/service/git';

import { StateModel, sequelize } from 'scaas/src/models';
import { VM, getOrLoad } from 'scaas/src/vm/vm';


async function main() {

    const vm: VM = await getOrLoad();
    await sequelize.sync();
    const { commit } = await getStatusByPath(__dirname);
    for (const state of (await StateModel.findAll({ raw: true })) as any[]) {
        await vm.changeContractProgram(state.id, state.contract.substring(commit.length), { uid: '0000', token: '123' });
    }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
