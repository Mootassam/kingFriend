import { createBrowserHistory } from "history";
import { AnyAction, applyMiddleware, compose, createStore } from "redux";
import thunkMiddleware, { ThunkAction, ThunkDispatch } from "redux-thunk";
import initializers from "src/modules/initializers";
import createRootReducer from "src/modules/reducers";

const history = createBrowserHistory();

const rootReducer = createRootReducer();
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, AnyAction>;

const composeEnhancers =
  (import.meta.env.DEV && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

let store;

export function configureStore(preloadedState?: Partial<RootState>) {
  store = createStore(
    rootReducer,
    preloadedState as any,
    composeEnhancers(applyMiddleware(thunkMiddleware)),
  );

  for (const initializer of initializers) {
    initializer(store);
  }

  return store;
}

export function getHistory() {
  return history;
}

export default function getStore() {
  return store;
}
