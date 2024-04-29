import { DataTypes, Model, Sequelize } from "sequelize";

type MyDataTypes = typeof DataTypes;

module.exports = (sequelize: Sequelize, DataTypes: MyDataTypes) => {
  class routes extends Model {}
  routes.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      endpoint: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please enter a endpoint",
          },
        },
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please enter a method",
          },
        },
      },
      type: {
        type: DataTypes.STRING
      },
      handler: {
        type: DataTypes.STRING
      },
    },
    {
      sequelize,
      modelName: "routes",
    }
  );

  return routes;
};
