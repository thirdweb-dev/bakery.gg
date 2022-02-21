export interface Status {
  state: "NEW" | "PROCESSING" | "SUCCESS" | "FAILURE";
  txHash?: string;
  jobId?: string;
  totalMinted?: string;
  totalAvailable?: string;
}
