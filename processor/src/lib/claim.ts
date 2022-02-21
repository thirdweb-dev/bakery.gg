import { BundleModule } from "@3rdweb/sdk";
import defaultDb from "../db";
import crypto from "crypto";
import {BigNumber} from "ethers";

async function seedRewardTokens(module: BundleModule) {
  const getOwned = await module.getAll(
    await module.contract.signer.getAddress()
  );

  return getOwned.map((nft) => ({
    tokenId: nft.metadata.id.toString(),
    supply: nft.ownedByAddress.toString(),
  }));
}

async function getTokenId(module: BundleModule) {

  // redis store the rewards as "<tokenId>:<supply>,..."
  // key: rewards, "0:500,1:500"
  let rewards = await defaultDb.getRewards();

  // TODO check block number?
  if (rewards.length === 0) {
    rewards = await seedRewardTokens(module);
  }

  // fill the array with possible token ids.
  // ex: [0, 0, 1, 1, 1, 2, ...]
  const rewardTokenIds = [];
  for (const reward of rewards) {
    const tokenId = reward.tokenId;
    const supply = reward.supply;
    if (BigNumber.from(supply).gt(0)) {
      rewardTokenIds.push(...new Array(supply).fill(tokenId));
    }
  }

  if (rewardTokenIds.length === 0) {
    throw new Error("Ran out of reward tokens");
  }

  const rewardIndex = crypto.randomInt(0, rewardTokenIds.length);
  const rewardTokenId = rewardTokenIds.splice(rewardIndex, 1)[0];

  for (const reward of rewards) {
    if (BigNumber.from(reward.tokenId).eq(rewardTokenId)) {
      const supply = BigNumber.from(reward.supply);
      if (supply.eq(0)) {
        throw new Error("Trying to distribute tokens without supply");
      }
      reward.supply = supply.sub(1).toString();
      break;
    }
  }

  await defaultDb.setRewards(rewards);
  return rewardTokenId;
}

export default async function claimTo(module: BundleModule, address: string) {
  return await module.transfer(address, await getTokenId(module), 1);
}
