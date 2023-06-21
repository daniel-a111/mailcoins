import { Account } from "scaas/src/models";
import { Addr, ContractDeploy } from "scaas/src/vm/core";
import { VM, registerContract } from "scaas/src/vm/vm";
import { DataTypes } from "sequelize";
import { sequelize } from "../models";
import { TeamMember } from "./quest";

registerContract(() => {
    return {
        __filename, methods: [
            deploy,
            getState,
            update,
            clone,


            addAdmin,
            isAdminMember,
            addMember,
            removeMember,

            hasMembership,
            addMemberByEmail,
            listMembers,
            removeMembership,
            transferMembership,
        ]
    };
});

const Task = sequelize.define('task', {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    owner: DataTypes.STRING,
    indexer: DataTypes.STRING,
}, {
    indexes: []
});

const Member = sequelize.define('task_member', {
    addr: DataTypes.STRING,
    canManageTeam: DataTypes.BOOLEAN
});


export const deploy: ContractDeploy<any, Addr> = async (vm: VM, { title, content }: { title: string, content?: string }): Promise<Addr> => {
    if (!title && !content) {
        throw new Error("error: empty task");
    }
    const id = vm.env().addr.id;
    const owner = vm.env().message.sender.id;
    await Task.bind(vm).create({ id, owner, title, content, indexer: owner });
    await Member.bind(vm).create({ addr: owner, canManageTeam: true });
    return vm.env().addr;
}

export const clone = async (vm: VM, questAddr?: string): Promise<Addr> => {
    const state = await _getState(vm);
    const addr = await vm.deploy(deploy, { title: state.title, content: state.content });
    await vm.action(addr.id, transferMembership, vm.env().message.sender.id);
    return addr;
}


export const transferMembership = async (vm: VM, to: string) => {
    await _removeMember(vm, vm.env().message.sender.id);
    await _addMember(vm, to);
}


export const removeMembership = async (vm: VM, to: string) => {
    return await removeMember(vm, to);
}

const _removeMember = async (vm: VM, addr: string) => {
    const deleted = await Member.bind(vm).destroy({ where: { addr } });
    if (!deleted) {
        throw new Error(`${addr} is not a member of ${vm.env().addr.id}`);
    }
}

const _addMember = async (vm: VM, addr: string, admin?: boolean) => {
    const mem: any = await Member.bind(vm).findOne({ where: { addr } });
    if (!mem) {
        await Member.bind(vm).create({ addr, canManageTeam: !!admin });
    }
    else {
        if (!!admin && !mem.canManageTeam) {
            await Member.bind(vm).update({ canManageTeam: true }, { where: { addr } });
        }
    }
}

export const addMember = async (vm: VM, addr: string) => {
    if (!await _isMember(vm)) {
        throw new Error("only admin");
    }
    await _addMember(vm, addr);
}

export const addAdmin = async (vm: VM, addr: string) => {
    if (!await isAdminMember(vm, vm.env().message.sender.id)) {
        throw new Error("only admin");
    }
    await _addMember(vm, addr, true);
}

export const addMemberByEmail = async (vm: VM, email: string) => {
    const state: any = await _getState(vm);
    if (vm.env().message.sender.id !== state.owner && !await Member.bind(vm).count({ where: { addr: vm.env().message.sender.id } })) {
        throw new Error("no allowance");
    }
    let account: any = await vm.getUserByEmail(email);
    if (!account) {
        account = await vm.genUser({ email });
    }
    await _addMember(vm, account.id);
}

export const getState: ContractDeploy<any, Addr> = async (vm: VM, raw?: boolean): Promise<any> => {
    if (!await _isMember(vm)) {
        throw new Error("members only");
    }
    return await _getState(vm);
}


export const _getState: ContractDeploy<any, any> = async (vm: VM, raw?: boolean): Promise<any> => {
    const state: any = await Task.bind(vm).findOne({ raw });
    state.members = await _listMembers(vm);
    return state;
}

const _isMember = async (vm: VM) => {
    return await Member.bind(vm).count({ where: { addr: vm.env().message.sender.id } }) > 0;
}


const _listMembers = async (vm: VM): Promise<TeamMember[]> => {
    const e = vm.env();
    const allMembers: any = await Member.bind(vm).findAll({ raw: true });
    for (const member of allMembers) {
        const account = await Account.findByPk(member.addr, { raw: true, transaction: e.db.transaction });
        member.account = account;
    }
    return allMembers.filter((mem: any) => !!mem.account);
}


export const listMembers = async (vm: VM, data: void): Promise<TeamMember[]> => {
    return await _listMembers(vm);
}


export const update = async (vm: VM, { title, content }: { title?: string, content?: string }) => {
    if (!await _isMember(vm)) {
        throw new Error("no allowance");
    }
    await Task.bind(vm).update({ title: title || null, content: content || null })
}


export const hasMembership = async (vm: VM, addr: string) => {
    return !!await Member.bind(vm).findOne({ where: { addr } })
}

export const isAdminMember = async (vm: VM, addr: string) => {
    return !!await Member.bind(vm).findOne({ where: { addr, canManageTeam: true } })
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
