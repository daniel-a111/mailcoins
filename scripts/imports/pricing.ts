// import { ethers, network } from "hardhat";
// import hre from "hardhat";
// import fs from 'fs';
// import { deployCoin } from "../../src/blockchain";
// import { scan } from "../../src/templates/workspace";
// import { TemplatesDir } from "../../src/templates/types";
import csv from 'csv-parser';
import * as fs from "fs";
import * as path from "path";
import { Pricing, Room, sequelize } from '../../src/models';

type Room = {
    symbol: string;
    type: string;
};

async function main() {

    const projectId = '1';

    await (async () => {
        let force = false;
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

    const csvFilePath = path.resolve(__dirname, 'data/projects/1/pricing.csv');

    const headers = ['symbol', 'type'];

    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const results: any[] = [];

    fs.createReadStream(path.resolve(__dirname, 'data/projects/1/pricing.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {


            const pricingData: any[] = [];
            for (const pricing of results) {

                const roomType = pricing['type'];
                const priceCost: string = pricing['price/cost'];

                const cost = parseFloat(priceCost.substring(0, priceCost.indexOf('/')));
                const price = parseFloat(priceCost.substring(priceCost.indexOf('/') + 1));

                pricingData.push({ roomType, cost, price, projectId });
            }

            console.log({ pricingData });

            await Pricing.bulkCreate(pricingData);
            // console.log(results);
            // [
            //   { NAME: 'Daffy Duck', AGE: '24' },
            //   { NAME: 'Bugs Bunny', AGE: '22' }
            // ]
        });
    // parse(fileContent, {
    //     delimiter: ',',
    //     columns: headers,
    // }, async (error, result: Room[]) => {
    //     if (error) {
    //         console.error(error);
    //     }

    //     console.log("Result", result);

    //     const rooms = [];
    //     for (const w of result) {
    //         console.log({ w });
    //         rooms.push({ ...w, projectId });
    //     }

    //     await Room.bulkCreate(rooms);

    // });

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
