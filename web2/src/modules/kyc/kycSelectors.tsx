import type { KycStatus } from "src/modules/kyc/kycService";
import type { RootState } from "src/modules/store";

// Same rule as PC: the user's `kyc` flag means verified; otherwise a pending latest
// submission means under review; anything else (none, or canceled) is unverified.
const selectKycStatus = (state: RootState): KycStatus => {
  if (state.auth.currentUser?.kyc) return "success";
  if (state.kyc.latest?.status === "pending") return "pending";
  return "unverified";
};

const kycSelectors = {
  selectKycStatus,
  selectLoading: (state: RootState) => state.kyc.loading,
};

export default kycSelectors;
