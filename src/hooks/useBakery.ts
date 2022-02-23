import { useSigner, useAddress } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Bakery__factory } from "../../types/ethers-contracts";
import { ChainId } from "../utils/network";
import { useWeb3 } from "./useWeb3";

const BLOCK_TIME_SECONDS: Record<number, number> = {
  [ChainId.Mumbai]: 2,
  [ChainId.Polygon]: 2,
};
const CONTRACT_ADDRESSES: Record<number, string> = {
  [ChainId.Mumbai]: "0xe9388ee324cc32648d5c481df15285f144126892",
};

export function useBakery() {
  const signer = useSigner();
  const signerAddress = useAddress();
  const { chainId } = useWeb3();
  const [cookiePerSecond, setCookiePerSecond] = useState(BigNumber.from(0));
  const [cookiePerClick, setCookiePerClick] = useState(BigNumber.from(0));
  const [bakeStartBlock, setBakeStartBlock] = useState(0);
  const [maxNumberOfBlockReward, setMaxNumberOfBlockReward] = useState(0);
  const [isBaking, setIsBaking] = useState(false);

  const contract = useMemo(() => {
    if (!chainId) {
      return null;
    }
    if (!signer) {
      return null;
    }
    return Bakery__factory.connect(CONTRACT_ADDRESSES[chainId], signer);
  }, [chainId, signer]);

  useEffect(() => {
    async function update() {
      if (!contract || !chainId) {
        return;
      }

      const rewardPerBlock =
        (await contract?.rewardPerBlock()) ?? BigNumber.from(0);

      setCookiePerSecond(rewardPerBlock.div(BLOCK_TIME_SECONDS[chainId]));

      const rewardPerSpice =
        (await contract?.rewardPerSpice()) ?? BigNumber.from(0);

      // eslint-disable-next-line
      const maxReward = await contract?.MAX_NUMBER_OF_BLOCK_FOR_REWARD();
      setMaxNumberOfBlockReward(maxReward?.toNumber() ?? 0);

      if (signerAddress) {
        const oven = await contract?.ovens(signerAddress);
        setIsBaking(oven?.startBlock.gt(0) ?? false);
        setBakeStartBlock(oven?.startBlock.toNumber() ?? 0);

        const spiceBoost =
          (await contract?.spiceBoost(signerAddress)) ?? BigNumber.from(0);
        setCookiePerClick(
          BigNumber.from(spiceBoost).mul(rewardPerSpice).add(rewardPerSpice),
        );
      } else {
        setCookiePerClick(rewardPerSpice);
      }
    }
    update();
  }, [contract, signerAddress, chainId]);

  const isExceedMaxBakeLimit = useMemo(() => {
    if (!signer || !maxNumberOfBlockReward || !bakeStartBlock) {
      return false;
    }
    const currentBlockNumber = 0; // await signer.provider?.getBlockNumber();
    if (!currentBlockNumber) {
      return false;
    }
    return currentBlockNumber - bakeStartBlock > maxNumberOfBlockReward;
  }, [signer, maxNumberOfBlockReward, bakeStartBlock]);

  return {
    contract,
    cookiePerClick,
    cookiePerSecond,
    bakeStartBlock,
    isBaking,
    isExceedMaxBakeLimit,
  };
}
