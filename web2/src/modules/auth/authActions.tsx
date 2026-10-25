import AuthService, { WelcomeKind } from "src/modules/auth/authService";
import AuthToken from "src/modules/auth/authToken";
import Errors from "src/modules/shared/error/errors";
import { closeSocket } from "src/modules/shared/socket/socketClient";
import type { AppThunk } from "src/modules/store";

const prefix = "AUTH";

// Shared by email sign-in and demo login: store the token, then load the user.
const signinWith =
  (getToken: () => Promise<string>, welcome: WelcomeKind = "signin"): AppThunk<Promise<boolean>> =>
  async (dispatch) => {
    try {
      dispatch({ type: authActions.AUTH_START });
      const token = await getToken();
      AuthToken.set(token);
      const currentUser = await AuthService.fetchMe();
      AuthService.markWelcome(welcome);
      dispatch({ type: authActions.AUTH_SUCCESS, payload: { currentUser } });
      return true;
    } catch (error) {
      AuthService.signout();
      if (Errors.errorCode(error) !== 400) {
        Errors.handle(error);
      }
      dispatch({ type: authActions.AUTH_ERROR, payload: Errors.selectMessage(error) });
      return false;
    }
  };

const authActions = {
  AUTH_INIT_SUCCESS: `${prefix}_INIT_SUCCESS`,
  AUTH_INIT_ERROR: `${prefix}_INIT_ERROR`,
  AUTH_START: `${prefix}_START`,
  AUTH_SUCCESS: `${prefix}_SUCCESS`,
  AUTH_ERROR: `${prefix}_ERROR`,
  CURRENT_USER_REFRESH_SUCCESS: `${prefix}_CURRENT_USER_REFRESH_SUCCESS`,
  ERROR_MESSAGE_CLEARED: `${prefix}_ERROR_MESSAGE_CLEARED`,

  doInit: (): AppThunk<Promise<void>> => async (dispatch) => {
    try {
      const currentUser = AuthToken.get() ? await AuthService.fetchMe() : null;
      dispatch({ type: authActions.AUTH_INIT_SUCCESS, payload: { currentUser } });
    } catch (error) {
      // Expired or revoked token: start signed out.
      AuthService.signout();
      Errors.handle(error);
      dispatch({ type: authActions.AUTH_INIT_ERROR });
    }
  },

  // Reloads the user so changes made on the server (KYC approved, name edited by an admin) show up.
  doRefreshCurrentUser: (): AppThunk<Promise<void>> => async (dispatch) => {
    try {
      const currentUser = await AuthService.fetchMe();
      dispatch({ type: authActions.CURRENT_USER_REFRESH_SUCCESS, payload: { currentUser } });
    } catch (error) {
      Errors.handle(error);
    }
  },

  doSigninWithEmailAndPassword: (email: string, password: string) =>
    signinWith(() => AuthService.signinWithEmailAndPassword(email, password)),

  doRegisterEmailAndPassword: (email: string, password: string, phoneNumber: string, invitationCode: string) =>
    signinWith(() => AuthService.registerWithEmailAndPassword(email, password, phoneNumber, invitationCode), "signup"),

  doDemoLogin: () => signinWith(() => AuthService.demoLogin()),

  doSignout: () => {
    AuthService.signout();
    closeSocket();
    return { type: authActions.AUTH_SUCCESS, payload: { currentUser: null } };
  },

  doClearErrorMessage: () => ({ type: authActions.ERROR_MESSAGE_CLEARED }),
};

export default authActions;
