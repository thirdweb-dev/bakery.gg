import { SUPPORTED_CHAIN_ID } from "./network";
import { AddressZero } from "@ethersproject/constants";
import { BigNumber } from "ethers";

export const networkKeys = {
  all: ["network"] as const,
  chain: (chainId?: SUPPORTED_CHAIN_ID) =>
    [...networkKeys.all, chainId] as const,
};

export const tokenKeys = {
  all: ["token"] as const,
  details: () => [...tokenKeys.all, "detail"] as const,
  detail: (address = AddressZero) => [...tokenKeys.details(), address] as const,
  balanceOf: (address = AddressZero, userAddress = AddressZero) =>
    [
      ...tokenKeys.detail(address),
      "balanceOf",
      { address: userAddress },
    ] as const,
};

export const bakeryKeys = {
  all: ["bakery"] as const,
  details: () => [...bakeryKeys.all, "detail"] as const,
  detail: (address = AddressZero) =>
    [...bakeryKeys.details(), address] as const,
  cookiePerSecond: (address = AddressZero, userAddress = AddressZero) =>
    [
      ...bakeryKeys.detail(address),
      "cookiePerSecond",
      { address: userAddress },
    ] as const,
  cookiePerClick: (address = AddressZero, userAddress = AddressZero) =>
    [
      ...bakeryKeys.detail(address),
      "cookiePerClick",
      { address: userAddress },
    ] as const,
  bakeStartBlock: (address = AddressZero, userAddress = AddressZero) =>
    [
      ...bakeryKeys.detail(address),
      "bakeStartBlock",
      { address: userAddress },
    ] as const,
};

export const dropKeys = {
  all: ["drop"] as const,
  lists: () => [...dropKeys.all, "list"] as const,
  list: (address = AddressZero) => [...dropKeys.lists(), address] as const,
  details: () => [...dropKeys.all, "detail"] as const,
  detail: (address = AddressZero) => [...dropKeys.details(), address] as const,
  canCreateBulk: (address = AddressZero) =>
    [...dropKeys.details(), address, "canCreateBulk"] as const,
  supply: (address = AddressZero) =>
    [...dropKeys.detail(address), "supply"] as const,
  activeClaimCondition: (address = AddressZero) =>
    [...dropKeys.detail(address), "activeClaimCondition"] as const,
  claimPhases: (address = AddressZero) =>
    [...dropKeys.detail(address), "claimPhases"] as const,
  balanceOf: (address = AddressZero, userAddress = AddressZero) =>
    [
      ...dropKeys.detail(address),
      "balanceOf",
      { address: userAddress },
    ] as const,
};

export const bakerMarketKeys = {
  all: ["baker-market"] as const,
  lists: () => [...bakerMarketKeys.all, "list"] as const,
  list: (address = AddressZero) =>
    [...bakerMarketKeys.lists(), address] as const,
  details: () => [...bakerMarketKeys.all, "detail"] as const,
  detail: (address = AddressZero) =>
    [...bakerMarketKeys.details(), address] as const,
};

export const editionDropKeys = {
  all: ["edition-drop"] as const,
  lists: () => [...editionDropKeys.all, "list"] as const,
  list: (address = AddressZero) =>
    [...editionDropKeys.lists(), address] as const,
  details: () => [...editionDropKeys.all, "detail"] as const,
  detail: (address = AddressZero) =>
    [...editionDropKeys.details(), address] as const,
  activeClaimCondition: (address = AddressZero, tokenId = "-1") =>
    [
      ...editionDropKeys.detail(address),
      "activeClaimCondition",
      { tokenId },
    ] as const,
  claimPhases: (address = AddressZero, tokenId = "-1") =>
    [...editionDropKeys.detail(address), "claimPhases", { tokenId }] as const,
  owned: (address = AddressZero, ownerAddress = AddressZero) =>
    [...editionDropKeys.detail(address), "owned", { ownerAddress }] as const,
  balanceOf: (
    address = AddressZero,
    userAddress = AddressZero,
    tokenId = "-1",
  ) =>
    [
      ...dropKeys.detail(address),
      "balanceOf",
      { address: userAddress, tokenId },
    ] as const,
};
