import { fetchAllDbConfig } from "./dbConfig";
import { prompts } from "./langLoader";

let cache: any;
export default function config() {
  if (!cache) {
    cache = Object.freeze({
      dbVariables: fetchAllDbConfig(),
      prompts: prompts()
    });
  }
  return cache;
}
