import { SUPPORTED_CHAIN_ID } from "./network";
import { AddressZero } from "@ethersproject/constants";

export const networkKeys = {
  all: ["network"] as const,
  chain: (chainId?: SUPPORTED_CHAIN_ID) =>
    [...networkKeys.all, chainId] as const,
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
