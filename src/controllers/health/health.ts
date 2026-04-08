import { NextFunction, Request, Response } from "express";
import { iResponse } from "../../shared/interfaces/iResponse";
import HTTPMethod from "http-method-enum";

const responseClass = require("@/shared/classes/responseClass");
const { MAINTENANCE_MODE } = process.env;

const health = async (req: Request, res: Response, next: NextFunction) => {
    let responseObject: iResponse = new responseClass();
    try {
        responseObject.resType = "TRY_BLOCK";
        responseObject.type = "JSON";
        if (req.method === HTTPMethod.GET) {
            responseObject.payload = {message: "Server is running", maintenance: MAINTENANCE_MODE === "YES"};
        }
        next(responseObject);
    } catch (error) {
        responseObject.resType = "CATCH_BLOCK";
        responseObject.type = "JSON";
        responseObject.payload = error;
        next(responseObject);
    }

}

module.exports = health;

