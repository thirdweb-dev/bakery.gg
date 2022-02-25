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
    bakers: "",
    upgrades: "",
    lands: "",
    cookies: "",
    bakery: "",
    markets: "",
  },
};
