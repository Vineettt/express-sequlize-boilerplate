import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { Op, col, fn } from "sequelize";

const {
  checkArrayExist,
  checkArrObjectMissingKeys,
  getUniqueArrayObjectKey,
  noneExist,
  getArrayOfObjectIndex,
} = require("@/shared/common/array-functions");
const customErrorClass = require("@/shared/classes/customErrorClass");
const handlerMapping = require("@/shared/constants/handler-mapping");
const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const Routes = db.routes;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.PUT) {
      let { routes } = req.body;
      let cAExist = await checkArrayExist(routes);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Routes"],
          "routes"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(routes, ["id", "handler"]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Routes", CAOMKeys?.missingKeys?.join(",")],
          "routes"
        );
      }
      const objectKeys = Object.keys(handlerMapping);
      objectKeys.splice(0, 1);
      const handlerArr = getUniqueArrayObjectKey(routes, ["handler"]);
      const checkAS = await noneExist(handlerArr, objectKeys);
      if (!checkAS?.status) {
        throw new customErrorClass(
          checkAS.messageKey,
          "REP_STRING",
          ["handler"],
          "handler"
        );
      }
      const uniqueArrayID = getUniqueArrayObjectKey(routes, ["id"]);
      const criteria = {
        id: {
          [Op.in]: [uniqueArrayID],
        },
      };
      const count = await Routes.count({
        where: criteria,
      });
      if (uniqueArrayID.length !== count) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["id"],
          "id"
        );
      }

      let routeList = await Routes.findAll({ where: criteria });
      for (const rt of routeList) {
        let iRoute = getArrayOfObjectIndex(routes, rt.id, "id");
        rt.handler = routes[iRoute]["handler"];
        rt.save();
      }
      responseObject.messageKey = "SUCCESSFULLY_UPDATED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.GET) {
      const { limit, offset } = req.body;
      let routes = await Routes.findAll({
        limit,
        offset,
        attributes: {
          include: [[fn("COALESCE", col("handler"), ""), "handler"]],
          exclude: ["type"],
        },
      });
      responseObject.payload = {
        payload: routes,
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

module.exports = login;
