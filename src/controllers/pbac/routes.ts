import { NextFunction, Request, Response } from "express";
import { HTTPMethod } from "http-method-enum";
import { iResponse } from "../../shared/interfaces/iResponse";
import { col, fn } from "sequelize";

const responseClass = require("@/shared/classes/responseClass");
const db = require("@/models");
const Routes = db.routes;

const login = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject: iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { limit, offset } = req.body;
      let routes = await Routes.findAll({
        limit,
        offset,
        attributes: {
          include: [[fn("COALESCE", col("handler"), ""), "handler"]],
          exclude: ["type"],
        },
      });
      const { count } = await Routes.findAndCountAll();
      responseObject.payload = {
        payload: routes,
        length: count
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
