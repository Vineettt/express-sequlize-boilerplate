import { DataTypes, Model, Sequelize } from "sequelize";

type MyDataTypes = typeof DataTypes;

module.exports = (sequelize: Sequelize, DataTypes: MyDataTypes) => {
  class roleRouteMapping extends Model {}
  roleRouteMapping.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      role_fk_id: DataTypes.UUID,
      route_fk_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "role_route_mappings",
    }
  );

  return roleRouteMapping;
};
