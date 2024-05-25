import { NextFunction, Request, Response } from "express";
import { iResponse } from "../../shared/interfaces/iResponse";
import { iQueryParams } from "../../shared/interfaces/iQueryParams";
import { Sequelize } from "sequelize";

const { HTTPMethod } = require("http-method-enum");
const responseClass = require("@/shared/classes/responseClass");
const generateRandomString = require("@/shared/common/generate-random-string");
const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const sendMail = require("@/shared/email/send-email");
const accountStatus = require("@/shared/constants/account-status");
const db = require("../../models");
const User = db.users;
const Role = db.roles;
const UseRoleMapping = db.user_role_mappings;
const { verifyJwt } = require("@/shared/common/jwt");
const JWT_SECRET = process.env.JWT_SECRET;

const user = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { email, password, first_name, last_name } = req.body;
      const user = {
        email,
        password,
        first_name,
        last_name,
        created_at : Sequelize.fn("NOW")
      };
      const response = await User.create(user);
      const role_user = await Role.findOne({ where: { role: "user" } });

      const ur_mapping = {
        user_fk_id: response.id,
        role_fk_id: role_user.id,
      };

      await UseRoleMapping.create(ur_mapping);

      let activationToken = await generateRandomString(64, true, true);
      await User.updateRow(
        { token: activationToken },
        { where: { id: response.id } }
      );
      responseObject.messageKey = "SUCCESSFULLY_REGISTERED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.GET) {
      const token = req.headers.authorization;
      let vJwtPayload = await verifyJwt(token, JWT_SECRET);
      const user = await userDetailsByID(vJwtPayload.key);

      let qPClassR: iQueryParams = new queryParams();
      qPClassR.dbName = "PBAC";
      qPClassR.qyKey = "USER_ROLES";
      qPClassR.options_type = "SELECT";
      qPClassR.replacements = {
        user_fk_id: user.id,
      };
      let roles = await executeQuery(qPClassR);
      user.dataValues.roles = roles.map((obj: { role: any }) => obj.role);

      let qPClassP: iQueryParams = new queryParams();
      qPClassP.dbName = "PBAC";
      qPClassP.qyKey = "USER_PERMISSIONS";
      qPClassP.options_type = "SELECT";
      qPClassP.replacements = {
        user_fk_id: user.id,
      };
      let permissions = await executeQuery(qPClassP);
      delete user.dataValues.status;
      user.dataValues.permissions = permissions;
      responseObject.messageKey = "LOGIN_SUCCESS";
      responseObject.payload = {
        user: user,
      };
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const userDetailsByID = async function (id: string) {
  const user = await User.findOne({
    where: { id: id, status : accountStatus["ACCOUNT_ACTIVATED"] },
    attributes: {
      exclude: [
        "reset_token",
        "token",
        "reset_status",
        "created_at",
        "updated_at",
        "deleted_at",
        "is_deleted",
        "password"
      ],
    },
  });
  if (user) {
    return user;
  }
};

module.exports = user;