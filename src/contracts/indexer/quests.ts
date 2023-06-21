import { Addr, ContractDeploy } from "scaas/src/vm/core";
import { VM, registerContract } from "scaas/src/vm/vm";
import { DataTypes } from "sequelize";
import * as contracts from "..";
import { sequelize } from "../../models";

registerContract(() => {
    return {
        __filename, methods: [
            deploy,
            getState,
            indexQuestMember,

            deployQuest,
            isQuest,
        ]
    };
});

const State = sequelize.define('indexer_quests_state', {
    tasksIndexer: DataTypes.STRING
}, {
    indexes: []
});


const Quest = sequelize.define('indexer_quest', {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: DataTypes.STRING,
    genesis: DataTypes.STRING
    // content: DataTypes.STRING,
    // owner: DataTypes.STRING,
}, {
    indexes: []
});

const Member = sequelize.define('indexer_quest_member', {
    quest: DataTypes.STRING,
    addr: DataTypes.STRING,
});


export const deploy: ContractDeploy<any, Addr> = async (vm: VM, tasksIndexer: string): Promise<Addr> => {
    await State.bind(vm).create({ tasksIndexer });
    return vm.env().addr;
}

export const getState = async (vm: VM, options?: any): Promise<any> => {
    const state: any = await State.bind(vm).findOne({ raw: options?.raw });
    return state;
}


export const deployQuest = async (vm: VM, { title, genesis }: { title: string, genesis: { id?: string, title?: string, content?: string } }) => {
    const state: any = await getState(vm);
    console.log({ ...genesis })
    if (genesis.id && (genesis.title || genesis.content)) {
        throw new Error("genesis: references or new, not both.");
    }
    if (!genesis.id && !genesis.title && !genesis.content) {
        throw new Error("genesis: not defined. use ref or title+content");
    }

    let create = !genesis.id;
    if (create) {
        const newTask = await vm.action(state.tasksIndexer, contracts.indexers.tasks.deployTask, { ...genesis });
        genesis.id = newTask.id;
    } else {
        if (!await vm.view(genesis.id, contracts.task.hasMembership, vm.env().message.sender.id)) {
            throw new Error("only task's members");
        }
    }

    const quest = await vm.deploy(contracts.quest.deploy, { title, genesis: genesis.id });
    await vm.action(genesis.id, contracts.task.addAdmin, quest.id);
    await Quest.bind(vm).create({ id: quest.id, title, genesis: genesis.id });

    if (create) {
        await vm.action(genesis.id, contracts.task.addAdmin, quest.id);
        await vm.action(genesis.id, contracts.task.addAdmin, vm.env().message.sender.id);
        await vm.action(genesis.id, contracts.task.addAdmin, state.tasksIndexer);
    } else {
        await vm.action(genesis.id, contracts.task.addMember, quest.id);
    }

    // console.log(await vm.view(quest.id, contracts.quest.isAdminMember, vm.env().message.sender.id));
    // console.log(vm.env().addr.id);
    // await vm.env().db.transaction.commit()
    // if (!create) {
    // await vm.action(quest.id, contracts.quest.addMember, { addr: vm.env().message.sender.id, canManageTeam: true });
    // console.log({ quest, addr: vm.env().message.sender.id, t: vm.env().addr.id });
    // await vm.transaction.commit();
    // process.exit(0);
    // }
    await vm.action(quest.id, contracts.quest.addMember, { addr: vm.env().message.sender.id, canManageTeam: true });


    // await vm.action(newTask.id, contracts.task.addMember, {});

    await vm.action(quest.id, contracts.quest.addMember, { addr: state.tasksIndexer, canManageTeam: true });
    // process.exit(0);

    return quest;
}

export const indexQuestMember = async (vm: VM, member: string) => {
    const quest = await Quest.bind(vm).findByPk(vm.env().message.sender.id);
    if (!quest) {
        throw new Error(`sender is not a known task..`);
    }
    await Member.bind(vm).create({ quest: quest.id, addr: member });
}

export const isQuest = async (vm: VM, addr: string) => {
    return !!await Quest.bind(vm).findByPk(addr);
}


// export const deployQuest = async (vm: VM, { title, genesis }: { title: string, genesis: { id?: string, title?: string, content?: string } }) => {
//     const state: any = await getState(vm);

//     // const task = await vm.action(state.tasksIndexer, contracts.indexers.tasks.deployTask, { title, content });
//     // await vm.action(task.id, contracts.task.transferMembership, vm.env().message.sender.id);
//     // return task;
// }

// export const deployQuest = async (vm: VM, { title, genesis }: { title: string, genesis: { id?: string, title?: string, content?: string } }) => {
//     const state: any = await getState(vm);

//     // const task = await vm.action(state.tasksIndexer, contracts.indexers.tasks.deployTask, { title, content });
//     // await vm.action(task.id, contracts.task.transferMembership, vm.env().message.sender.id);
//     // return task;
// }
