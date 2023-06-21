import { NextFunction, Request, Response } from "express";
import { Account, Action } from "scaas/src/models";
import { getOrLoad } from "scaas/src/vm/vm";
import { Op } from "sequelize";
import * as auth from "../auth";

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { projectId, fromNonce, pending }: any = req.query;

        const user: any = await auth.getUser(req);
        const accounts: any[] = await Account.findAll({
            where: {
                id: { [Op.ne]: user.id }
            }, order: [['createdAt', 'DESC']], raw: true
        });
        return res.status(200).json({ accounts });
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}



export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id }: any = req.params;
        const action: any = await Action.findByPk(id, { raw: true });
        action.account = await Account.findByPk(action.from, { raw: true });
        return res.status(200).json({ action });
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const view = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { contract, id }: any = req.params;

        const vm = await getOrLoad();
        const user: any = await auth.getUser(req);

        const action: any = await Action.bind(undefined).findByPk(id, { raw: true });
        action.account = await Account.findByPk(action.from, { raw: true });
        return res.status(200).json({ action });
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const submit = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id }: any = req.params;

        const user: any = await auth.getUser(req);

        const action: any = await Action.bind(undefined).findByPk(id, { raw: true });
        action.account = await Account.findByPk(action.from, { raw: true });
        return res.status(200).json({ action });
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}
