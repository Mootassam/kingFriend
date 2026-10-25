import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "src/modules/store";
import { metrics } from "src/modules/demo/demoEngine";

const selectRaw = (state: RootState) => state.demo;
const selectQuotes = (state: RootState) => state.demo.marketQuotes;
const selectQuote = (symbol: string) => (state: RootState) =>
  state.demo.marketQuotes.find((q) => q.symbol === symbol)!;
const selectSelectedQuote = (state: RootState) =>
  state.demo.marketQuotes.find((q) => q.symbol === state.demo.selectedSymbol)!;
const selectBalance = (state: RootState) => state.demo.balance;
const selectName = (state: RootState) => state.demo.name;
const selectPositions = (state: RootState) => state.demo.positions;
const selectPending = (state: RootState) => state.demo.pending;
const selectHistory = (state: RootState) => state.demo.history;

// metrics() builds a new object, so memoize it on the demo slice instead of selecting it.
export function useDemoStats() {
  const demo = useSelector(selectRaw);
  return useMemo(() => metrics(demo), [demo]);
}

const demoSelectors = {
  selectRaw,
  selectQuotes,
  selectQuote,
  selectSelectedQuote,
  selectBalance,
  selectName,
  selectPositions,
  selectPending,
  selectHistory,
};

export default demoSelectors;
