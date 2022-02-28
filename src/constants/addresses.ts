import { ChainId } from "@thirdweb-dev/sdk";

export interface Contracts {
  cookies: string;
  bakery: string;
  bakers: string;
  upgrades: string;
  lands: string;
  markets: string;
}

export const CONTRACT_ADDRESSES: Record<number, Contracts> = {
  [ChainId.Mumbai]: {
    bakers: "0xF4A6BAda61996fEFDCf7a8027fdEA54B5086517e",
    upgrades: "0x02B5904Eb879A6912B0b28e128f1328AA32b7823",
    lands: "0xa44000cb4fAD817b92A781CDF6A1A2ceb57D945b",
    cookies: "0xeF960235b91E653327d82337e9329Ff7c85c917E",
    bakery: "0x9fbdc762f631a03b25752719c713578609a9cef5",
    markets: "0x5e23f6e759d10170e0b13cf9193a818a8130abf9",
  },
  [ChainId.Polygon]: {
    bakers: "0xDEc98C282c50b95cB2525A56874BBf37055F5F92",
    upgrades: "0xC83db1E97CE57713802A5f430f23CeE17Fd3C829",
    lands: "0x2e82e6CfB09303265b7aEfd0311E1742D70B6B1a",
    cookies: "0xeF960235b91E653327d82337e9329Ff7c85c917E",
    bakery: "",
    markets: "",
  },
};
