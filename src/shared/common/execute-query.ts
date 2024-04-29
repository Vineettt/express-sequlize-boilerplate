import { QueryTypes } from "sequelize";
import { iQueryParams } from "../interfaces/iQueryParams";

const queryMapping = require("@/shared/constants/query-mapping")
const DBs = require("@/shared/constants/dbs-list")
const logger = require("@/shared/common/logger");
const db = require("@/models");

const executeQuery = (iQParams: iQueryParams)=>{
    try {
        console.log(iQParams)
        const conn = db[DBs[iQParams?.dbName]];
        return conn.query(queryMapping[iQParams?.qyKey], {replacements: iQParams.replacements, type: QueryTypes.SELECT});
    } catch (error) {
        logger.error(`Error execute ${error}`)
    }
}

module.exports = executeQuery;