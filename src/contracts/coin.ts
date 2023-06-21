import { Addr, ContractDeploy } from "scaas/src/vm/core";
import { VM, registerContract } from "scaas/src/vm/vm";
import { DataTypes } from "sequelize";
import { sequelize } from "../models";


registerContract(() => {
    return {
        __filename, methods: [
            deploy,

            name,
            symbol,

            mint,
            burn,

            balanceOf,
            transfer,

            allowance,
            approve,
            transferFrom,
        ]
    };
});

export const State = sequelize.define('coin', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    owner: DataTypes.STRING
}, {
    indexes: []
});


export const Balance = sequelize.define('balance', {
    // id: { type: DataTypes.STRING, primaryKey: true },
    addr: DataTypes.STRING,
    amount: { type: DataTypes.REAL, defaultValue: 0 }
}, {
    indexes: []
});


export const Allowance = sequelize.define('allowance', {
    id: { type: DataTypes.STRING, primaryKey: true },
    addr: DataTypes.STRING,
    spender: DataTypes.STRING,
    amount: { type: DataTypes.REAL, defaultValue: 0 }
}, {
    indexes: []
});



export const deploy: ContractDeploy<any, Addr> = async (vm: VM, { name, symbol }: { name: string; symbol: string; }): Promise<Addr> => {
    const id = vm.env().addr.id;
    await State.bind(vm).create({ id, name, symbol, owner: vm.env().message.sender.id });
    return vm.env().addr;
}


interface Mint {
    addr: string;
    amount: number;
}

type Burn = Mint;
type Transfer = Mint;
type Approve = { spender: string; amount: number };
type TransferFrom = Transfer & { owner: string };

export const name = async (vm: VM, data: undefined): Promise<any> => {
    const state: any = await State.bind(vm).findOne();
    return state.name;
}
export const symbol = async (vm: VM, data: undefined): Promise<any> => {
    const state: any = await State.bind(vm).findOne();
    return state.symbol;
}

export const mint = async (vm: VM, data: Mint): Promise<any> => {
    if (!await _isOwner(vm)) {
        throw new Error("owner only");
    }
    return await _mint(vm, data);
}

export const burn = async (vm: VM, data: Burn): Promise<any> => {
    if (!await _isOwner(vm)) {
        throw new Error("owner only");
    }
    return await _burn(vm, data);
}

const _mint = async (vm: VM, data: Mint): Promise<any> => {
    const { addr, amount } = data;
    if (amount <= 0) {
        throw new Error("invalid mint value. should be greater than 0");
    }
    const addrExists = !!(await Balance.bind(vm).findOne({ where: { addr } }));
    if (!addrExists) {
        await Balance.bind(vm).create({ addr: addr, amount: 0 });
    }
    await Balance.bind(vm).update({ amount: sequelize.sequlize.literal(`amount + ${amount}`) }, { where: { addr } });
}


const _burn = async (vm: VM, data: Burn): Promise<any> => {
    const { addr, amount } = data;
    if (amount <= 0) {
        throw new Error("invalid mint value. should be greater than 0");
    }
    const balance: any = await Balance.bind(vm).findOne({ where: { addr } });
    if (!balance || balance.amount < amount) {
        throw new Error("insufficiant balance...");
    }
    await Balance.bind(vm).update({ amount: sequelize.sequlize.literal(`amount - ${amount}`) }, { where: { addr } });
    await Balance.bind(vm).destroy({ where: { amount: 0 } });
}

const _isOwner = async (vm: VM): Promise<any> => {
    return !!(await State.bind(vm).findOne({ where: { owner: vm.env().message.sender.id } }));
}

export const balanceOf = async (vm: VM, addr: string): Promise<any> => {
    return _balanceOf(vm, addr);
}

const _balanceOf = async (vm: VM, addr: string): Promise<number> => {
    const balance: any = await Balance.bind(vm).findOne({ where: { addr } });
    if (!balance) {
        return 0;
    }
    return balance.amount;
}

export const transfer = async (vm: VM, data: Transfer): Promise<any> => {
    return await _transfer(vm, vm.env().message.sender.id, data.addr, data.amount);
}

const _transfer = async (vm: VM, from: string, to: string, amount: number): Promise<any> => {
    if (amount <= 0) {
        throw new Error("invalid mint value. should be greater than 0");
    }
    const balance: any = await Balance.bind(vm).findOne({ where: { addr: from } });
    if (!balance || balance.amount < amount) {
        throw new Error("insufficiant balance...");
    }

    const destBalance = !!(await Balance.bind(vm).findOne({ where: { addr: to } }));
    if (!destBalance) {
        await Balance.bind(vm).create({ addr: to, amount: 0 });
    }
    await Balance.bind(vm).update({ amount: sequelize.sequlize.literal(`amount + ${amount}`) }, { where: { addr: to } });
    await Balance.bind(vm).update({ amount: sequelize.sequlize.literal(`amount - ${amount}`) }, { where: { addr: from } });
}

export const totalSupply = async (vm: VM, addr: string): Promise<any> => {
    return sequelize.sequlize.query(`select SUM(amount) as total from balances where "contractId"='${vm.env().addr.id}'`)[0][0].total;
}

export const approve = async (vm: VM, data: Approve): Promise<any> => {
    return await _approve(vm, data);
}

const _approve = async (vm: VM, data: Approve): Promise<any> => {
    const { spender, amount } = data;
    const addr = vm.env().message.sender.id;
    const allowance: any = await Allowance.bind(vm).findOne({ where: { addr, spender } });
    if (!allowance) {
        await Allowance.bind(vm).create({ addr: vm.env().message.sender.id, spender, amount });
    } else {
        await Allowance.bind(vm).update({ amount: sequelize.sequlize.literal(`amount + ${amount}`) }, { where: { addr, spender } });
    }
}

export const allowance = async (vm: VM, { owner, spender }: { owner: string, spender: string }): Promise<any> => {
    return await _allowance(vm, owner, spender);
}


export const _allowance = async (vm: VM, owner: string, spender: string): Promise<any> => {
    const addr = owner;
    const allow: any = await Allowance.bind(vm).findOne({ where: { addr, spender } });
    return allow?.amount || 0;
}


export const transferFrom = async (vm: VM, data: TransferFrom): Promise<any> => {
    if (await _allowance(vm, data.owner, vm.env().message.sender.id) < data.amount) {
        throw new Error("no allowance");
    }
    return await _transfer(vm, data.owner, data.addr, data.amount);

}
