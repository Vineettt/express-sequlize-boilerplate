import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { iQueryParams } from "../../shared/interfaces/iQueryParams";

const responseClass = require("@/shared/classes/responseClass");
const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const db = require("@/models");
const RRMapping = db.role_route_mappings;
const Role = db["roles"];
const Routes = db["routes"];

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

      let role = req?.body?.role || "";
      let search = req?.body?.search || "";

      const replacements =  {
        limit,
        offset, 
        role_id : `%${role}%`,
        search : `%${search}%`
      };

      let qPClassData: iQueryParams = new queryParams();
      qPClassData.dbName = "PBAC";
      qPClassData.qyKey = "ROLE_ROUTE_MAPPINGS_DATA";
      qPClassData.options_type = "SELECT";
      qPClassData.replacements = replacements
      let payload = await executeQuery(qPClassData);
      
      let qPClassCount: iQueryParams = new queryParams();
      qPClassCount.dbName = "PBAC";
      qPClassCount.qyKey = "ROLE_ROUTE_MAPPINGS_COUNT";
      qPClassCount.options_type = "SELECT";
      qPClassCount.replacements = replacements;
      let count = await executeQuery(qPClassCount);

      responseObject.payload = {
        payload,
        length: count[0]?.count
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