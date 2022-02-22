import { useNetwork, useSigner, useAddress } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Bakery__factory } from "../../types/ethers-contracts";
import { ChainId } from "../utils/network";

const CONTRACT_ADDRESSES: Record<number, string> = {
  [ChainId.Mumbai]: "",
};

export function useBakery() {
  const signer = useSigner();
  const signerAddress = useAddress();
  const [network] = useNetwork();
  const [cookiePerSecond, setCookiePerSecond] = useState(0);
  const [cookiePerClick, setCookiePerClick] = useState(0);
  const [bakeStartBlock, setBakeStartBlock] = useState(0);
  const [maxNumberOfBlockReward, setMaxNumberOfBlockReward] = useState(0);
  const [isBaking, setIsBaking] = useState(false);

  const contract = useMemo(() => {
    if (!network.data) {
      return null;
    }
    if (!signer.data) {
      return null;
    }
    const chainId = network.data.chain?.id || ChainId.Mumbai;
    return Bakery__factory.connect(CONTRACT_ADDRESSES[chainId], signer.data);
  }, [network.data, signer.data]);

  useEffect(() => {
    async function update() {
      const rewardPerBlock =
        (await contract?.rewardPerBlock()) ?? BigNumber.from(0);

      // TODO convert perBlock to perSecond
      setCookiePerSecond(rewardPerBlock.toNumber());
      // TODO get cookie per click
      setCookiePerClick(1.0);

      // eslint-disable-next-line
      const maxReward = await contract?.MAX_NUMBER_OF_BLOCK_FOR_REWARD();
      setMaxNumberOfBlockReward(maxReward?.toNumber() ?? 0);

      if (signerAddress) {
        const oven = await contract?.ovens(signerAddress);
        setIsBaking(oven?.startBlock.gt(0) ?? false);
        setBakeStartBlock(oven?.startBlock.toNumber() ?? 0);
      }
    }
    if (contract) {
      update();
    }
  }, [contract, signerAddress]);

  const isExceedMaxBakeLimit = useMemo(async () => {
    if (!signer?.data || !maxNumberOfBlockReward || !bakeStartBlock) {
      return false;
    }
    const currentBlockNumber = await signer.data?.provider?.getBlockNumber();
    if (!currentBlockNumber) {
      return false;
    }
    return currentBlockNumber - bakeStartBlock > maxNumberOfBlockReward;
  }, [signer.data, maxNumberOfBlockReward, bakeStartBlock]);

  return {
    contract,
    cookiePerClick,
    cookiePerSecond,
    bakeStartBlock,
    isBaking,
    isExceedMaxBakeLimit,
  };
}
