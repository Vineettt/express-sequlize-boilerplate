import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { Op } from "sequelize";

const {
  checkArrayExist,
  checkArrObjectMissingKeys,
  getUniqueArrayObjectKey,
  onlyInLeft,
} = require("@/shared/common/array-functions");
const { stringUndefined } = require("@/shared/common/string-functions");
const customErrorClass = require("@/shared/classes/customErrorClass");
const responseClass = require("@/shared/classes/responseClass");
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
      const { mapping } = req.body;
      let cAExist = await checkArrayExist(mapping);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Mapping"],
          "mapping"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(mapping, [
        "role_id",
        "route_id",
      ]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Routes", CAOMKeys?.missingKeys?.join(",")],
          "mapping"
        );
      }

      const uniqueArrayRole = getUniqueArrayObjectKey(mapping, ["role_id"]);
      const uniqueArrayRoute = getUniqueArrayObjectKey(mapping, ["route_id"]);

      const countRoute = await Routes.count({
        where: {
          id: {
            [Op.in]: uniqueArrayRoute,
          },
        },
      });

      const countRole = await Role.count({
        where: {
          id: {
            [Op.in]: uniqueArrayRole,
          },
        },
      });

      if (uniqueArrayRoute.length !== countRoute) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["Routes"],
          "routes"
        );
      }

      if (uniqueArrayRole.length !== countRole) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["Role"],
          "role"
        );
      }
      const mappingArray = await RRMapping.findAll({
        where: {
          role_fk_id: {
            [Op.in]: uniqueArrayRole,
          },
        },
      });

      const insertAO = await onlyInLeft(mapping, mappingArray, isMapping);

      if(insertAO.length > 0){
        insertAO.forEach((el: { role_fk_id: any; role_id: any; route_fk_id: any; route_id: any; }) => {
          el.role_fk_id = el.role_id
          el.route_fk_id = el.route_id
          delete el.role_id
          delete  el.route_id
        });
        await RRMapping.bulkCreate(insertAO);
      }else{
        throw new customErrorClass(
          "REP_ALREADY_EXIST",
          "REP_STRING",
          ["Mapping"],
          "mapping"
        );
      }

      responseObject.messageKey = "SUCCESSFULLY_UPDATED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.DELETE) {
      let { mapping, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(IGNORE_KEY, "DELETE_ROLE_ROUTE_MAPPING");
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["delete", ""],
          "DELETE_ROLE_ROUTE_MAPPING"
        );
        next(responseObject);
        return;
      }
      let cAExist = await checkArrayExist(mapping);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Mapping"],
          "mapping"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(mapping, ["mapping_id"]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Roles", CAOMKeys?.missingKeys?.join(",")],
          "roles"
        );
      }
      let rrm_list = mapping.map((obj: any) => obj.mapping_id);
      const rRMappingCount = await RRMapping.count({
        where: {
          role_fk_id: {
            [Op.in]: rrm_list,
          },
        },
      });

      if (rRMappingCount !== 0) {
        throw new customErrorClass(
          "REP_DATA_EXIST_TABLE_MAPPING",
          "REP_STRING",
          ["Role Route Mapping", rRMappingCount],
          "role_route_mapping"
        );
      }

      await RRMapping.destroy({
        where: {
          id: {
            [Op.in]: rrm_list,
          },
        },
      });
      responseObject.messageKey = "SUCCESSFULLY_DELETED";
      next(responseObject);

    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

const isMapping = (
  a: {
    role_id: any;
    route_id: any;
  },
  b: {
    role_fk_id: any;
    route_fk_id: any;
  }
) => a.role_id === b.role_fk_id && a.route_id === b.route_fk_id;

module.exports = roleRouteMapping;
