import { Addr, ContractDeploy } from "scaas/src/vm/core";
import { VM, registerContract } from "scaas/src/vm/vm";
import { DataTypes } from "sequelize";
import { sequelize } from "../models";

import { Account } from "scaas/src/models";
import * as contracts from ".";

registerContract(() => {
    return {
        __filename, methods: [
            deploy,
            getState,
            update,

            addTask,
            removeTask,
            listTasks,

            relate,
            listRelated,

            listMembers,
            addMemberByEmail,
            addMember,
            removeMember,

            transferMembership,
            hasMembership,
            isAdminMember,
        ]
    };
});


export const Quest = sequelize.define('quest', {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: DataTypes.STRING,
    genesis: DataTypes.STRING,
    questsIndexer: DataTypes.STRING,
}, {
    indexes: []
});

export const Member = sequelize.define('quest_member', {
    addr: DataTypes.STRING,
    canManageTeam: DataTypes.BOOLEAN,
    canEdit: DataTypes.BOOLEAN,
});


export const QuestTasks = sequelize.define('quest_tasks', {
    addr: DataTypes.STRING,
});

export const QuestToQuest = sequelize.define('quest_to_quest', {
    destination: DataTypes.STRING
});


export const deploy: ContractDeploy<any, Addr> = async (vm: VM, { title, genesis, withTasks }: { title?: string; genesis?: string; withTasks: any[] }): Promise<Addr> => {
    if (!genesis) {
        throw new Error("genesis task did not defined");
    }
    await Quest.bind(vm).create({
        id: vm.env().addr.id,
        title,
        genesis,
        questsIndexer: vm.env().message.sender.id
    });
    await Member.bind(vm).create({ addr: vm.env().message.sender.id, canEdit: true, canManageTeam: true });
    for (const task of withTasks || []) {
        _addTask(vm, task);
    }
    return vm.env().addr;
}

interface StateOptions {
    include: {
        tasks?: boolean;
        members?: boolean;
        related?: boolean;
        all?: boolean;
    }
}
export const getState = async (vm: VM, options?: StateOptions): Promise<any> => {
    if (!await hasMembership(vm, vm.env().message.sender.id)) {
        throw new Error("members only");
    }
    return await _getState(vm, options);
}


const _getState = async (vm: VM, options?: StateOptions): Promise<any> => {
    const state: any = await Quest.bind(vm).findOne({ where: { id: vm.env().addr.id }, raw: true });
    if (options?.include?.all || options?.include?.tasks) {
        state.tasks = await _listTasks(vm, state);
        state.genesis = state.tasks.shift();
    }

    if (options?.include?.all || options?.include?.members) {
        state.members = await _listMembers(vm);
    }

    if (options?.include?.all || options?.include?.related) {
        state.related = await _listRelated(vm);
    }
    return state;
}

export const addMemberByEmail = async (vm: VM, data: { email: string, canManageTeam?: boolean }): Promise<any> => {
    const mem = await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id }, raw: true });
    if (!mem) {
        throw new Error("members only");
    }

    let memberAccount: any = await vm.getUserByEmail(data.email);
    if (!memberAccount) {
        memberAccount = await vm.genUser({ email: data.email });
    }

    const addr = memberAccount.id;
    await _addMember(vm, { addr, canManageTeam: data.canManageTeam });
}

export const addMember = async (vm: VM, data: { addr: string, canManageTeam?: boolean }): Promise<any> => {
    const mem = await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id }, raw: true });
    if (!mem) {
        throw new Error("members only");
    }
    const addr = data.addr;
    await _addMember(vm, { addr, canManageTeam: data.canManageTeam });
}

export const removeMember = async (vm: VM, addr: string): Promise<any> => {
    const mem = await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id }, raw: true });
    const toRemove: any = await Member.bind(vm).findOne({ where: { addr }, raw: true });
    if (!mem) {
        throw new Error("members only");
    }
    if (toRemove.canManageTeam && vm.env().message.sender.id !== addr) {
        throw new Error("try to remove admin, reverted");
    }
    await _removeMember(vm, addr);
}

const _createTaskAndAdd = async (vm: VM, { title, content }: { title: string; content: string; }): Promise<any> => {
    const addr = await vm.deploy(contracts.task.deploy, { title, content });
    for (const mem of (await listMembers(vm) as any[])) {
        await vm.action(addr.id, contracts.task.addMember, mem.addr);
    }
    await vm.action(addr.id, contracts.task.addAdmin, vm.env().message.sender.id);
    return await _addTask(vm, addr.id);
}

const _addTask = async (vm: VM, addr: string): Promise<any> => {
    await QuestTasks.bind(vm).create({ addr });
    const members: any = await listMembers(vm);
    for (const mem of members) {
        if (!(await vm.action(addr, contracts.task.hasMembership, mem.account.id))) {
            await vm.action(addr, contracts.task.addMember, mem.account.id);
        }
    }
    return addr;
}

export const addTask = async (vm: VM, { id, title, content }: { id?: string, title?: string; content?: string; }): Promise<any> => {
    const mem = await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id }, raw: true });
    if (!mem) {
        throw new Error("member only");
    }
    if (id) {
        if (! await vm.view(id, contracts.task.hasMembership, vm.env().addr.id)) {
            throw new Error("quest is not a member");
        }
        return await _addTask(vm, id);
    } else {
        throw new Error("add task must have an id");
    }
}

export const removeTask = async (vm: VM, taskId: string): Promise<any> => {
    const mem = await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id }, raw: true });
    if (!mem) {
        throw new Error("members only");
    }
    const state = await _getState(vm);
    if (state.genesis === taskId) {
        throw new Error("cannot remove genesis");
    }
    await QuestTasks.bind(vm).destroy({ where: { addr: taskId }, limit: 1 });

    if (await QuestTasks.bind(vm).count({ where: { addr: taskId } }) === 0) {
        await vm.action(taskId, contracts.task.removeMember, vm.env().addr.id);
    }
}

export const tasksIndexer = async (vm: VM): Promise<any> => {
    const state: any = await _getState(vm);
    const questIndexer = await vm.view(state.questsIndexer, contracts.indexers.quests.getState, true);
    return questIndexer.tasksIndexer;
}


const _listTasks = async (vm: VM, state: any): Promise<any> => {
    let tasks: any[] = [];
    for (const task of ([{ addr: state.genesis }, ...await QuestTasks.bind(vm).findAll({ raw: true })] as any)) {
        if (await vm.view(task.addr, contracts.task.hasMembership, vm.env().message.sender.id)) {
            tasks.push(task)
        }
    }
    return tasks;
}


export const listTasks = async (vm: VM): Promise<any> => {
    return await _listTasks(vm, await _getState(vm));
}

export const relate = async (vm: VM, data: { destination: string }) => {
    const mem = await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id, canEdit: true }, raw: true });
    if (!mem) {
        throw new Error("Members only");
    }
    await QuestToQuest.bind(vm).create({ ...data });
}


export const _listRelated = async (vm: VM): Promise<any> => {
    const quests: any[] = await QuestToQuest.bind(vm).findAll({ raw: true });
    for (const quest of quests) {
        quest.data = await vm.view(quest.destination, getState, undefined);
    }
    return quests;
}


export const listRelated = async (vm: VM): Promise<any> => {
    const mem = await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id }, raw: true });
    if (!mem) {
        throw new Error("Members only");
    }
    return await _listRelated(vm);
}

export interface TeamMember {
    name: string;
    email: string;

}

const _listMembers = async (vm: VM): Promise<TeamMember[]> => {
    const e = vm.env();
    const allMembers: any = await Member.bind(vm).findAll({ raw: true });
    for (const member of allMembers) {
        const account = await Account.findByPk(member.addr, { raw: true, transaction: e.db.transaction });
        member.account = account;
    }
    return allMembers;
}


export const listMembers = async (vm: VM, data: void): Promise<TeamMember[]> => {
    if (!await Member.bind(vm).findOne({ where: { addr: vm.env().message.sender.id } })) {
        throw new Error("members only");
    }
    return await _listMembers(vm);
}


export const transferMembership = async (vm: VM, to: string) => {

    if (!await hasMembership(vm, vm.env().message.sender.id)) {
        throw new Error("only members");
    }

    const isMemberAleady = await hasMembership(vm, to);
    const isAdmin = await isAdminMember(vm, to) || await isAdminMember(vm, vm.env().message.sender.id);
    await _removeMember(vm, vm.env().message.sender.id);
    if (isMemberAleady) {
        await _removeMember(vm, to);
    }
    await _addMember(vm, { addr: to, canManageTeam: isAdmin });
}


const _removeMember = async (vm: VM, addr: string) => {
    const deleted = await Member.bind(vm).destroy({ where: { addr } });
    if (!deleted) {
        throw new Error(`${addr} is not a member of ${vm.env().addr.id}`);
    }
}

const _addMember = async (vm: VM, { addr, canManageTeam }: { addr: string, canManageTeam?: boolean }) => {
    await Member.bind(vm).create({ addr, canManageTeam: canManageTeam || undefined });
    for (const task of await listTasks(vm)) {
        await vm.action(task.addr, contracts.task.addMember, addr);
    }
}

export const hasMembership = async (vm: VM, addr: string) => {
    return !!await Member.bind(vm).findOne({ where: { addr } })
}

export const isAdminMember = async (vm: VM, addr: string) => {
    return !!await Member.bind(vm).findOne({ where: { addr, canManageTeam: true } })
}


export const update = async (vm: VM, data: { title?: string, content?: string }): Promise<any> => {
    if (!await hasMembership(vm, vm.env().message.sender.id)) {
        throw new Error("members only");
    }
    return _update(vm, data);
}
const _update = async (vm: VM, data: { title?: string, content?: string }): Promise<any> => {
    await Quest.bind(vm).update(data);
}

