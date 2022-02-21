import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import defaultDb from "../../db";
import { Status } from "../../interfaces";
import getQueue from "../../lib/queue/getQueue";

const queue = getQueue({ isWorker: false });

export default async function Endpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = JSON.parse(req.body);

  const { address, sig } = body;
  const existingChallenge = await defaultDb.getClaimChallenge(address);

  if (existingChallenge === undefined) {
    return res
      .status(404)
      .send("This address does not have an active challenge");
  }

  const reversedAddress = ethers.utils.verifyMessage(existingChallenge, sig);
  if (reversedAddress.toLowerCase() !== address.toLowerCase()) {
    return res.status(400).send("Invalid signature");
  }

  const jobStatus = await defaultDb.getJobStatus(address);

  const didSucceed = async (hash?: string) => {
    if (hash === undefined) {
      return false;
    }

    const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const receipt = await provider.getTransactionReceipt(hash);
    return receipt?.status === 1;
  };

  if (
    (jobStatus?.state === "SUCCESS" && (await didSucceed(jobStatus?.txHash))) ||
    jobStatus?.state === "PROCESSING"
  ) {
    return res.status(200).json(jobStatus);
  }

  const job = await queue
    .createJob<{ address: string }>({ address: address.toLowerCase() })
    .timeout(1000 * 60 * 5)
    .retries(3)
    .save();

  const status = {
    state: "PROCESSING",
    jobId: job.id,
  } as Status;
  await defaultDb.updateJobStatus(address, status);

  return res.status(200).json(status);
}
