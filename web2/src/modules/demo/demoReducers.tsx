import { AnyAction } from "redux";
import authActions from "src/modules/auth/authActions";
import actions from "src/modules/demo/demoActions";
import { DemoState, quotes } from "src/modules/demo/demoEnumerators";
import { applyLive, cancelPending, closePosition, initialState } from "src/modules/demo/demoEngine";

export default (state: DemoState = initialState(), { type, payload }: AnyAction): DemoState => {
  switch (type) {
    case actions.HYDRATE:
      // Keep any live prices that arrived before the saved account was loaded.
      return { ...payload, marketQuotes: state.marketQuotes };
    case actions.REPLACE:
      return payload;
    case actions.LIVE_QUOTES:
      return applyLive(state, payload);
    case actions.SELECT_SYMBOL:
      return quotes.some((q) => q.symbol === payload) ? { ...state, selectedSymbol: payload } : state;
    case actions.CLOSE_POSITION:
      return closePosition(state, payload);
    case actions.CANCEL_PENDING:
      return cancelPending(state, payload);
    case actions.BALANCE_SYNCED:
      // The server is the source of truth for a real account's balance.
      return Number.isFinite(payload) && payload >= 0 ? { ...state, balance: payload } : state;
    case actions.RESET:
      return { ...initialState(), marketQuotes: state.marketQuotes };
    case authActions.AUTH_SUCCESS:
      // Signing in (or out) starts a fresh account, so the balance of the previous user is
      // never carried over. A real account's balance is then set by the server's wallets.
      return { ...initialState(), marketQuotes: state.marketQuotes };
    default:
      return state;
  }
};
