import { AnyAction } from "redux";
import actions from "src/modules/assets/assetsActions";
import authActions from "src/modules/auth/authActions";
import type { Wallet } from "src/modules/assets/assetsService";

export interface AssetsState {
  rows: Wallet[];
  loading: boolean;
  loaded: boolean;
  errorMessage: string | null;
}

const initialData: AssetsState = {
  rows: [],
  loading: false,
  loaded: false,
  errorMessage: null,
};

export default (state: AssetsState = initialData, { type, payload }: AnyAction): AssetsState => {
  switch (type) {
    case actions.FETCH_STARTED:
      return { ...state, loading: true, errorMessage: null };
    case actions.FETCH_SUCCESS:
      return { ...state, rows: payload.rows, loading: false, loaded: true, errorMessage: null };
    case actions.FETCH_ERROR:
      // Keep the last good balance; the page shows the error next to it.
      return { ...state, loading: false, errorMessage: payload || null };
    case actions.RESETED:
    // Signing in, out or as someone else must never show the previous user's balance.
    case authActions.AUTH_SUCCESS:
    case authActions.AUTH_ERROR:
      return initialData;
    default:
      return state;
  }
};
