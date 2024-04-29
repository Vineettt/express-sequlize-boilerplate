import express, { Express, Request, Response } from "express";

const app: Express = express();
const maintenance = require("@/shared/middleware/maintenance");
const handlerChecker = require("@/shared/middleware/handler-checker")
const responseHandler = require("@/shared/middleware/response-handler");
const port = process.env.PORT || 3000;
const db = require("@/models/index");
const logger = require("@/shared/common/logger");
const syncTemplatesFolder = require("@/shared/email/sync-templates-folder");
const loadRouter = require("./routes/index.route");

for (const key in db) {
  db[key]
    .sync({ async: true })
    .then(() => {
      logger.info("Connection established successfully.");
    })
    .catch((error: any) => {
      logger.error(`Connection error: ${error}`);
    });
}

syncTemplatesFolder();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

async function loadRoutes() {
  app.use(maintenance);
  app.use(handlerChecker);
  await loadRouter(app);
  app.use(responseHandler);
}

loadRoutes().then(() => {
  app.listen(port, () => {
    logger.info(`[server]: Server is running at http://localhost:${port}`);
  });
});
