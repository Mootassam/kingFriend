import { DemoState } from "src/modules/demo/demoEnumerators";
import { restoreState } from "src/modules/demo/demoEngine";
import storage, { storageKeys } from "src/security/storage";

export default class DemoService {
  static load(): DemoState {
    return restoreState(storage.get(storageKeys.demo));
  }

  static save(state: DemoState) {
    storage.set(storageKeys.demo, JSON.stringify(state));
  }
}
