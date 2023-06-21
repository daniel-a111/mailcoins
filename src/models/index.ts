import { SeqWrapper } from "scaas/src/vm/wrappers/seq";
import { DataTypes } from "sequelize";
import * as conn from "./connection";

export const sequelize = new SeqWrapper(conn.sequelize);

export const Settings = sequelize.define("settings", {
    master: DataTypes.STRING,
    agenciesManager: DataTypes.STRING,
});


export const Mail = conn.sequelize.define('mail', {
    id: { type: DataTypes.STRING, primaryKey: true },
    processed: DataTypes.DATE
});