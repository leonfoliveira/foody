import axios from "axios";
import { API_URL } from "../config";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AuthenticationContext from "../contexts/AuthenticationContext";
import { Button, TextField, Snackbar } from "@mui/material";

export default function RegisterPage() {
  const form = useForm<{ name: string; email: string; password: string }>();
  const { setLoggedInUser } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );

  async function register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    try {
      setIsRegistering(true);
      const result = await axios.post(`${API_URL}/v1/users/register`, data, {
        withCredentials: true,
      });
      setLoggedInUser(result.data);
      navigate("/");
    } catch {
      setRegistrationError(
        "Registration failed. Please check your details and try again.",
      );
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Registrar</h1>
        <form onSubmit={form.handleSubmit(register)}>
          <div className="mb-4">
            <TextField
              type="text"
              label="Nome"
              {...form.register("name")}
              required
              disabled={isRegistering}
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
              fullWidth
              data-testid="name"
            />
          </div>
          <div className="mb-4">
            <TextField
              type="email"
              label="E-mail"
              {...form.register("email")}
              required
              disabled={isRegistering}
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
              disabled={isRegistering}
              error={!!form.formState.errors.password}
              helperText={form.formState.errors.password?.message}
              fullWidth
              data-testid="password"
            />
          </div>
          <Button
            type="submit"
            disabled={isRegistering}
            fullWidth
            variant="contained"
          >
            Registrar
          </Button>
          <p className="mt-4 text-center">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-blue-500">
              Entrar
            </Link>
          </p>

          <Snackbar
            open={!!registrationError}
            autoHideDuration={6000}
            onClose={() => setRegistrationError(null)}
            message={registrationError}
            data-testid="registration-error"
          />
        </form>
      </div>
    </div>
  );
}
