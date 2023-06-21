import { NextFunction, Request, Response } from "express";
import { Account, Action } from "scaas/src/models";
import { getOrLoadIndexer } from "scaas/src/vm/indexer";
import { Op } from "sequelize";
import * as auth from '../auth';
const sha256 = require('sha256');

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        let { uid, token } = await auth.login(email, password);
        res.setHeader('Access-Token', token);
        res.setHeader('Access-Uid', uid);
        res.setHeader('Access-Control-Expose-Headers', 'Access-Token, Access-Uid');
        return res.status(200).json({ success: true });
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}


export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.status(200).json({});
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}

export const invite = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { name, email } = req.body;

        const id = await (await getOrLoadIndexer()).genId();
        await Account.create({ id, name, email });
        return res.status(200).json({ success: true });
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}


export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['token'] as string;
        const uid = req.headers['id'] as string;
        const user: any = await Account.findByPk(uid, { raw: true });
        if (!user || user.session !== sha256(`${token}`)) {
            throw new Error("No access");
        }
        const date = new Date();
        date.setSeconds(date.getSeconds() - 30);
        console.log({ date });
        return res.status(200).json({
            success: true,
            user: {
                ...user, nonce: await Action.count({
                    where: {
                        from: `${user.id}`,
                        // status: {
                        //     [Op.ne]: 'NEW'
                        // },
                        // updatedAt: {
                        //     [Op.lte]: date
                        // }
                    }
                }),
                nonceSync: await Action.count({
                    where: {
                        from: `${user.id}`,
                        status: {
                            [Op.ne]: 'NEW'
                        },
                        updatedAt: {
                            [Op.lte]: date
                        }
                    }
                })
            }
        });
    } catch (e: any) {
        return res.status(500).json({
            message: e?.message || JSON.stringify(e)
        })
    }
}
