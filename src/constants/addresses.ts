import { ChainId } from "@thirdweb-dev/sdk";

export interface Contracts {
  token: string;
  bakery: string;
  bakers: string;
  upgrades: string;
  lands: string;
}

export const CONTRACT_ADDRESSES: Record<number, Contracts> = {
  [ChainId.Mumbai]: {
    bakery: "0xe207e2c694453e6ca9031b6f4164226bcfc6bef2",
    bakers: "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
    upgrades: "0x02B5904Eb879A6912B0b28e128f1328AA32b7823",
    lands: "0xa44000cb4fAD817b92A781CDF6A1A2ceb57D945b",
    token: "0xeF960235b91E653327d82337e9329Ff7c85c917E",
  },
  [ChainId.Polygon]: {
    bakery: "",
    bakers: "",
    upgrades: "",
    lands: "",
    token: "",
  },
};
