import demoActions from "src/modules/demo/demoActions";
import { startLiveQuotes } from "src/modules/market/liveQuotesService";
import type { AppDispatch } from "src/modules/store";

// Streams live market prices into the store while the workspace is open; returns a stop function.
export function startMarketTicker(dispatch: AppDispatch) {
  return startLiveQuotes((updates) => dispatch(demoActions.doLiveQuotes(updates)));
}
