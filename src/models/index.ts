const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const { removeExtension } = require("@/shared/common/string-functions");
const env = process.env.NODE_ENV || "development";
const logger = require("@/shared/common/logger");

const db: any = {};

try {
  const config = require(path.resolve(
    path.join(path.dirname(__dirname), `config/${env}`),
    "config"
  ));
  const databases = Object.keys(config.databases);

  for (let i = 0; i < databases.length; ++i) {
    let database = databases[i];
    let dbPath = config.databases[database];
    if (config.use_env_variable) {
      db[database] = new Sequelize(
        process.env[config.use_env_variable],
        config
      );
    } else {
      db[database] = new Sequelize(
        dbPath.database,
        dbPath.username,
        dbPath.password,
        dbPath
      );
    }
  }

  for (let i = 0; i < databases.length; ++i) {
    let database = databases[i].toLowerCase();
    fs.readdirSync(`${__dirname}/${database}`)
      .filter((file: string) => {
        return (
          file.indexOf(".") !== 0 &&
          file !== basename &&
          file.slice(-3) === ".js"
        );
      })
      .forEach(async (file: any) => {
        const model = require(path.join(
          `${__dirname}/${database}`,
          removeExtension(file)
        ))(db[databases[i]], Sequelize.DataTypes);

        db[model.name] = model;
      });
  }

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
} catch (error) {
  logger.error(error);
}

module.exports = db;
