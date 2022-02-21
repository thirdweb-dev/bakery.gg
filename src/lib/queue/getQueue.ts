import BeeQueue from "bee-queue";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

export default function getQueue(options: { isWorker: boolean }) {
  return new BeeQueue(`claims`, {
    redis: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
    isWorker: options.isWorker,
  });
}
