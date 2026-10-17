import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AuthenticationContext from "../contexts/AuthenticationContext";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";

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
      const result = await axios.post("/v1/users/register", data);
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
    <div>
      <div>
        <h1>Registrar</h1>
        <form onSubmit={form.handleSubmit(register)}>
          <div>
            <TextField
              type="text"
              label="Nome"
              {...form.register("name")}
              disabled={isRegistering}
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
            />
          </div>
          <div>
            <TextField
              type="email"
              label="E-mail"
              {...form.register("email")}
              required
              disabled={isRegistering}
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
            />
          </div>
          <div>
            <TextField
              type="password"
              label="Senha"
              {...form.register("password")}
              required
              disabled={isRegistering}
              error={!!form.formState.errors.password}
              helperText={form.formState.errors.password?.message}
            />
          </div>
          <Button type="submit" disabled={isRegistering}>
            Registrar
          </Button>
          <p>
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>

          <Snackbar
            open={!!registrationError}
            autoHideDuration={6000}
            onClose={() => setRegistrationError(null)}
            message={registrationError}
          />
        </form>
      </div>
    </div>
  );
}
