import { BundleMetadata, ThirdwebSDK } from "@3rdweb/sdk";
import { BigNumber, ethers } from "ethers";
import { NextApiResponse, NextApiRequest } from "next";
import defaultDb from "../../db";
import { Status } from "../../interfaces";

function getRpcUrl() {
  const isTestnet = process.env.IS_TESTNET === "true" || false;
  if (isTestnet) {
    return `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;
  } else {
    return `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;
  }
}

export default async function StatusEndpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const address = body.address;

  const sdk = new ThirdwebSDK(ethers.getDefaultProvider(getRpcUrl()));

  const module = sdk.getBundleModule(
    process.env.NEXT_PUBLIC_BUNDLE_COLLECTION_ADDRESS as string,
  );

  const tokens = (
    await module.getAll(process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS)
  ).map((nft: BundleMetadata) => ({
    tokenId: nft.metadata.id.toString(),
    totalMinted: nft.supply.sub(nft.ownedByAddress).toString(),
    totalAvailable: nft.supply.toString(),
  }));

  const totalMinted = tokens.reduce(
    (acc, cur) => acc.add(cur.totalMinted),
    BigNumber.from(0),
  );

  const totalAvailable = tokens.reduce(
    (acc, cur) => acc.add(cur.totalAvailable),
    BigNumber.from(0),
  );

  // if there is no address return the default status with numbers
  if (!address || address === null) {
    return res.status(200).json({
      state: "NEW",
      totalMinted: totalMinted.toString(),
      totalAvailable: totalAvailable.toString(),
    } as Status);
  }

  // if there is an address try to get the status
  const status = await defaultDb.getJobStatus(address);
  // if the status is `undefined` return the default status with numbers
  if (status === undefined) {
    return res.status(200).json({
      state: "NEW",
      totalMinted: totalMinted.toString(),
      totalAvailable: totalAvailable.toString(),
    } as Status);
  }

  // otherwise return the status
  return res.status(200).json({
    ...status,
    totalMinted: totalMinted.toString(),
    totalAvailable: totalAvailable.toString(),
  } as Status);
}
