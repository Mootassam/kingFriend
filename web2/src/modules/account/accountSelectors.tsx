import assetsSelectors from "src/modules/assets/assetsSelectors";
import authSelectors from "src/modules/auth/authSelectors";
import demoSelectors from "src/modules/demo/demoSelectors";
import type { RootState } from "src/modules/store";

// The workspace shows one balance: a demo account spends its virtual funds, a real account
// spends the wallets the server holds for it. The value always comes from the account it
// belongs to — never from a made-up number.

const selectIsDemo = (state: RootState) => authSelectors.selectIsDemo(state);

// The balance available to spend.
const selectBalance = (state: RootState) =>
  selectIsDemo(state) ? demoSelectors.selectBalance(state) : assetsSelectors.selectTotalUsd(state);

// False while the real balance is still on its way from the server.
const selectBalanceLoaded = (state: RootState) =>
  selectIsDemo(state) || assetsSelectors.selectLoaded(state);

const accountSelectors = {
  selectIsDemo,
  selectBalance,
  selectBalanceLoaded,
};

export default accountSelectors;
