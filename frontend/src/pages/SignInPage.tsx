import { useForm } from "react-hook-form";

export default function SignInPage() {
  const form = useForm<{ email: string; password: string }>();

  return (
    <div>
      <div>
        <h1>Entrar</h1>
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
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
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
