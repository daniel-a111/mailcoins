// export const logger = require("winston-color");
export const logger = {
    info: (msg: string) => {
        console.log(`${new Date()} ${msg}`);
    },
    error: (msg: string) => {
        console.log(`${new Date()} ${msg}`);
    }
}