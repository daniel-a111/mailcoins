import { NextFunction, Request, Response } from "express";
import { VM, getOrLoad } from "scaas/src/vm/vm";
import * as contracts from "../contracts";
import { Quest, QuestTasks } from "../contracts/quest";
import { decrypted, encrypted } from "../crypto";

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const vm: VM = await getOrLoad();
        const quests: any = await Quest.bind(vm).modelCtor.findAll({ raw: true });
        for (const quest of quests) {
            quest.genesis = { addr: quest.taskId };
            quest.tasks = [{ addr: quest.taskId }, ...await QuestTasks.bind(vm).modelCtor.findAll({ where: { contractId: quest.id }, raw: true })];
            if (quest.title) {
                quest.title = decrypted(quest.title);
            }
            for (const task of [quest.genesis, ...quest.tasks]) {
                if (task?.title) {
                    task.title = decrypted(quest.title);
                }
                if (task?.content) {
                    task.content = decrypted(quest.content);
                }
            }
        }

        return res.status(200).json({ quests });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}


export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const vm: VM = await getOrLoad();
        const quest: any = await vm.view(id, contracts.quest.getState, { include: { all: true } }, req);
        for (const task of [quest.genesis, ...quest.tasks]) {
            task.data = await vm.view(task.addr, contracts.task.getState, undefined, req);
            task.members = await vm.view(task.addr, contracts.task.listMembers, undefined, req);
        }
        return res.status(200).json({ quest });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const add = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { title, task, genesis, withTasks }: any = req.body;
        title = encrypted(title);
        if (task?.title) {
            task.title = encrypted(task.title);
        }
        if (task?.content) {
            task.content = encrypted(task.content);
        }

        const vm: VM = await getOrLoad();
        if (!genesis.id) {
            genesis = await vm.deploy(contracts.task.deploy, { ...genesis }, req);
        }
        const addr = await vm.deploy(
            contracts.quest.deploy,
            {
                title,
                genesis: genesis.id,
                withTasks
            },
            req
        );
        await vm.action(genesis.id, contracts.task.addMember, addr.id, req);
        return res.status(200).json({ success: true, deploy: { addr } });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        let { title }: any = req.body;
        const vm: VM = await getOrLoad();
        await vm.action(id, contracts.quest.update, { title }, req);
        return res.status(200).json({ success: true });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const listMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const vm: VM = await getOrLoad();
        const members = await vm.view(
            id,
            contracts.quest.listMembers,
            {},
            req
        )
        return res.status(200).json({ members });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const addTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        let { addr, title, content } = req.body;

        title = encrypted(title);
        content = encrypted(content);

        const vm: VM = await getOrLoad();
        if (!addr) {
            addr = await vm.deploy(
                contracts.task.deploy,
                { title, content },
                req
            );
            addr = addr.id;
        }
        await vm.action(addr, contracts.task.addMember, id, req);
        await vm.action(
            id,
            contracts.quest.addTask,
            { id: addr },
            req
        );
        return res.status(200).json({ addr });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const removeTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, addr } = req.params;
        const vm: VM = await getOrLoad();
        await vm.action(
            id,
            contracts.quest.removeTask,
            addr,
            req
        )
        return res.status(200).json({ success: true });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const vm: VM = await getOrLoad();
        const tasks = await vm.view(
            id,
            contracts.quest.listTasks,
            {},
            req
        )
        return res.status(200).json({ tasks });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const listRelated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const vm: VM = await getOrLoad();
        const related = await vm.view(
            id,
            contracts.quest.listRelated,
            {},
            req
        )
        return res.status(200).json({ related });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}
export const relate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { destination } = req.body;
        const vm: VM = await getOrLoad();
        const tasks = await vm.action(
            id,
            contracts.quest.relate,
            { destination },
            req
        )
        return res.status(200).json({ tasks });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const vm: VM = await getOrLoad();
        const addr = await vm.action(
            id,
            contracts.quest.addMemberByEmail,
            { email, canEdit: true },
            req
        )
        return res.status(200).json({ addr });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        });
    }
}

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, addr } = req.params;
        const vm: VM = await getOrLoad();
        await vm.action(
            id,
            contracts.quest.removeMember,
            addr,
            req
        )
        return res.status(200).json({ addr });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}
