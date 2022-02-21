import { Database } from "./db";

export * from "./db";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

const defaultDb = new Database({
  redisHost: REDIS_HOST,
  redisPort: REDIS_PORT,
});
export default defaultDb;
