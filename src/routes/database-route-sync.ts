import { Op } from "sequelize";

const fs = require("fs");
const path = require("path");
const logger = require("@/shared/common/logger");
const {
  removeExtension,
  lastElement,
} = require("@/shared/common/string-functions");
const { onlyInLeft,uniqueArrayOfObject } = require("@/shared/common/array-functions");

const db = require("@/models");
const RRMapping = db.role_route_mappings;
const Routes = db.routes;

const regex = /(?<!\w)req\.method\s*===*\s*([^\s,]+)/g;
let match;

const initRouteListAndSync = async (dirPath: string) => {
  try {
    let rList: any = await iterateFiles(dirPath, "", []);

    rList = await uniqueArrayOfObject(rList,['method', 'endpoint', 'type'])

    const routes = await Routes.findAll();

    const insertAO = await onlyInLeft(rList, routes, isSameUser);
    const deleteAO = await onlyInLeft(routes, rList, isSameUser);

    let insertDataCO: any[] = [];
    for (const itr of insertAO) {
      let tObj: any = {};
      tObj.method = itr.method;
      tObj.endpoint = itr.endpoint;
      tObj.type = itr.type;
      insertDataCO.push(tObj);
    }

    await Routes.bulkCreate(insertDataCO, { validate: true });

    let deleteArrayCO: any[] = [];
    for (const itr of deleteAO) {
      deleteArrayCO.push(itr.id);
    }

    await Routes.destroy({
      where: {
        id: {
          [Op.in]: deleteArrayCO,
        },
      },
    });

    await RRMapping.destroy({
      where: {
        route_fk_id: {
          [Op.in]: deleteArrayCO,
        },
      },
    });

    return rList;
  } catch (error) {
    logger.error(`Init RouteSync ${error}`);
  }
};

const iterateFiles = (dirPath: string, sub_path: string, routeList: any[]) => {
  try {
    return new Promise(async (resolve, reject) => {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          let temp_sub_path = `${sub_path}\\${file.name}`;
          let tempArray = await iterateFiles(
            filePath,
            temp_sub_path,
            routeList
          );
          routeList = routeList.concat(tempArray);
        } else {
          try {
            const content = await fs.readFileSync(filePath, "utf-8");
            let tempArray = await getMethods(
              content,
              removeExtension(file.name),
              sub_path
            );

            routeList = routeList.concat(tempArray);
          } catch (error) {
            logger.error(`Error reading file: ${filePath}`, error);
          }
        }
      }
      return resolve(routeList);
    });
  } catch (error) {
    logger.error(`Iterate ${error}`);
  }
};

const getMethods = (content: any, endpoint: string, sub_path: string) => {
  try {
    return new Promise(async (resolve, reject) => {
      let tempEPASP = await generateSubPathAndEndpoint(endpoint, sub_path);

      let tempArray: any[] = [];
      while ((match = regex.exec(content)) !== null) {
        let tempObj: any = {};
        tempObj.method = lastElement(match[1], ".")
          .replace(")", "")
          .toLowerCase();
        tempObj.endpoint = tempEPASP.endpoint;
        tempObj.type = tempEPASP.sub_path;
        tempArray.push(tempObj);
      }
      return resolve(tempArray);
    });
  } catch (error) {
    logger.error(`Get Method ${error}`);
  }
};

const generateSubPathAndEndpoint = (endpoint: string, sub_path: string) => {
  let subPathArray = sub_path.split("\\");
  let tempEPASB: any = {};
  if (subPathArray.length === 1) {
    tempEPASB.sub_path = "";
  } else if (subPathArray.length >= 2) {
    tempEPASB.sub_path = subPathArray[1];
    subPathArray.splice(1, 1);
  }
  subPathArray.push(endpoint);
  tempEPASB.endpoint = subPathArray.join("/");
  return tempEPASB;
};

const isSameUser = (
  a: {
    type: any;
    method: any;
    endpoint: any;
  },
  b: {
    type: any;
    method: any;
    endpoint: any;
  }
) => a.method === b.method && a.endpoint === b.endpoint && a.type === b.type;

module.exports = { iterateFiles, getMethods, initRouteListAndSync };
