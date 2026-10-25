import { AnyAction } from "redux";
import actions from "src/modules/auth/authActions";
import type { CurrentUser } from "src/modules/auth/authService";

export interface AuthState {
  currentUser: CurrentUser | null;
  loadingInit: boolean;
  loading: boolean;
  errorMessage: string | null;
}

const initialData: AuthState = {
  currentUser: null,
  loadingInit: true,
  loading: false,
  errorMessage: null,
};

export default (state: AuthState = initialData, { type, payload }: AnyAction): AuthState => {
  switch (type) {
    case actions.AUTH_INIT_SUCCESS:
      return { ...state, currentUser: payload.currentUser, loadingInit: false };
    case actions.AUTH_INIT_ERROR:
      return { ...state, currentUser: null, loadingInit: false };
    case actions.AUTH_START:
      return { ...state, loading: true, errorMessage: null };
    case actions.AUTH_SUCCESS:
      return { ...state, currentUser: payload.currentUser, loading: false, errorMessage: null };
    case actions.AUTH_ERROR:
      return { ...state, currentUser: null, loading: false, errorMessage: payload || null };
    case actions.CURRENT_USER_REFRESH_SUCCESS:
      return { ...state, currentUser: payload.currentUser };
    case actions.ERROR_MESSAGE_CLEARED:
      return { ...state, errorMessage: null };
    default:
      return state;
  }
};
