// import "../env";

// import hre from "hardhat";
import { env } from "process";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '/../.env' });

export const DECRYPT_KEY = env.DECRYPT_KEY || '00';
export const DECRYPT_IV = env.DECRYPT_IV || '00';
export const POSTGRES_URI = env.POSTGRES_URI || 'postgres://postgres:123123123@localhost:5433/quests'
export const SLODITIY = env.SLODITIY || './contracts'
export const HARDHAT_ARTIFACTS = env.HARDHAT_ARTIFACTS || './artifacts';
// export const SOURCES = hre.config.paths.sources;
// export const ARTIFACTS = hre.config.paths.artifacts;

export const NETWORK = env.NETWORK || 'localhost';
export const DEPLOYMENTS = env.DEPLOYMENTS || './deployments';


export const SEND_EMAILS = env.SEND_EMAILS || false;
