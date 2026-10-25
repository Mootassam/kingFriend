import type { RootState } from "src/modules/store";

const layoutSelectors = {
  selectMenuVisible: (state: RootState) => state.layout.menuVisible,
  selectLastUpdated: (state: RootState) => state.layout.lastUpdated,
};

export default layoutSelectors;
