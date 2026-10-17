import axios from "axios";
import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import AuthenticationContext from "../contexts/AuthenticationContext";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Snackbar } from "@mui/material";

export default function LoginPage() {
  const form = useForm<{ email: string; password: string }>();
  const { setLoggedInUser } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function login(data: { email: string; password: string }) {
    try {
      setIsLoggingIn(true);
      const result = await axios.post("/v1/users/login", data);
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
    <div>
      <div>
        <h1>Entrar</h1>
        <form onSubmit={form.handleSubmit(login)}>
          <div>
            <TextField
              type="email"
              label="E-mail"
              {...form.register("email")}
              disabled={isLoggingIn}
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
            />
          </div>
          <div>
            <TextField
              type="password"
              label="Senha"
              {...form.register("password")}
              disabled={isLoggingIn}
              error={!!form.formState.errors.password}
              helperText={form.formState.errors.password?.message}
            />
          </div>
          <Button type="submit" disabled={isLoggingIn}>
            Entrar
          </Button>
          <p>
            Não tem uma conta? <Link to="/register">Registrar</Link>
          </p>

          <Snackbar
            open={!!loginError}
            autoHideDuration={6000}
            onClose={() => setLoginError(null)}
            message={loginError}
          />
        </form>
      </div>
    </div>
  );
}
