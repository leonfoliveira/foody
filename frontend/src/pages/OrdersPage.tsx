import { useForm } from "react-hook-form";

export default function OrdersPage() {
  const form = useForm<{
    customer: string;
    items: string;
    address: string;
  }>();

  return (
    <div>
      <h1>Pedidos</h1>

      <div>
        Novo Pedido
        <form onSubmit={form.handleSubmit((values) => console.log(values))}>
          <div>
            <label htmlFor="customer">Cliente:</label>
            <input type="text" id="customer" {...form.register("customer")} />
          </div>
          <div>
            <label htmlFor="items">Items:</label>
            <input type="text" id="items" {...form.register("items")} />
          </div>
          <div>
            <label htmlFor="address">Endereço:</label>
            <input type="text" id="address" {...form.register("address")} />
          </div>
          <button type="submit">Criar Pedido</button>
        </form>
      </div>

      <div>
        <div>
          <p>ID: 12345</p>
          <p>Cliente: João Silva</p>
          <p>Data: 2024-06-15</p>
          <p>Status: RECEBIDO</p>

          <button>Mudar para EM _PROCESSAMENTO</button>
          <button>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
