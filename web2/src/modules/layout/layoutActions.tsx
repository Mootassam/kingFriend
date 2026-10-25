const prefix = "LAYOUT";

const layoutActions = {
  MENU_TOGGLE: `${prefix}_MENU_TOGGLE`,
  MENU_HIDE: `${prefix}_MENU_HIDE`,
  MARK_UPDATED: `${prefix}_MARK_UPDATED`,

  doToggleMenu: () => ({ type: layoutActions.MENU_TOGGLE }),
  doHideMenu: () => ({ type: layoutActions.MENU_HIDE }),
  doMarkUpdated: () => ({
    type: layoutActions.MARK_UPDATED,
    payload: new Date().toLocaleTimeString("en-GB"),
  }),
};

export default layoutActions;
