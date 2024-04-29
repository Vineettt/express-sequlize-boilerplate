const DBs = require("@/shared/constants/dbs-list")

export const fetchAllDbConfig = () => {
  const dbVariables: any = {};
  for (let [key, value] of Object.entries(DBs)) {
    dbVariables[`db${value}Name`] = process.env[`DB_${key}_NAME`] || "";
    dbVariables[`db${value}Host`] = process.env[`DB_${key}_HOST`] || "";
    dbVariables[`db${value}Password`] = process.env[`DB_${key}_PASSWORD`] || "";
    dbVariables[`db${value}Username`] = process.env[`DB_${key}_USERNAME`] || "";
    dbVariables[`db${value}Dialect`] = process.env[`DB_${key}_DIALECT`] || "";
    dbVariables[`db${value}Port`] = process.env[`DB_${key}_PORT`] || "";
  }
  return dbVariables;
};
