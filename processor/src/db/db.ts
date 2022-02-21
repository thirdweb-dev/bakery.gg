import Redis from "ioredis";
import { Status } from "../interfaces";

export class Database extends Redis {
  constructor(
    options: {
      redisHost: string;
      redisPort: number;
    } = {
      redisHost: "localhost",
      redisPort: 6379,
    },
  ) {
    super(options.redisPort, options.redisHost);
  }

  /**
   * Generates a random challenge for the wallet and stores
   * it in redis.
   *
   * @param address
   * @returns The newly generated challenge string
   */
  public async generateClaimChallenge(address: string): Promise<string> {
    const nonce = Math.random().toString(36).substring(2, 15);
    const challenge = `I am proving my ownership of wallet ${address}.\n\nnonce=${nonce}`;
    await this.set(`challenge:${address.toLowerCase()}`, challenge);
    return challenge;
  }

  /**
   * Returns the challenge for a given wallet.
   *
   * @param address - The address to lookup the challenge for
   * @returns The challenge string
   */
  public async getClaimChallenge(address: string): Promise<string | undefined> {
    const result = await this.get(`challenge:${address.toLowerCase()}`);
    if (result === null) {
      return undefined;
    }
    return result;
  }

  public async getJobStatus(address: string): Promise<Status | undefined> {
    const result = await this.get(`job:${address.toLowerCase()}`);
    if (result === null) {
      return undefined;
    }
    return JSON.parse(result) as Status;
  }

  public async updateJobStatus(address: string, status: Status): Promise<void> {
    await this.set(`job:${address.toLowerCase()}`, JSON.stringify(status));
  }

  public async setRewards(rewards: { tokenId: string; supply: string }[]) {
    await this.set(`reward:tokens`, JSON.stringify(rewards));
  }

  public async getRewards(): Promise<{ tokenId: string; supply: string }[]> {
    const result = await this.get(`reward:tokens`);
    if (result === null) {
      return [];
    }
    return JSON.parse(result) as { tokenId: string; supply: string }[];
  }
}
