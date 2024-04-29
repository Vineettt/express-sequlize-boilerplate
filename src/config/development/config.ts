const logger = require("@/shared/common/logger")
  
import config from "../index";
const { dbVariables } = config();

module.exports = {
  databases: {
    Auth: {
      username: dbVariables.dbAuthUsername,
      password: dbVariables.dbAuthPassword,
      database: dbVariables.dbAuthName,
      host: dbVariables.dbAuthHost,
      port: dbVariables.dbAuthPort,
      dialect: dbVariables.dbAuthDialect,
      logging: (msg: any) => logger.info(msg),
      define: {
        freezeTableName: true,
        timestamps: false
      }
    },
  },
};
