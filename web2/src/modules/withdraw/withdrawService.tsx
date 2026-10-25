import AuthCurrentTenant from "src/modules/auth/authCurrentTenant";
import authAxios from "src/modules/shared/axios/authAxios";

export const WITHDRAW_CURRENCY = "USDT";
export const MIN_WITHDRAW = 50;

// Same order number format as PC: RE + yyyymmdd + 7 random digits.
const orderNumber = () => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `RE${date}${Math.floor(Math.random() * 1e7).toString().padStart(7, "0")}`;
};

export default class WithdrawService {
  // Same request body as PC. The server holds the amount from the USDT exchange wallet
  // straight away and support approves or cancels the request.
  static async create({ amount, withdrawPassword }: { amount: number; withdrawPassword: string }) {
    const tenantId = AuthCurrentTenant.get();
    const response = await authAxios.post(`/tenant/${tenantId}/withdraw`, {
      data: {
        currency: WITHDRAW_CURRENCY,
        date: new Date(),
        totalAmount: amount,
        withdrawAmount: amount,
        orderNo: orderNumber(),
        status: "pending",
        withdrawPassword,
        withdrawType: "bank",
      },
    });
    return response.data;
  }
}
