import AuthCurrentTenant from "src/modules/auth/authCurrentTenant";
import authAxios from "src/modules/shared/axios/authAxios";

export interface Wallet {
  _id: string;
  symbol: string;
  coinName: string;
  accountType: "exchange" | "trade" | "perpetual";
  amount: number;
  amountFreezed: number;
  status: "active" | "freezed";
  balanceFiat: number;
  fiat: string;
}

// Coins pegged to the dollar count at face value, as on PC: the server prices them at the
// market rate (20,000 USDT would show as $19,979.68), and that rate is empty for about a
// minute after a server restart.
const STABLECOINS = ["USDT", "USDC"];

export default class AssetsService {
  // The signed-in user's wallets, each with its value in the chosen fiat currency.
  static async list(fiat = "USD"): Promise<Wallet[]> {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.get(`/tenant/${tenantId}/assetsmobile`, { params: { fiat } });
    return response.data.rows || [];
  }

  // The server's own `totalFiat` adds up raw coin amounts (1 BTC counts as 1), so the total
  // is summed here from each wallet's converted value instead.
  static total(wallets: Wallet[]): number {
    const sum = wallets.reduce((acc, wallet) => acc + this.value(wallet), 0);
    return Math.round(sum * 100) / 100;
  }

  // A wallet's value in USD.
  static value(wallet: Wallet): number {
    if (STABLECOINS.includes(wallet.symbol)) {
      return Number(wallet.amount) || 0;
    }
    return Number(wallet.balanceFiat) || 0;
  }
}
