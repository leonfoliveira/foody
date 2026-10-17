import axios from "axios";
import { API_URL } from "../config";
import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import AuthenticationContext from "../contexts/AuthenticationContext";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Snackbar } from "@mui/material";

export default function LoginPage() {
  const form = useForm<{ email: string; password: string }>();
  const { setLoggedInUser } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function login(data: { email: string; password: string }) {
    try {
      setIsLoggingIn(true);
      const result = await axios.post(`${API_URL}/v1/users/login`, data, {
        withCredentials: true,
      });
      setLoggedInUser(result.data);
      navigate("/");
    } catch {
      setLoginError(
        "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Entrar</h1>
        <form onSubmit={form.handleSubmit(login)}>
          <div className="mb-4">
            <TextField
              type="email"
              label="E-mail"
              {...form.register("email")}
              required
              disabled={isLoggingIn}
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
              fullWidth
              data-testid="email"
            />
          </div>
          <div className="mb-4">
            <TextField
              type="password"
              label="Senha"
              {...form.register("password")}
              required
              disabled={isLoggingIn}
              error={!!form.formState.errors.password}
              helperText={form.formState.errors.password?.message}
              fullWidth
              data-testid="password"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoggingIn}
            loading={isLoggingIn}
            fullWidth
            variant="contained"
            data-testid="login-button"
          >
            Entrar
          </Button>
          <p className="mt-4 text-center">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-blue-500">
              Registrar
            </Link>
          </p>

          <Snackbar
            open={!!loginError}
            autoHideDuration={6000}
            onClose={() => setLoginError(null)}
            message={loginError}
            data-testid="login-error"
          />
        </form>
      </div>
    </div>
  );
}
