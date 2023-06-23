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
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    date: DataTypes.DATE,
    subject: DataTypes.STRING,
    text: DataTypes.STRING,
    processed: { type: DataTypes.DATE, defaultValue: null },
    override: DataTypes.STRING,
});


export const Feedback = conn.sequelize.define('feedback', {
    // messageId: DataTypes.STRING,
    actionId: DataTypes.INTEGER,
    // eventId: DataTypes.INTEGER,
    messageId: DataTypes.STRING,
    nonce: DataTypes.INTEGER,
});