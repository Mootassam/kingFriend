import { combineReducers } from "redux";
import assets from "src/modules/assets/assetsReducers";
import auth from "src/modules/auth/authReducers";
import demo from "src/modules/demo/demoReducers";
import kyc from "src/modules/kyc/kycReducers";
import layout from "src/modules/layout/layoutReducers";

export default () =>
  combineReducers({
    assets,
    auth,
    demo,
    kyc,
    layout,
  });
