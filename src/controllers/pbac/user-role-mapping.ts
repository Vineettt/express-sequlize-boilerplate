import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { iQueryParams } from "../../shared/interfaces/iQueryParams";
import { Op } from "sequelize";

const responseClass = require("@/shared/classes/responseClass");
const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const db = require("@/models");
const User = db["users"];

const roleRouteMapping = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { limit, offset } = req.body;

      let search = req?.body?.search || "";

      const replacements = {
        limit,
        offset,
        search: `%${search}%`,
      };

      let qPClassData: iQueryParams = new queryParams();
      qPClassData.dbName = "PBAC";
      qPClassData.qyKey = "USER_ROLE_MAPPING_DATA";
      qPClassData.options_type = "SELECT";
      qPClassData.replacements = replacements;
      let payload = await executeQuery(qPClassData);

      const count = await User.count({
        where: {
          email: {
            [Op.like]: `%${search}%`,
          },
        },
      });

      responseObject.payload = {
        payload,
        length: count,
      };

      responseObject.messageKey = "SUCCESSFULLY_UPDATED";
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

module.exports = roleRouteMapping;
