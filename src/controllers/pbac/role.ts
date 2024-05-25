import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { Op } from "sequelize";

const {
  checkArrayExist,
  checkArrObjectMissingKeys,
  getArrayOfObjectIndex,
} = require("@/shared/common/array-functions");
const { stringUndefined } = require("@/shared/common/string-functions");
const customErrorClass = require("@/shared/classes/customErrorClass");
const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const Role = db.roles;
const RRMapping = db.role_route_mappings;
const URMapping = db.user_role_mappings;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { roles } = req.body;
      let cAExist = await checkArrayExist(roles);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Roles"],
          "roles"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(roles, [
        "role"
      ]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Roles", CAOMKeys?.missingKeys?.join(",")],
          "roles"
        );
      }
      await Role.bulkCreate(roles);
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
      let { roles, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(IGNORE_KEY, "DELETE_ROLE");
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["delete", ""],
          "DELETE_ROLE"
        );
        next(responseObject);
        return;
      }
      let cAExist = await checkArrayExist(roles);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Roles"],
          "roles"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(roles, ["role_id"]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Roles", CAOMKeys?.missingKeys?.join(",")],
          "roles"
        );
      }
      let role_id_list = roles.map((obj: any) => obj.role_id);
      const rRMappingCount = await RRMapping.count({
        where: {
          role_fk_id: {
            [Op.in]: role_id_list,
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

      const uRMappingCount = await URMapping.count({
        where: {
          role_fk_id: {
            [Op.in]: role_id_list,
          },
        },
      });

      if (uRMappingCount !== 0) {
        throw new customErrorClass(
          "REP_DATA_EXIST_TABLE_MAPPING",
          "REP_STRING",
          ["User", uRMappingCount],
          "user"
        );
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
    if (req.method === HTTPMethod.PUT) {
      let { roles, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(IGNORE_KEY, "EDIT_ROLE");
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["edit", ""],
          "EDIT_ROLE"
        );
        next(responseObject);
        return;
      }
      let cAExist = await checkArrayExist(roles);
      if (!cAExist?.status) {
        throw new customErrorClass(
          cAExist.messageKey,
          "REP_STRING",
          ["Roles"],
          "roles"
        );
      }
      let CAOMKeys = await checkArrObjectMissingKeys(roles, ["id", "role"]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Roles", CAOMKeys?.missingKeys?.join(",")],
          "roles"
        );
      }
      let role_id_list = roles.map((obj: any) => obj.id);

      const rolesList = await Role.findAll({
        where: {
          id: {
            [Op.in]: role_id_list,
          },
        },
      });

      if (rolesList?.length === 0) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["Roles"],
          "roles"
        );
      }

      for (const role of rolesList) {
        let fIndex = getArrayOfObjectIndex(roles, role.id, "id");
        if (fIndex !== -1) {
          role.role = roles[fIndex].role;
          role.save();
        }
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
