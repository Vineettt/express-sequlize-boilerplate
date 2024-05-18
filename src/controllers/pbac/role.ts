import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { Op } from "sequelize";

const {
  checkArrayExist,
  checkArrObjectMissingKeys
} = require("@/shared/common/array-functions");
const {stringUndefined} = require("@/shared/common/string-functions");
const customErrorClass = require("@/shared/classes/customErrorClass");
const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const Role = db.roles;
const RRMapping = db.role_route_mappings;
const URMapping =db.user_role_mappings;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { role } = req.body;
      const rObject = {
        role,
      };
      const response = await Role.create(rObject);
      responseObject.messageKey = "SUCCESSFULLY_ADDED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.GET) {
      let role = await Role.findAll();
      responseObject.payload = {
        payload: role,
      };
      responseObject.messageKey = "SUCCESSFULLY_FETCHED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.DELETE) {
      let { role_ids, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(IGNORE_KEY, "DELETE_ROLE");
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["role"],
          "role"
        );
        next(responseObject);
      }
      let cAExist = await checkArrayExist(role_ids);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Role_ids"],
          "role_ids"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(role_ids, [
        "role_id",
      ]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Role_ids", CAOMKeys?.missingKeys?.join(",")],
          "role_ids"
        );
      }
      let role_id_list = role_ids.map((obj: any) => obj.role_id);
      console.log(role_id_list);
      const rRMappingCount = await RRMapping.count({
        where: {
          role_fk_id: {
            [Op.in]: role_id_list
          }
        }
      });

      if(rRMappingCount !== 0){
        throw new customErrorClass(
          "REP_DATA_EXIST_TABLE_MAPPING",
          "REP_STRING",
          ["Role Route Mapping", rRMappingCount],
          "role_route_mapping"
        );
      }

      const uRMappingCount = await URMapping.count({
        where: {
          role_fk_id: {
            [Op.in]: role_id_list
          }
        }
      });

      if(uRMappingCount!== 0){
        throw new customErrorClass(
          "REP_DATA_EXIST_TABLE_MAPPING",
          "REP_STRING",
          ["User", uRMappingCount],
          "user"
        );
      }

      const rCount = await Role.count({
        where: {
          id: {
            [Op.in]: role_id_list
          }
        }
      });

      if(uRMappingCount!== 0){
        throw "NO_RECORDS_DELETE"
      }

      await Role.destroy({
        where: {
          id: {
            [Op.in]: role_id_list,
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

module.exports = login;