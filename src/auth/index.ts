import { Request } from "express";
import sha256 from 'sha256';
import { v4 as uuidv4 } from 'uuid';

import { Account } from "scaas/src/models";
import { getOrLoadIndexer } from "scaas/src/vm/indexer";
import { Session } from "scaas/src/vm/vm";
import { logger } from "../logger";

export const registerAccount = async (name: string, email: string, password: string) => {
    const exists = await Account.findOne({ where: { email } });
    if (exists) {
        throw new Error(`email ${email} already exists`);
    }
    const id = await (await getOrLoadIndexer()).genId();
    await Account.create({
        id, name, email, password: sha256(`${id}${password}`)
    });
}

export const invite = async (name: string, email: string) => {
    const exists = await Account.findOne({ where: { email } });
    if (exists) {
        throw new Error("account with email already exists");
    }
}

export const getUser = async (req: Request | Session) => {
    let session = req;
    logger.info(req['headers']);
    if (req['headers']) {
        session = {
            uid: ((req as Request).headers['id'] as string),
            token: ((req as Request).headers['token'] as string),
        }
    }
    const { uid, token }: any = session;
    const user: any = await Account.findOne({ where: { id: uid } });
    if (sha256(`${token}`) !== user.session) {
        throw new Error('Invalid login details');
    }
    return user;
}

export const login = async (email: string, password: string): Promise<Session> => {
    const sha256 = require('sha256');
    const user: any = await Account.findOne({ where: { email } });
    if (!user) {
        throw new Error("Email address is not exists");
    }
    if (sha256(`${user.id}${password}`) !== user.password) {
        throw new Error('Invalid login details');
    }
    const token = uuidv4();
    await user.update({ session: sha256(token) });
    return { uid: user.id, token };
}