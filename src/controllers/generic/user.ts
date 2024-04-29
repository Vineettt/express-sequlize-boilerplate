import { NextFunction, Request, Response } from "express";
import { iResponse } from "../../shared/interfaces/iResponse";

const { HTTPMethod } = require("http-method-enum");
const responseClass = require("@/shared/classes/responseClass");
const generateRandomString = require("@/shared/common/generate-random-string");
const sendMail = require("@/shared/email/send-email");
const db = require("../../models");
const User = db.users;

const user = async (req: Request, res: Response, next: NextFunction) => {
  let responseObject:iResponse = new responseClass();
  try {
    responseObject.resType = "TRY_BLOCK";
    responseObject.type = "JSON";
    if (req.method === HTTPMethod.POST) {
      const { email, password, first_name, last_name, role } = req.body;
      const user = {
        email,
        password,
        first_name,
        last_name,
        role_id: role,
      };
      const response = await User.create(user);
      let activationToken = await generateRandomString(64, true, true);
      await User.updateRow(
        { token: activationToken },
        { where: { id: response.id } }
      );
      responseObject.messageKey = "SUCCESSFULLY_REGISTERED";
      next(responseObject);
    }
  } catch (error) {
    responseObject.resType = "CATCH_BLOCK";
    responseObject.type = "JSON";
    responseObject.payload = error;
    next(responseObject);
  }
};

module.exports = user;