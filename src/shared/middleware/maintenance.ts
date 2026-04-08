import { NextFunction, Request, Response } from "express";
import config from "../../config/index";

const logger = require("@/shared/common/logger");
const { StatusCode } = require("status-code-enum");
const { prompts, promptArray } = config();
const { MAINTENANCE_MODE } = process.env;

const maintenance = async (req: Request, res: Response, next: NextFunction) => {
  const lang: any = promptArray.includes(req.headers["accept-language"]) ? req.headers["accept-language"] : "eu";
  try {
    if (req.path.endsWith("/health")) {
      return next();
    }
    if (MAINTENANCE_MODE === "YES") {
      return res.status(StatusCode?.ClientErrorConflict).json({ errors: { message:  prompts[lang]['SERVER_UNDER_MAINTENANCE'] }});
    } else {
      next();
    }
  } catch (error) {
    logger.error(`Maintenance ${error}`)
    res.status(StatusCode?.ServerErrorInternal ).json({ errors: { message: prompts[lang]["SERVER_SIDE_WRONG"] }});
  }
};

module.exports = maintenance;