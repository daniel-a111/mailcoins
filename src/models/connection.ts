import { Sequelize } from "sequelize";
import * as config from "../config";

// console.log(config.POSTGRES_URI);
// process.exit(0);
export const sequelize = new Sequelize(config.POSTGRES_URI);
