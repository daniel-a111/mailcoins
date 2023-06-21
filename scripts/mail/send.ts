import { sendMail } from "../../src/services/email";

async function main() {

    await sendMail();
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
