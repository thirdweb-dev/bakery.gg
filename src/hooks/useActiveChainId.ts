import {
  getChainIdFromNetwork,
  getNetworkFromChainId,
  SupportedNetwork,
  SUPPORTED_CHAIN_ID,
} from "../utils/network";
import { useSingleQueryParam } from "./useQueryParam";

export function useActiveChainId(): SUPPORTED_CHAIN_ID | undefined {
  const networkFromUrl = useSingleQueryParam<SupportedNetwork>("network");
  return getChainIdFromNetwork(networkFromUrl);
}

export function useActiveNetwork(): SupportedNetwork | undefined {
  const activeChainId = useActiveChainId();
  return activeChainId && getNetworkFromChainId(activeChainId);
}
