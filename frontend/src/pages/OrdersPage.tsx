import axios from "axios";
import { useForm } from "react-hook-form";
import { useContext, useEffect, useState } from "react";
import AuthenticationContext from "../contexts/AuthenticationContext";
import type { OrderModel } from "../models/OrderModel";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Snackbar } from "@mui/material";

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  RECEBIDO: ["EM_PREPARO", "CANCELADO"],
  EM_PREPARO: ["SAIU_PARA_ENTREGA", "CANCELADO"],
  SAIU_PARA_ENTREGA: ["ENTREGUE", "CANCELADO"],
  ENTREGUE: [],
  CANCELADO: [],
};

export default function OrdersPage() {
  const form = useForm<{
    customer: string;
    items: string;
    address: string;
  }>();
  const { loggedInUser } = useContext(AuthenticationContext);
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [isFetchingOrdersLoading, setIsFetchingOrdersLoading] = useState(false);
  const [isCreatingOrderLoading, setIsCreatingOrderLoading] = useState(false);
  const [isUpdatingOrderLoading, setIsUpdatingOrderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setIsFetchingOrdersLoading(true);
    try {
      const response = await axios.get("/v1/orders");
      setOrders(response.data);
    } catch {
      setError("Failed to fetch orders.");
    } finally {
      setIsFetchingOrdersLoading(false);
    }
  }

  async function createOrder(data: {
    customer: string;
    items: string;
    address: string;
  }) {
    setIsCreatingOrderLoading(true);
    try {
      const response = await axios.post("/v1/orders", data);
      setOrders((prevOrders) => [...prevOrders, response.data]);
    } catch {
      setError("Failed to create order.");
    } finally {
      setIsCreatingOrderLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setIsUpdatingOrderLoading(true);
    try {
      const response = await axios.patch(`/v1/orders/${orderId}`, { status });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? response.data : order,
        ),
      );
    } catch {
      setError("Failed to update order status.");
    } finally {
      setIsUpdatingOrderLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <p>Olá, {loggedInUser?.name}</p>
      <h1>Pedidos</h1>

      <div>
        Novo Pedido
        <form onSubmit={form.handleSubmit(createOrder)}>
          <div>
            <TextField
              label="Cliente"
              type="text"
              {...form.register("customer")}
              disabled={isCreatingOrderLoading}
              error={!!form.formState.errors.customer}
              helperText={form.formState.errors.customer?.message}
            />
          </div>
          <div>
            <TextField
              label="Items"
              type="text"
              {...form.register("items")}
              disabled={isCreatingOrderLoading}
              error={!!form.formState.errors.items}
              helperText={form.formState.errors.items?.message}
            />
          </div>
          <div>
            <TextField
              label="Endereço"
              type="text"
              {...form.register("address")}
              disabled={isCreatingOrderLoading}
              error={!!form.formState.errors.address}
              helperText={form.formState.errors.address?.message}
            />
          </div>
          <Button type="submit" variant="contained">
            Criar Pedido
          </Button>
        </form>
      </div>

      <div>
        {isFetchingOrdersLoading ? (
          <p>Loading orders...</p>
        ) : (
          <>
            {orders.map((order) => (
              <div key={order.id}>
                <p>ID: {order.id}</p>
                <p>Cliente: {order.customer}</p>
                <p>Items: {order.items}</p>
                <p>Endereço: {order.address}</p>
                <p>Status: {order.status}</p>

                {ORDER_STATUS_TRANSITIONS[order.status].map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                    disabled={isUpdatingOrderLoading}
                  >
                    Mover para {nextStatus}
                  </Button>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
    </div>
  );
}
