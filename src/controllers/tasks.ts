import { NextFunction, Request, Response } from "express";
import { VM, getOrLoad } from "scaas/src/vm/vm";
import * as contracts from "../contracts";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const vm: VM = await getOrLoad();
        const task = await vm.view(id, contracts.task.getState, undefined, req);
        return res.status(200).json({ task });
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
        const { title, content } = req.body;
        const vm: VM = await getOrLoad();
        const task = await vm.action(id, contracts.task.update, { title, content }, req);
        return res.status(200).json({ task });
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
            contracts.task.addMemberByEmail,
            email,
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

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, addr } = req.params;
        const vm: VM = await getOrLoad();
        await vm.action(
            id,
            contracts.task.removeMember,
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

export const makeCopy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { questId, method, members } = req.body;
        const vm: VM = await getOrLoad();
        let copy = { id }
        if (method === 'clone') {
            copy = await vm.action(
                id,
                contracts.task.clone,
                undefined,
                req
            );
            for (const mem of members || []) {
                await vm.action(copy.id, contracts.task.addMember, mem, req);
            }
        }
        await vm.action(copy.id, contracts.task.addMember, questId, req);
        await vm.action(questId, contracts.quest.addTask, { ...copy }, req);
        return res.status(200).json({ success: true });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}
