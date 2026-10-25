import { useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import authSelectors from "src/modules/auth/authSelectors";
import LayoutPage from "src/view/layout/LayoutPage";
import ScrollToTop from "src/view/layout/ScrollToTop";
import lazyRouter from "src/view/shared/Lazyroutes";
import PrivateRoute from "src/view/shared/routes/PrivateRoute";
import routes from "src/view/shared/routes";

function RoutesComponent() {
  const loadingInit = useSelector(authSelectors.selectLoadingInit);

  if (loadingInit) {
    return <div className="loading">Loading your workspace…</div>;
  }

  return (
    <>
      <ScrollToTop />
      <Switch>
        {routes.publicRoutes.map((route) => (
          <Route exact key={route.path} path={route.path} component={lazyRouter({ loader: route.loader })} />
        ))}

        <PrivateRoute path="/app">
          <LayoutPage>
            <Switch>
              {routes.navRoutes.map((route) => (
                <Route exact key={route.path} path={route.path} component={lazyRouter({ loader: route.loader })} />
              ))}
              <Redirect to="/app" />
            </Switch>
          </LayoutPage>
        </PrivateRoute>

        <Redirect to="/" />
      </Switch>
    </>
  );
}

export default RoutesComponent;
