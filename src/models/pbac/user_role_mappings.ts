import { DataTypes, Model, Sequelize } from "sequelize";

type MyDataTypes = typeof DataTypes;

module.exports = (sequelize: Sequelize, DataTypes: MyDataTypes) => {
  class userRoleeMapping extends Model {}
  userRoleeMapping.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      user_fk_id: DataTypes.UUID,
      role_fk_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "user_role_mappings",
    }
  );

  return userRoleeMapping;
};
