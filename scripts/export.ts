import fs from "fs";
import { Action } from "scass/src/models";

async function main() {
    const er = {};
    console.log({ er });

    const actions = await Action.findAll({ raw: true });
    console.log({ actions });

    let i = 0;
    let path = '';
    while (i++ === 0 || (fs.existsSync(path) && i < 200)) {
        path = `./actions.case.${i}.json`;
    }
    fs.writeFileSync(path, JSON.stringify({ actions, date: new Date() }, null, 2));
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
