import AssetsService from "src/modules/assets/assetsService";
import type { RootState } from "src/modules/store";

const selectRows = (state: RootState) => state.assets.rows;

const assetsSelectors = {
  selectRows,
  selectLoading: (state: RootState) => state.assets.loading,
  selectLoaded: (state: RootState) => state.assets.loaded,
  selectErrorMessage: (state: RootState) => state.assets.errorMessage,
  selectTotalUsd: (state: RootState) => AssetsService.total(selectRows(state)),
};

export default assetsSelectors;
