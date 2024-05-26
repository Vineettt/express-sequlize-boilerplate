import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { iQueryParams } from "../../shared/interfaces/iQueryParams";
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
const executeQuery = require("@/shared/common/execute-query");
const queryParams = require("@/shared/classes/queryParams");
const db = require("@/models");
const User = db["users"];
const Role = db["roles"];
const URMapping = db["user_role_mappings"];


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

      responseObject.messageKey = "SUCCESSFULLY_FETCHED";
      next(responseObject);
    }
    if (req.method === HTTPMethod.PUT) {
      let { mapping, IGNORE_KEY } = req.body;
      let iKExist = await stringUndefined(IGNORE_KEY, "EDIT_USER_ROLEE_MAPPING");
      if (!iKExist?.status) {
        responseObject.resType = "WARNING_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = new customErrorClass(
          iKExist.messageKey,
          "REP_STRING",
          ["edit", ""],
          "EDIT_USER_ROLEE_MAPPING"
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
      let CAOMKeys = await checkArrObjectMissingKeys(mapping, [
        "role_fk_id",
        "user_fk_id",
      ]);
      if (!CAOMKeys?.status) {
        throw new customErrorClass(
          CAOMKeys.messageKey,
          "REP_STRING",
          ["Routes", CAOMKeys?.missingKeys?.join(",")],
          "mapping"
        );
      }
      
      const uniqueArrayUser = getUniqueArrayObjectKey(mapping, ["user_fk_id"]);
      const uniqueArrayRole = getUniqueArrayObjectKey(mapping, ["role_fk_id"]);

      const countUser = await User.count({
        where: {
          id: {
            [Op.in]: uniqueArrayUser,
          },
        },
      });

      if (uniqueArrayUser.length !== countUser) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["Users"],
          "mapping"
        );
      }

      const countRole = await Role.count({
        where: {
          id: {
            [Op.in]: uniqueArrayRole,
          },
        },
      });

      if (uniqueArrayRole.length !== countRole) {
        throw new customErrorClass(
          "REP_DOES_NOT_EXIST",
          "REP_STRING",
          ["Roles"],
          "mapping"
        );
      }

      const uRMList = await URMapping.findAll({
        where: {
          user_fk_id: {
            [Op.in]: uniqueArrayUser,
          },
        },
      });

      const insertAO = await onlyInLeft(mapping, uRMList, isMapping);
      const deleteAO = await onlyInLeft(uRMList, mapping, isMapping);

      if(insertAO.length > 0){
        await URMapping.bulkCreate(insertAO);
      }

      if(deleteAO.length > 0){
        const uniqueArrayDeleteList = await getUniqueArrayObjectKey(deleteAO, ["id"]);
        await URMapping.destroy({
          where: {
            id: {
              [Op.in]: uniqueArrayDeleteList,
            },
          },
        });
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

const isMapping = (
  a: {
    user_fk_id: any;
    role_fk_id: any;
  },
  b: {
    user_fk_id: any;
    role_fk_id: any;
  }
) => a.user_fk_id === b.user_fk_id && a.role_fk_id === b.role_fk_id;

module.exports = roleRouteMapping;
