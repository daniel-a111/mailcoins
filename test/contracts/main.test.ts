import "../env";

import { Account, sequelize } from "scaas/src/models";

import { sequelize as seqWrapper } from "../../src/models";
// import "../m"
import { VM, getOrLoad } from "scaas/src/vm/vm";

import * as contracts from "../../src/contracts";

import fs from 'fs';

let ses0;
let ses1;
let ses2;
let ses3;
let ses4;
let taskIndexer;
let questsIndexer;
let quest0;
let gen0;
describe('orders', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        await seqWrapper.sync({ force: true });

        const vm: VM = await getOrLoad();
        await vm.genUser({ name: "a0", email: "a1", pass: "a2", userId: "0000" });
        await vm.genUser({ name: "b0", email: "b1", pass: "b2", userId: "0000" });
        await vm.genUser({ name: "c0", email: "c1", pass: "c2", userId: "0000" });
        await vm.genUser({ name: "d0", email: "d1", pass: "d2", userId: "0000" });
        await vm.genUser({ name: "e0", email: "e1", pass: "e2", userId: "0000" });

        ses0 = await vm.login("a1", "a2");
        ses1 = await vm.login("b1", "b2");
        ses2 = await vm.login("c1", "c2");
        ses3 = await vm.login("d1", "d2");
        ses4 = await vm.login("e1", "e2");

        taskIndexer = await vm.deploy(contracts.indexers.tasks.deploy, undefined, ses0);
        questsIndexer = await vm.deploy(contracts.indexers.quests.deploy, taskIndexer.id, ses0);
        await vm.action(taskIndexer.id, contracts.indexers.tasks.setQuestsIndexer, questsIndexer.id, ses0);

        quest0 = await vm.action(questsIndexer.id, contracts.indexers.quests.deployQuest, {
            title: "First Quest!", genesis: {
                title: 'First Task/Note', content: 'Bla bla bla...'
            }
        }, ses0);
        gen0 = { id: (await vm.action(quest0.id, contracts.quest.getState, undefined, ses0)).genesis };
        expect(!!quest0).toBe(true);
    });
    test('gen case', async () => {

        const vm: VM = await (await getOrLoad()).clone(true);

        let notMemberAcc = await vm.genUser({ name: 'cc', email: 'cc', pass: 'cc', userId: '0000' });


        let members = await vm.view(quest0.id, contracts.quest.listMembers, undefined, ses0);
        expect(members.length).toBe(3);

        await expect(vm.view(quest0.id, contracts.quest.listMembers, undefined, ses1)).rejects.toThrow();

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, { email: "a", canEdit: true }, ses0);
        members = await vm.view(quest0.id, contracts.quest.listMembers, undefined, ses0);
        expect(members.length).toBe(4);

        let acc: any = await Account.findOne({ where: { email: "a" }, raw: true, transaction: vm.transaction });
        let pass = fs.readFileSync(`./passwords-test/${acc.id}`).toString();

        const ses2 = await vm.login("a", pass);

        members = await vm.view(quest0.id, contracts.quest.listMembers, undefined, ses2);
        expect(members.length).toBe(4);

        let exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses0);
        expect(exTasks.length).toBe(1);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses1);
        expect(exTasks.length).toBe(0);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses2);
        expect(exTasks.length).toBe(1);

        const task0 = await vm.action(quest0.id, contracts.quest.addTask, { title: "This is the text of the first task", content: "111" }, ses2);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses0);
        expect(exTasks.length).toBe(2);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses1);
        expect(exTasks.length).toBe(0);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses2);
        expect(exTasks.length).toBe(2);

        const task1 = await vm.action(quest0.id, contracts.quest.addTask, { title: "third", content: "3" }, ses2);
        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses0);
        expect(exTasks.length).toBe(3);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses1);
        expect(exTasks.length).toBe(0);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses2);
        expect(exTasks.length).toBe(3);

        await expect(vm.action(task1, contracts.task.addMember, ses1.uid, ses1)).rejects.toThrow();
        await vm.action(task1, contracts.task.addMember, ses1.uid, ses2);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses0);
        expect(exTasks.length).toBe(3);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses1);
        expect(exTasks.length).toBe(1);

        exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses2);
        expect(exTasks.length).toBe(3);

        const task0Mems = await vm.view(task0, contracts.task.listMembers, undefined, ses0);
        const task1Mems = await vm.view(task1, contracts.task.listMembers, undefined, ses0);
        expect(task0Mems.length).toBe(2);
        expect(task1Mems.length).toBe(3);

        await expect(vm.action(task0, contracts.task.update, { title: '111', content: '222' }, ses1)).rejects.toThrow();
        await vm.action(task0, contracts.task.update, { title: '111', content: '222' }, ses0);


        await expect(vm.action(task0, contracts.task.getState, true, ses1)).rejects.toThrow();

        const st: any = await vm.action(task0, contracts.task.getState, true, ses0);
        expect(st.title).toBe('111');
        expect(st.content).toBe('222');


        console.log({ ...gen0 });
        const quest1 = await vm.action(questsIndexer.id, contracts.indexers.quests.deployQuest, { genesis: { ...gen0 } }, ses2);
        // exTasks = await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses0);
        // expect(exTasks.length).toBe(3);
        // process.exit(0);
        await vm.endSim();

    }, 20000);

    test('only admin can add new team member to a quest', async () => {
        const vm: VM = await (await getOrLoad()).clone(true);
        await expect(vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: false
        }, ses1)).rejects.toThrow();
        await vm.endSim();
    }, 20000);

    test('admin can invite admin', async () => {
        const vm: VM = await (await getOrLoad()).clone(true);
        expect(await vm.view(quest0.id, contracts.quest.isAdminMember, ses1.uid, ses0)).toBe(false);
        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: true
        }, ses0);
        expect(await vm.view(quest0.id, contracts.quest.isAdminMember, ses1.uid, ses0)).toBe(true);
        await vm.endSim();
    }, 20000);

    test('only members of quest', async () => {

        const vm: VM = await (await getOrLoad()).clone(true);

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: false
        }, ses0);

        await vm.action(quest0.id, contracts.quest.update, {
            title: '111', content: '222'
        }, ses1);

        await expect(vm.view(quest0.id, contracts.quest.getState, undefined, ses2)).rejects.toThrow();
        const state: any = await vm.view(quest0.id, contracts.quest.getState, undefined, ses1);
        expect(state.title).toBe('111');
        await vm.endSim();

    }, 20000);

    test('only members of quest can edit', async () => {

        const vm: VM = await (await getOrLoad()).clone(true);

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: false
        }, ses0);

        await expect(vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "c1", canManageTeam: true
        }, ses1)).rejects.toThrow();

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: true
        }, ses0);

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "c1", canManageTeam: false
        }, ses1)

        expect(await vm.view(quest0.id, contracts.quest.isAdminMember, ses1.uid, ses0)).toBe(true);
        expect(await vm.view(quest0.id, contracts.quest.isAdminMember, ses2.uid, ses0)).toBe(false);

        await vm.endSim();

    }, 20000);



    test('only members of quest can fork it', async () => {

        const vm: VM = await (await getOrLoad()).clone(true);

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: false
        }, ses0);

        await expect(vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "c1", canManageTeam: true
        }, ses1)).rejects.toThrow();

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: true
        }, ses0);

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "c1", canManageTeam: false
        }, ses1)

        expect(await vm.view(quest0.id, contracts.quest.isAdminMember, ses1.uid, ses0)).toBe(true);
        expect(await vm.view(quest0.id, contracts.quest.isAdminMember, ses2.uid, ses0)).toBe(false);

        await vm.endSim();

    }, 20000);

    test('members can add and remove tasks', async () => {
        const vm: VM = await (await getOrLoad()).clone(true);

        await vm.action(quest0.id, contracts.quest.addMemberByEmail, {
            email: "b1", canManageTeam: false
        }, ses0);

        expect((await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses1)).length).toBe(1);
        const task0 = await vm.action(quest0.id, contracts.quest.addTask, { title: '1', content: '2' }, ses1);
        expect((await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses1)).length).toBe(2);
        await vm.action(quest0.id, contracts.quest.removeTask, task0, ses1);
        expect((await vm.view(quest0.id, contracts.quest.listTasks, undefined, ses1)).length).toBe(1);
        expect(await vm.view(task0, contracts.task.hasMembership, quest0.id, ses1)).toBe(false);
        await vm.endSim();
    }, 20000);


    test('members cannot remove genesis', async () => {
        const vm: VM = await (await getOrLoad()).clone(true);
        await expect(vm.action(quest0.id, contracts.quest.removeTask, gen0.id, ses0)).rejects.toThrow();
        await vm.endSim();
    }, 20000);

    test('admin can add invite members task', async () => {

        const vm: VM = await (await getOrLoad()).clone(true);
        expect(false).toBe(true);
        // await vm.action(gen0, contracts.task.addMember, { addr: ses1.uid }, ses0);
        // const vm: VM = await (await getOrLoad()).clone(true);
        await expect(vm.action(quest0.id, contracts.quest.removeTask, gen0.id, ses0)).rejects.toThrow();
        await vm.endSim();
    }, 20000);


});

