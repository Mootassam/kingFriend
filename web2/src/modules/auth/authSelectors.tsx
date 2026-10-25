import type { RootState } from "src/modules/store";

const selectCurrentUser = (state: RootState) => state.auth.currentUser;

const authSelectors = {
  selectCurrentUser,
  selectSignedIn: (state: RootState) => Boolean(state.auth.currentUser),
  selectLoadingInit: (state: RootState) => state.auth.loadingInit,
  selectLoading: (state: RootState) => state.auth.loading,
  selectErrorMessage: (state: RootState) => state.auth.errorMessage,
  selectIsDemo: (state: RootState) => state.auth.currentUser?.accountType === "demo",
  selectDisplayName: (state: RootState) => {
    const user = selectCurrentUser(state);
    if (!user) return "";
    return user.fullName || user.username || user.email.split("@")[0];
  },
};

export default authSelectors;
