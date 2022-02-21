import { config } from "dotenv";
import { ThirdwebSDK } from "@3rdweb/sdk";
import BeeQueue from "bee-queue";
import { Logger } from "tslog";
import defaultDb from "./db";
import getQueue from "./lib/queue/getQueue";
import { ethers } from "ethers";
import claimTo from "./lib/claim";

config();

function getRpcUrl() {
  const isTestnet = process.env.IS_TESTNET === "true" || false;
  if (isTestnet) {
    return `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;
  } else {
    return `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;
  }
}

const run = async () => {
  const logger = new Logger({
    name: "queue-processor",
  });
  logger.info("Starting up the queue processor");

  const queue = getQueue({ isWorker: true });

  queue.on("job retrying", (job, err) => {
    logger.error(`Job ${job} retrying with error - ${err.message}`);
  });

  queue.on("job failed", async (job, err) => {
    logger.error(`Job ${job} failed ${err.message}`);

    const jobData: BeeQueue.Job<{ address: string }> = await queue.getJob(job);

    await defaultDb.updateJobStatus(jobData.data.address, {
      state: "FAILURE",
      jobId: job,
    });
    logger.info(`Set job ${job} to FAILURE`);
  });

  queue.process(1, async (job: BeeQueue.Job<{ address: string }>) => {
    const sdk = new ThirdwebSDK(
      new ethers.Wallet(
        process.env.PKEY as string,
        ethers.getDefaultProvider(getRpcUrl()),
      ),
    );

    const module = sdk.getBundleModule(
      process.env.NEXT_PUBLIC_BUNDLE_COLLECTION_ADDRESS as string,
    );

    logger.info("Trying to process job", job.id);

    const currentStatus = await defaultDb.getJobStatus(job.data.address);
    if (currentStatus?.state === "SUCCESS") {
      logger.warn(`Job ${job.id} already succeeded, skipping`);
      return;
    }

    return new Promise<void>((resolve, reject) => {
      sdk.event.once("transaction", (event: any) => {
        try {
          console.log("submitted transaction with event", event);

          // TODO
          defaultDb.updateJobStatus(job.data.address, {
            state: "SUCCESS",
            jobId: job.id,
            txHash: event.transactionHash, // TODO get from event
          });

          resolve();
        } catch (err) {
          reject(err);
        } finally {
        }
      });

      claimTo(module, job.data.address).catch((err) => {
        reject(err);
      });
    });
  });

  logger.info("Queue processor ended");

  return new Promise<void>(() => {});
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);

    console.log("WOAH");
    process.exit(1);
  });
