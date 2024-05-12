import { NextFunction, Request, Response } from "express";
import HTTPMethod from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { iQueryParams } from "../../shared/interfaces/iQueryParams";

const responseClass = require("@/shared/classes/responseClass");
const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const { hashCompare } = require("@/shared/common/hashing");
const { generateJwt } = require("@/shared/common/jwt");

const db = require("@/models");
const User = db.users;

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
      let qPClassR: iQueryParams = new queryParams();
      qPClassR.dbName = "PBAC";
      qPClassR.qyKey = "USER_ROLES";
      qPClassR.options_type = "SELECT";
      qPClassR.replacements = {
        user_fk_id: user.id
      };
      let roles = await executeQuery(qPClassR);
      user.dataValues.roles = roles.map((obj: { role: any; }) => obj.role);

      let qPClassP: iQueryParams = new queryParams();
      qPClassP.dbName = "PBAC";
      qPClassP.qyKey = "USER_PERMISSIONS";
      qPClassP.options_type = "SELECT";
      qPClassP.replacements = {
        user_fk_id: user.id
      };
      let permissions = await executeQuery(qPClassP);
      user.dataValues.permissions = permissions;

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
    const user = await User.findOne({
      where: { email: email },
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

