import { AnyAction } from "redux";
import authActions from "src/modules/auth/authActions";
import actions from "src/modules/kyc/kycActions";
import type { KycRecord } from "src/modules/kyc/kycService";

export interface KycState {
  latest: KycRecord | null;
  loading: boolean;
}

const initialData: KycState = {
  latest: null,
  loading: false,
};

export default (state: KycState = initialData, { type, payload }: AnyAction): KycState => {
  switch (type) {
    case actions.FETCH_STARTED:
      return { ...state, loading: true };
    case actions.FETCH_SUCCESS:
      return { latest: payload.latest, loading: false };
    case actions.FETCH_ERROR:
      return { ...state, loading: false };
    case actions.RESETED:
    case authActions.AUTH_SUCCESS:
    case authActions.AUTH_ERROR:
      return initialData;
    default:
      return state;
  }
};
