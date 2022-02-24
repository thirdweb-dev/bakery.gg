import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { CONTRACT_ADDRESSES } from "../../constants/addresses";
import { alchemyUrlMap } from "../_app";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId = 80001, to, amount, startBlock } = req.body;
  if (!to || !amount || !startBlock) {
    res.status(400).json({
      error: "to and amount are required",
    });
    return;
  }

  const wallet = new ethers.Wallet(
    process.env.SIGNER_PRIVATE_KEY as string,
  ).connect(ethers.getDefaultProvider(alchemyUrlMap[chainId]));

  const payload = {
    to,
    amount,
    startBlock,
  };

  const signature = await wallet._signTypedData(
    {
      name: "Bakery",
      version: "1",
      chainId,
      verifyingContract: CONTRACT_ADDRESSES[chainId].bakery,
    },
    {
      Spice: [
        {
          name: "to",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
        {
          name: "startBlock",
          type: "uint256",
        },
      ],
    },
    payload,
  );

  return res.status(200).json({
    payload,
    signature,
  });
};
