import { Store } from "redux";
import authActions from "src/modules/auth/authActions";
import demoActions from "src/modules/demo/demoActions";
import DemoService from "src/modules/demo/demoService";

// Runs once after the store is created.
const initializers: ((store: Store) => void)[] = [
  (store) => {
    store.dispatch(demoActions.doHydrate(DemoService.load()));

    // Save the virtual account when it changes; live price ticks alone don't need saving.
    const account = (demo) => [demo.balance, demo.selectedSymbol, demo.positions, demo.pending, demo.history];
    let previous = account(store.getState().demo);
    store.subscribe(() => {
      const current = account(store.getState().demo);
      if (current.some((value, i) => value !== previous[i])) {
        previous = current;
        DemoService.save(store.getState().demo);
      }
    });
  },
  // Restores the signed-in user from the saved token.
  (store) => {
    store.dispatch(authActions.doInit() as any);
  },
];

export default initializers;
