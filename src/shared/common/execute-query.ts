import { QueryTypes } from "sequelize";
import { iQueryParams } from "../interfaces/iQueryParams";

const queryMapping = require("@/shared/constants/query-mapping")
const DBs = require("@/shared/constants/dbs-list")
const logger = require("@/shared/common/logger");
const db = require("@/models");

const executeQuery = (iQParams: iQueryParams)=>{
    try {
        const conn = db[DBs[iQParams?.dbName]];
        return conn.query(queryMapping[iQParams?.qyKey], {replacements: iQParams.replacements, type: qTList[iQParams.options_type]});
    } catch (error) {
        logger.error(`Error execute ${error}`)
    }
}

const qTList : any = {
    SELECT: QueryTypes.SELECT,
    UPDATE: QueryTypes.UPDATE,
}

module.exports = executeQuery;