import { Outlet, Navigate, useNavigate } from "react-router-dom";
import AuthenticationContext from "../contexts/AuthenticationContext";
import { useContext, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Button, Snackbar } from "@mui/material";

export default function AuthenticatedPageLayout() {
  const { loggedInUser } = useContext(AuthenticationContext);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function logout() {
    try {
      await axios.post(
        `${API_URL}/v1/users/logout`,
        {},
        { withCredentials: true },
      );
      navigate("/login");
    } catch {
      setLogoutError("Failed to logout.");
    }
  }

  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white">
        <p>Olá, {loggedInUser?.name}</p>
        <Button variant="text" color="primary" onClick={logout}>
          Sair
        </Button>
      </div>
      <Outlet />
      <Snackbar
        open={!!logoutError}
        autoHideDuration={6000}
        onClose={() => setLogoutError(null)}
        message={logoutError}
      />
    </div>
  );
}
