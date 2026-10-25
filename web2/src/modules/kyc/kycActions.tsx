import KycService from "src/modules/kyc/kycService";
import Errors from "src/modules/shared/error/errors";
import type { AppThunk } from "src/modules/store";

const prefix = "KYC";

const kycActions = {
  FETCH_STARTED: `${prefix}_FETCH_STARTED`,
  FETCH_SUCCESS: `${prefix}_FETCH_SUCCESS`,
  FETCH_ERROR: `${prefix}_FETCH_ERROR`,
  RESETED: `${prefix}_RESETED`,

  doFetch: (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const user = getState().auth.currentUser;
    if (!user) return;
    try {
      dispatch({ type: kycActions.FETCH_STARTED });
      const latest = await KycService.latest(user.id);
      dispatch({ type: kycActions.FETCH_SUCCESS, payload: { latest } });
    } catch (error) {
      Errors.handle(error);
      dispatch({ type: kycActions.FETCH_ERROR });
    }
  },

  doReset: () => ({ type: kycActions.RESETED }),
};

export default kycActions;
