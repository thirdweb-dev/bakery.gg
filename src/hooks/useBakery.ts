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

interface Contracts {
  token: string;
  bakery: string;
  bakers: string;
  upgrades: string;
  lands: string;
}

export const CONTRACT_ADDRESSES: Record<number, Contracts> = {
  [ChainId.Mumbai]: {
    bakery: "0xed3a439dF07bEb26E5A0de651b00A8bB47793dA2",
    bakers: "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
    upgrades: "0xA2E5C89a804b67c6694433e3aFf4f404e6C9443c",
    lands: "0xa44000cb4fAD817b92A781CDF6A1A2ceb57D945b",
    token: "0xeF960235b91E653327d82337e9329Ff7c85c917E",
  },
  [ChainId.Polygon]: {
    token: "",
    bakers: "",
    upgrades: "",
    lands: "",
    token: "",
  },
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

  const contract = useMemo(() => {
    if (!chainId) {
      return null;
    }
    if (!signer) {
      return null;
    }
    return Bakery__factory.connect(CONTRACT_ADDRESSES[chainId].bakery, signer);
  }, [chainId, signer]);

  useEffect(() => {
    async function update() {
      if (!contract || !chainId) {
        return;
      }

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
          (await contract?.spiceBoost(signerAddress)) ?? BigNumber.from(0);

        setCookiePerClick(
          BigNumber.from(spiceBoost).mul(rewardPerSpice).add(rewardPerSpice),
        );
      } else {
        setCookiePerClick(rewardPerSpice);
      }
      setCookiePerSecond(rewardPerSec);
    }
    update();
  }, [contract, signerAddress, chainId]);

  return {
    contract,
    cookiePerClick,
    cookiePerSecond,
    bakeStartBlock,
    bakeEndBlock,
    isBaking,
    maxNumberOfBlockReward,
  };
}
