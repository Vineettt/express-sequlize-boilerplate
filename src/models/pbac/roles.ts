import { DataTypes, Model, Sequelize } from "sequelize";
const logger = require("@/shared/common/logger");

type MyDataTypes = typeof DataTypes;

module.exports = (sequelize: Sequelize, DataTypes: MyDataTypes) => {
  class roles extends Model {
    static updateRolesTable: () => Promise<void>;
  }
  roles.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "ROLE_UNIQUE",
          name: "ROLE_UNIQUE",
        },
        validate: {
          notNull: {
            msg: "ROLE_ENTER",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "roles",
    }
  );

  roles.updateRolesTable = async function () {
    roles
      .bulkCreate(
        [
          {
            id: "7d0c9dbd-1923-47ac-a1ee-e4039f379180",
            role: "user",
          },
        ],
        {
          ignoreDuplicates: true,
        }
      )
      .then(() => logger.info("Data have been saved"));
  };

  return roles;
};
