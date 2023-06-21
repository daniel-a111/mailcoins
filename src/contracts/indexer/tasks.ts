import { Addr, ContractDeploy } from "scaas/src/vm/core";
import { VM, registerContract } from "scaas/src/vm/vm";
import { DataTypes } from "sequelize";
import * as contracts from "..";
import { sequelize } from "../../models";

registerContract(() => {
    return {
        __filename, methods: [
            deploy,
            get,
            setQuestsIndexer,

            deployTask,

            indexTaskMember,
            removeTaskMember,

        ]
    };
});

const State = sequelize.define('indexer_task', {
    // id: { type: DataTypes.STRING, primaryKey: true },
    // title: DataTypes.STRING,
    // content: DataTypes.STRING,
    // owner: DataTypes.STRING,
    questsIndexer: DataTypes.STRING
}, {
    indexes: []
});


const Task = sequelize.define('indexer_task_task', {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    owner: DataTypes.STRING,
    // questsIndexer: DataTypes.STRING
}, {
    indexes: []
});

const Member = sequelize.define('indexer_task_member', {
    task: DataTypes.STRING,
    addr: DataTypes.STRING,
});


export const deploy: ContractDeploy<any, Addr> = async (vm: VM, d: undefined): Promise<Addr> => {
    await State.bind(vm).create();
    return vm.env().addr;
}

export const setQuestsIndexer = async (vm: VM, questsIndexer: string) => {
    return !!await State.bind(vm).update({ questsIndexer });
}

export const deployTask = async (vm: VM, { title, content }: { title?: string, content?: string }) => {
    const task = await vm.deploy(contracts.task.deploy, { title, content, member: vm.env().message.sender.id });
    await Task.bind(vm).create({ id: task.id, owner: vm.env().message.sender.id });
    await vm.action(task.id, contracts.task.addAdmin, vm.env().message.sender.id);
    return task;
}

export const indexTaskMember = async (vm: VM, member: string) => {
    const task = await Task.bind(vm).findByPk(vm.env().message.sender.id);
    if (!task) {
        throw new Error(`sender is not a known task..`);
    }
    await Member.bind(vm).create({ task: task.id, addr: member });
}

export const removeTaskMember = async (vm: VM, member: string) => {
    const task = await Task.bind(vm).findByPk(vm.env().message.sender.id);
    if (!task) {
        throw new Error(`sender is not a known task..`);
    }
    const affected = await Member.bind(vm).destroy({ where: { task: task.id, addr: member } });
    if (!affected) {
        throw new Error("not a member...");
    }
}

// const hasMembership = async (vm: VM) => {
//     const state: any = await getState(vm);
//     console.log({ state });
//     if (vm.env().message.sender.id === state.indexer) {
//         return !!await Member.bind(vm).findOne({ where: { addr: vm.env().tx.from.id } });
//     } else {
//         return !!await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id } });
//     }
// }


export const get = async (vm: VM, taskAddr: string) => {
    const state: any = await State.bind(vm).findOne({ raw: true });
    if (await vm.view(state.questsIndexer, contracts.indexers.quests.isQuest, vm.env().message.sender.id)) {
        return await Task.bind(vm).findByPk(taskAddr);
    }
}
