import { NextApiResponse, NextApiRequest } from "next";
import defaultDb from "../../../db";

export default async function StatusEndpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = JSON.parse(req.body);

  console.log(body);

  const address = (body.address as string).toLowerCase();

  const existingChallenge = await defaultDb.getClaimChallenge(address);
  if (existingChallenge) {
    return res.status(200).send(existingChallenge);
  }

  const challenge = await defaultDb.generateClaimChallenge(address);
  return res.status(200).send(challenge);
}
