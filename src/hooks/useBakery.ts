import { useSigner, useAddress } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bakery__factory } from "../../types/ethers-contracts";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
import { ChainId } from "../utils/network";
import { useWeb3 } from "./useWeb3";

const BLOCK_TIME_SECONDS: Record<number, number> = {
  [ChainId.Mumbai]: 2,
  [ChainId.Polygon]: 2,
};

export function useBakery() {
  const signer = useSigner();
  const signerAddress = useAddress();
  const { chainId } = useWeb3();
  const [cookiePerSecond, setCookiePerSecond] = useState(BigNumber.from(0));
  const [cookiePerClick, setCookiePerClick] = useState(BigNumber.from(0));
  const [bakeStartBlock, setBakeStartBlock] = useState(0);
  const [bakeEndBlock, setBakeEndBlock] = useState(0);
  const [maxNumberOfBlockReward, setMaxNumberOfBlockReward] = useState(0);
  const [isBaking, setIsBaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const contract = useMemo(() => {
    if (chainId !== ChainId.Mumbai && chainId !== ChainId.Polygon) {
      return null;
    }
    if (!signer) {
      return null;
    }
    return Bakery__factory.connect(CONTRACT_ADDRESSES[chainId].bakery, signer);
  }, [chainId, signer]);

  const refresh = useCallback(async () => {
    if (!contract || !chainId || loading) {
      return;
    }
    setLoading(true);

    const rewardPerSec = (
      (await contract?.totalReward(
        signerAddress || ethers.constants.AddressZero,
        1,
      )) ?? BigNumber.from(0)
    ).div(BLOCK_TIME_SECONDS[chainId]);

    const rewardPerSpice =
      (await contract?.rewardPerSpice(
        signerAddress || ethers.constants.AddressZero,
      )) ?? BigNumber.from(0);

    // eslint-disable-next-line
    const maxReward = await contract?.MAX_NUMBER_OF_BLOCK_FOR_REWARD();
    setMaxNumberOfBlockReward(maxReward?.toNumber() ?? 0);

    if (signerAddress) {
      const oven = await contract?.ovens(signerAddress);
      setIsBaking(oven?.startBlock.gt(0) ?? false);
      setBakeStartBlock(oven?.startBlock.toNumber() ?? 0);
      setBakeEndBlock(oven?.startBlock.add(maxReward).toNumber() ?? 0);

      const spiceBoost =
        (await contract?.spiceBoost(signerAddress)) ?? BigNumber.from(1);

      setCookiePerClick(BigNumber.from(spiceBoost).mul(rewardPerSpice));
    } else {
      setCookiePerClick(rewardPerSpice);
    }
    setCookiePerSecond(rewardPerSec);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, signerAddress, chainId]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, signerAddress, chainId]);

  return {
    contract,
    cookiePerClick,
    cookiePerSecond,
    bakeStartBlock,
    bakeEndBlock,
    isBaking,
    maxNumberOfBlockReward,
    loading,
    refresh,
  };
}
