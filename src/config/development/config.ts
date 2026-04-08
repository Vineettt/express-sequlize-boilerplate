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
      logging: false,
      define: {
        freezeTableName: true,
        timestamps: false
      }
    },
    Pbac: {
      username: dbVariables.dbPbacUsername,
      password: dbVariables.dbPbacPassword,
      database: dbVariables.dbPbacName,
      host: dbVariables.dbPbacHost,
      port: dbVariables.dbPbacPort,
      dialect: dbVariables.dbPbacDialect,
      logging: false,
      define: {
        freezeTableName: true,
        timestamps: false
      }
    },
  },
};
