import { DemoState } from "src/modules/demo/demoEnumerators";
import { LiveUpdate, OrderRequest, createOrder } from "src/modules/demo/demoEngine";
import layoutActions from "src/modules/layout/layoutActions";
import type { AppThunk } from "src/modules/store";

const prefix = "DEMO";

const demoActions = {
  HYDRATE: `${prefix}_HYDRATE`,
  LIVE_QUOTES: `${prefix}_LIVE_QUOTES`,
  SELECT_SYMBOL: `${prefix}_SELECT_SYMBOL`,
  REPLACE: `${prefix}_REPLACE`,
  CLOSE_POSITION: `${prefix}_CLOSE_POSITION`,
  CANCEL_PENDING: `${prefix}_CANCEL_PENDING`,
  BALANCE_SYNCED: `${prefix}_BALANCE_SYNCED`,
  RESET: `${prefix}_RESET`,

  doHydrate: (state: DemoState) => ({ type: demoActions.HYDRATE, payload: state }),

  doLiveQuotes:
    (updates: Record<string, LiveUpdate>): AppThunk =>
    (dispatch) => {
      dispatch({ type: demoActions.LIVE_QUOTES, payload: updates });
      dispatch(layoutActions.doMarkUpdated());
    },

  doSelectSymbol: (symbol: string) => ({ type: demoActions.SELECT_SYMBOL, payload: symbol }),

  // Throws when the engine rejects the order so the ticket can show the message.
  doPlaceOrder:
    (request: OrderRequest): AppThunk =>
    (dispatch, getState) => {
      const next = createOrder(getState().demo, request);
      dispatch({ type: demoActions.REPLACE, payload: next });
    },

  doClosePosition: (id: string) => ({ type: demoActions.CLOSE_POSITION, payload: id }),
  doCancelPending: (id: string) => ({ type: demoActions.CANCEL_PENDING, payload: id }),

  // Real accounts spend the balance the server holds, so the account balance is replaced by
  // the wallets the server returned. Demo accounts keep their virtual funds.
  doSyncBalance: (balance: number) => ({ type: demoActions.BALANCE_SYNCED, payload: balance }),

  doReset: () => ({ type: demoActions.RESET }),
};

export default demoActions;
