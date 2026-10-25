import { AnyAction } from "redux";
import actions from "src/modules/layout/layoutActions";

export interface LayoutState {
  menuVisible: boolean;
  lastUpdated: string;
}

const initialData: LayoutState = {
  menuVisible: false,
  lastUpdated: new Date().toLocaleTimeString("en-GB"),
};

export default (state: LayoutState = initialData, { type, payload }: AnyAction): LayoutState => {
  switch (type) {
    case actions.MENU_TOGGLE:
      return { ...state, menuVisible: !state.menuVisible };
    case actions.MENU_HIDE:
      return { ...state, menuVisible: false };
    case actions.MARK_UPDATED:
      return { ...state, lastUpdated: payload };
    default:
      return state;
  }
};
