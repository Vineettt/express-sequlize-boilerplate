import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { Op, Sequelize } from "sequelize";

const responseClass = require("@/shared/classes/responseClass");
const caseExpression = require("@/shared/constants/case-mapping");
const db = require("@/models");
const User = db.users;

const users = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { limit, offset } = req.body;
      let search = req?.body?.search || "";
      let role = await User.findAll({
        where: {
          email: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: {
          include: [[Sequelize.literal(caseExpression["STATUS_SWITCH_CASE"]), "user_status"]],
          exclude: [
            "reset_token",
            "token",
            "reset_status",
            "created_at",
            "deleted_at",
            "is_deleted",
            "password",
            "login_attempts",
            "updated_at",
            "status"
          ],
        },
        limit,
        offset,
      });
      const count = await User.count({
        where: {
          email: {
            [Op.like]: `%${search}%`,
          },
        },
      });
      responseObject.payload = {
        payload: role,
        length: count,
      };
      responseObject.messageKey = "SUCCESSFULLY_FETCHED";
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

module.exports = users;
