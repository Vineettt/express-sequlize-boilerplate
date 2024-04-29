import { DataTypes, Model, Sequelize } from "sequelize";
const  validateEmail = require("@/shared/email/validate-email");
const {hashString} = require("@/shared/common/hashing");

type MyDataTypes = typeof DataTypes;

module.exports = (sequelize: Sequelize, DataTypes: MyDataTypes) => {
  class users extends Model {
    password: string | undefined;
    static updateRow(arg0: any, arg1: any) {
    }
    email: string | undefined;
    id: string | undefined;
    role_id: string | undefined;
    status: number | undefined;
    reset_status: number | undefined;
    token: string | undefined;
    reset_token: string | undefined;
    updated_at: any;
  }
  users.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: {
          msg: 'EMAIL_UNIQUE',
          name: 'EMAIL_UNIQUE'
        },
        allowNull: false,
        validate: {
          validateEmail: async (email: string) => {
            const response = await validateEmail(email);
            if (response[0] == false) {
              throw new Error(response[1]);
            }
          },
          notNull: {
            msg: "Please enter a email",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          validatePassword: function (password: string) {
            if (
              !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                password
              )
            ) {

              throw new Error("PASSWORD_VALIDATION");
            }
          },
          notNull: {
            msg: "Please enter a password",
          },
        },
      },
      reset_token: {
        type: DataTypes.STRING,
      },
      reset_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      token: DataTypes.STRING,
      role_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please enter a role",
          },
        },
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: -1,
      },
      is_deleted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "users",
    }
  );

  users.addHook("afterValidate", async (user: users) => {
    if (user.password !== undefined) {
      return (user.password = await hashString(user.password));
    }
  });

  users.updateRow = async function (updateQuery: any, condition: any) {
    try {
      updateQuery["updated_at"] = sequelize.fn("NOW");
      return await this.update(updateQuery, condition);
    } catch (error) {
      throw error;
    }
  };

  return users;
};
