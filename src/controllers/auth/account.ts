import HTTPMethod from "http-method-enum";
import { NextFunction, Request, Response } from "express";
import { iResponse } from "../../shared/interfaces/iResponse";
import { Sequelize } from "sequelize";

const responseClass = require("@/shared/classes/responseClass");
const caseExpression = require("@/shared/constants/case-mapping");

const db = require("@/models");
const User = db.users;

const account = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject:iResponse = new responseClass();
  try {
    responseObject.resType ="TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { token } = req.body;
      const userStatus = await activationDetails(token, -1);
      if (userStatus == true) {
        await User.updateRow({ status: 0 }, { where: { token: token } });
        responseObject.messageKey = "ACCOUNT_ACTIVATED";
        next(responseObject);
      }
    }
    if (req.method === HTTPMethod.GET) {
      const { token } = req.body;
      const details = await accountDetailsByToken(token);
      responseObject.messageKey = "SUCCESS";
      responseObject.payload = {
        user: details
      }
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const activationDetails = async function (token: any, status: any) {
  try {
    const user = await User.findOne({
      where: {
        token,
        status,
      },
      attributes: {
        exclude: [
          "created_at",
          "updated_at",
          "deleted_at",
          "is_deleted",
          "password",
        ],
      },
    });
    if (!user) {
      throw Error("ACTIVATION_TOKEN_EXPIRED");
    }
    if (token == user.token) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};

const accountDetailsByToken = async function (token: any) {
  try {
    const user = await User.findOne({
      where: {
        token,
      },
      attributes: {
        include: [[Sequelize.literal(caseExpression["STATUS_SWITCH_CASE"]), "account_status"]],
        exclude: [
          "company_name",
          "created_at",
          "updated_at",
          "deleted_at",
          "is_deleted",
          "password",
          "token",
          "reset_token",
          "reset_status",
          "id",
          "img_path",
          "role",
        ],
      },
    });
    if (!user) {
      throw Error("ACTIVATION_TOKEN_EXPIRED");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = account;
