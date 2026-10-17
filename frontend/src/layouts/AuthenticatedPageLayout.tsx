import { Outlet, Navigate } from "react-router-dom";
import AuthenticationContext from "../contexts/AuthenticationContext";
import { useContext } from "react";

export default function AuthenticatedPageLayout() {
  const { loggedInUser } = useContext(AuthenticationContext);

  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
