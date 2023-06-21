// import { ethers, network } from "hardhat";
// import hre from "hardhat";
// import fs from 'fs';
// import { deployCoin } from "../../src/blockchain";
// import { scan } from "../../src/templates/workspace";
// import { TemplatesDir } from "../../src/templates/types";
import { parse } from 'csv-parse';
import * as fs from "fs";
import * as path from "path";
import { Room, sequelize } from '../../src/models';

type Room = {
    symbol: string;
    type: string;
};

async function main() {

    const projectId = '1';

    await (async () => {
        let force = true;
        console.log({ force })
        await sequelize.sync({ force });
        if (force) {
            // auth.registerAccount({
            //   username: 'daniel',
            //   email: 'assa.daniel@gmail.com',
            //   password: '123123123'
            // });
        }
    })();

    const csvFilePath = path.resolve(__dirname, 'data/projects/1/rooms.csv');

    const headers = ['symbol', 'type'];

    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });



    parse(fileContent, {
        delimiter: ',',
        columns: headers,
    }, async (error, result: Room[]) => {
        if (error) {
            console.error(error);
        }

        console.log("Result", result);

        const rooms = [];
        for (const w of result) {
            console.log({ w });
            rooms.push({ ...w, projectId });
        }

        await Room.bulkCreate(rooms);

    });

}



const printWithIndices = (a: any[]) => {
    for (let i in a) {
        console.log(`${i}. ${a[i]}`);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
