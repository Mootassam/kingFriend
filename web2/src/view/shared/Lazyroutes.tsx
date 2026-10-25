import { ComponentType, Suspense, lazy } from "react";

const cache = new Map<() => Promise<{ default: ComponentType<any> }>, ComponentType<any>>();

// Wraps a route loader in React.lazy once so re-renders reuse the same component.
export default function lazyRouter({ loader }: { loader: () => Promise<{ default: ComponentType<any> }> }) {
  let component = cache.get(loader);
  if (!component) {
    const Lazy = lazy(loader);
    component = (props: any) => (
      <Suspense fallback={<div className="loading">Loading…</div>}>
        <Lazy {...props} />
      </Suspense>
    );
    cache.set(loader, component);
  }
  return component;
}
