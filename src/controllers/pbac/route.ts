import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { Op, Sequelize } from "sequelize";
import sequelize from "sequelize/types/sequelize";

const {
  checkArrayExist,
  checkArrObjectMissingKeys,
  getUniqueArrayObjectKey,
  noneExist,
  getArrayOfObjectIndex,
} = require("@/shared/common/array-functions");
const { stringUndefined } = require("@/shared/common/string-functions");
const customErrorClass = require("@/shared/classes/customErrorClass");
const handlerMapping = require("@/shared/constants/handler-mapping");
const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const RRMapping = db.role_route_mappings;
const Routes = db.routes;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      let { role } = req.body;
    
      let rRMappingList = await RRMapping.findAll({
        where: {
          role_fk_id: role
        },
      })

      const uniqueRouteIds = await getUniqueArrayObjectKey(rRMappingList, ["route_fk_id"]);

      let condition: any = {};
      if(uniqueRouteIds.length > 0){
        condition = {
          where: {
            id: {
              [Op.ne]: uniqueRouteIds.join(","),
            },
          },
        };
      }

      condition['attributes']= {
        exclude: ["type", "handler"]
      };

      const payload = await Routes.findAll(condition);

      responseObject.payload = {
        payload
      };
      responseObject.messageKey = "SUCCESSFULLY_FETCHED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.PUT) {
      let { routes, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(IGNORE_KEY, "EDIT_ROUTE");
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["edit", ""],
          "EDIT_ROUTE"
        );
        next(responseObject);
      }
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
      const handlerArr = await getUniqueArrayObjectKey(routes, ["handler"]);
      const checkAS = await noneExist(handlerArr, objectKeys);
      if (!checkAS?.status) {
        throw new customErrorClass(
          checkAS.messageKey,
          "REP_STRING",
          ["handler"],
          "handler"
        );
      }
      const uniqueArrayID = await getUniqueArrayObjectKey(routes, ["id"]);
      const criteria = {
        id: {
          [Op.in]: uniqueArrayID,
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
        let iRoute = await getArrayOfObjectIndex(routes, rt.id, "id");
        rt.handler = routes[iRoute]["handler"];
        rt.save();
      }
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

module.exports = login;
