import { NextFunction, Request, Response } from "express";
import HTTPMethod from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";

const responseClass = require("@/shared/classes/responseClass");
const { hashCompare } = require("@/shared/common/hashing");
const { generateJwt } = require("@/shared/common/jwt");

const db = require("@/models");
const RoleRouteMapping = db["role-route-mappings"];
const User = db.users;
const Role = db.roles;

const JWT_EXPIRES_IN = 60 * 60 * 24 * 365;
const { JWT_SECRET } = process.env;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { email, password } = req.body;
      const user = await getUserByEmailAndPassword(email, password);
      if (user.roles.length > 0) {
        user.dataValues.role = user.roles[0].role;
        delete user.dataValues.roles;
        delete user.dataValues.role_id;
      }
      if (user.status == 0) {
        const access_token = await generateJwt(
          {
            email: user.email,
            key: user.id,
            role: user.dataValues.role,
          },
          JWT_SECRET,
          JWT_EXPIRES_IN
        );
        delete user.dataValues.status;
        responseObject.messageKey = "LOGIN_SUCCESS";
        responseObject.payload = {
          token: access_token,
          user: user,
        };
        next(responseObject);
      } else {
        responseObject.messageKey = "ACTIVATE_ACCOUNT";
        responseObject.statusCodeKey = "ACTIVATION_PENDING";
        next(responseObject);
      }
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const getUserByEmailAndPassword = async function (
  email: string,
  password: string
) {
  try {
    User.hasMany(Role, { foreignKey: "id", sourceKey: "role_id" });
    User.hasMany(RoleRouteMapping, {
      foreignKey: "role_fk_id",
      sourceKey: "role_id",
    });

    const user = await User.findOne({
      where: { email: email },
      include: [
        {
          model: Role,
          as: "roles",
          attributes: {
            exclude: ["id"],
          },
        },
        {
          model: Role,
          as: "roles",
          attributes: {
            exclude: ["id"],
          },
        },
      ],
      attributes: {
        exclude: [
          "role",
          "reset_token",
          "token",
          "reset_status",
          "created_at",
          "updated_at",
          "deleted_at",
          "is_deleted",
        ],
      },
    });
    if (!password) {
      throw Error("PASSWORD_REQUIRED");
    }
    if (user) {
      const isAuthenticated = await hashCompare(password, user.password);
      if (isAuthenticated) {
        delete user.dataValues.password;
        return user;
      }
      throw Error("PASSWORD_INCORRECT");
    } else {
      throw Error("EMAIL_INCORRECT");
    }
  } catch (error) {
    throw error;
  }
};

module.exports = login;
