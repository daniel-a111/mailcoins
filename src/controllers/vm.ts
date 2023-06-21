import { NextFunction, Request, Response } from "express";
import { VM, getOrLoad } from "scaas/src/vm/vm";
import { Quest, QuestTasks } from "../contracts/quest";
import { decrypted } from "../crypto";



export const prev = async (req: Request, res: Response, next: NextFunction) => {
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


export const next = async (req: Request, res: Response, next: NextFunction) => {
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

