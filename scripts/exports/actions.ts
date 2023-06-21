// import { ethers, network } from "hardhat";
// import hre from "hardhat";
// import fs from 'fs';
// import { deployCoin } from "../../src/blockchain";
// import { scan } from "../../src/templates/workspace";
// import { TemplatesDir } from "../../src/templates/types";
import { Action } from 'scaas/src/models';

async function main() {
    const actions: any = await Action.findAll({ order: [['id', 'ASC']], raw: true });
    for (const action of actions) {
        console.log({ action });
    }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
