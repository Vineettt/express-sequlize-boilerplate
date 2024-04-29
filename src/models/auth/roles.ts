import { DataTypes, Model, Sequelize } from "sequelize";

type MyDataTypes = typeof DataTypes;

module.exports = (sequelize: Sequelize, DataTypes: MyDataTypes) => {
  class roles extends Model {}
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
          msg: 'ROLE_UNIQUE',
          name: 'ROLE_UNIQUE'
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

  return roles;
};
