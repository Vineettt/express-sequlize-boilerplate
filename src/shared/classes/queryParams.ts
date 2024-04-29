import { iQueryParams } from "../interfaces/iQueryParams";

class queryParams implements iQueryParams {
  dbName: string;
  qyKey: string;
  replacements: any;
  options_type: string;
  constructor(
    dbName: string,
    qyKey: string,
    replacements: any,
    options_type: string
  ) {
    this.dbName = dbName;
    this.qyKey = qyKey;
    this.replacements = replacements;
    this.options_type = options_type;
  }
}

module.exports = queryParams;
