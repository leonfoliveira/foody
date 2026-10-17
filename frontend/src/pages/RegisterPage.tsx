import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const form = useForm<{ name: string; email: string; password: string }>();

  return (
    <div>
      <div>
        <h1>Registrar</h1>
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
          <div>
            <label htmlFor="name">Nome</label>
            <input type="text" id="name" {...form.register("name")} required />
            {form.formState.errors.name && (
              <span>{form.formState.errors.name.message}</span>
            )}
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              {...form.register("email")}
              required
            />
            {form.formState.errors.email && (
              <span>{form.formState.errors.email.message}</span>
            )}
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              {...form.register("password")}
              required
            />
            {form.formState.errors.password && (
              <span>{form.formState.errors.password.message}</span>
            )}
          </div>
          <button type="submit">Registrar</button>
          <p>
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
