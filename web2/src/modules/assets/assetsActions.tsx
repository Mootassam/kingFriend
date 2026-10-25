import AssetsService from "src/modules/assets/assetsService";
import authSelectors from "src/modules/auth/authSelectors";
import demoActions from "src/modules/demo/demoActions";
import Errors from "src/modules/shared/error/errors";
import type { AppThunk } from "src/modules/store";

const prefix = "ASSETS";

const assetsActions = {
  FETCH_STARTED: `${prefix}_FETCH_STARTED`,
  FETCH_SUCCESS: `${prefix}_FETCH_SUCCESS`,
  FETCH_ERROR: `${prefix}_FETCH_ERROR`,
  RESETED: `${prefix}_RESETED`,

  doFetch: (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    try {
      dispatch({ type: assetsActions.FETCH_STARTED });
      const rows = await AssetsService.list("USD");
      dispatch({ type: assetsActions.FETCH_SUCCESS, payload: { rows } });
      // The wallets on the server are the account balance for a real account, so the trading
      // account follows them instead of the demo starting balance. Demo accounts keep their
      // virtual funds.
      if (!authSelectors.selectIsDemo(getState())) {
        dispatch(demoActions.doSyncBalance(AssetsService.total(rows)));
      }
    } catch (error) {
      Errors.handle(error);
      dispatch({ type: assetsActions.FETCH_ERROR, payload: Errors.selectMessage(error) });
    }
  },

  doReset: () => ({ type: assetsActions.RESETED }),
};

export default assetsActions;
