import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, RouteProps } from "react-router-dom";
import authSelectors from "src/modules/auth/authSelectors";

// Workspace routes: only for a signed-in user (real or demo).
export default function PrivateRoute({ children, ...rest }: RouteProps & { children: ReactNode }) {
  const signedIn = useSelector(authSelectors.selectSignedIn);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        signedIn ? children : <Redirect to={{ pathname: "/login", state: { from: location } }} />
      }
    />
  );
}
