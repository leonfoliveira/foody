import axios from "axios";
import { API_URL } from "../config";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import type { OrderModel } from "../models/OrderModel";
import { Button, TextField, Card, Divider, Snackbar } from "@mui/material";

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
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [isFetchingOrdersLoading, setIsFetchingOrdersLoading] = useState(false);
  const [isCreatingOrderLoading, setIsCreatingOrderLoading] = useState(false);
  const [isUpdatingOrderLoading, setIsUpdatingOrderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setIsFetchingOrdersLoading(true);
    try {
      const response = await axios.get(`${API_URL}/v1/orders`, {
        withCredentials: true,
      });
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
      const response = await axios.post(`${API_URL}/v1/orders`, data, {
        withCredentials: true,
      });
      setOrders((prevOrders) => [...prevOrders, response.data]);
    } catch {
      setError("Failed to create order.");
    } finally {
      setIsCreatingOrderLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setIsUpdatingOrderLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/v1/orders/${orderId}/status`,
        {},
        {
          withCredentials: true,
          params: {
            newStatus,
          },
        },
      );
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
    <div className="flex flex-col items-center pt-8 min-h-screen bg-gray-100">
      <div className="mb-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Novo Pedido</h2>
        <form
          onSubmit={form.handleSubmit(createOrder)}
          className="w-full max-w-md"
        >
          <div className="mb-4">
            <TextField
              label="Cliente"
              type="text"
              {...form.register("customer")}
              disabled={isCreatingOrderLoading}
              error={!!form.formState.errors.customer}
              helperText={form.formState.errors.customer?.message}
              fullWidth
              data-testid="customer"
            />
          </div>
          <div className="mb-4">
            <TextField
              label="Items"
              type="text"
              {...form.register("items")}
              disabled={isCreatingOrderLoading}
              error={!!form.formState.errors.items}
              helperText={form.formState.errors.items?.message}
              fullWidth
              data-testid="items"
            />
          </div>
          <div className="mb-4">
            <TextField
              label="Endereço"
              type="text"
              {...form.register("address")}
              disabled={isCreatingOrderLoading}
              error={!!form.formState.errors.address}
              helperText={form.formState.errors.address?.message}
              fullWidth
              data-testid="address"
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            className="mt-4"
            fullWidth
            data-testid="create-order-button"
          >
            Criar Pedido
          </Button>
        </form>
      </div>

      <Divider className="my-8 w-full"></Divider>

      <h1 className="mt-4 text-2xl font-bold mb-4">Pedidos</h1>

      <div>
        {!isFetchingOrdersLoading && orders.length === 0 && (
          <p data-testid="no-orders-found">No orders found.</p>
        )}
        {isFetchingOrdersLoading ? (
          <p data-testid="loading-orders">Loading orders...</p>
        ) : (
          <>
            {orders.map((order) => (
              <div key={order.id}>
                <Card className="mb-4 p-4" data-testid={`order-${order.id}`}>
                  <p>
                    <span
                      className="font-bold"
                      data-testid={`order-${order.id}-id`}
                    >
                      ID:
                    </span>{" "}
                    {order.id}
                  </p>
                  <p>
                    <span
                      className="font-bold"
                      data-testid={`order-${order.id}-customer`}
                    >
                      Cliente:
                    </span>{" "}
                    {order.customer}
                  </p>
                  <p>
                    <span
                      className="font-bold"
                      data-testid={`order-${order.id}-items`}
                    >
                      Items:
                    </span>{" "}
                    {order.items}
                  </p>
                  <p>
                    <span
                      className="font-bold"
                      data-testid={`order-${order.id}-address`}
                    >
                      Endereço:
                    </span>{" "}
                    {order.address}
                  </p>
                  <p>
                    <span
                      className="font-bold"
                      data-testid={`order-${order.id}-status`}
                    >
                      Status:
                    </span>{" "}
                    {order.status}
                  </p>

                  {ORDER_STATUS_TRANSITIONS[order.status].length > 0 && (
                    <div className="flex gap-2 justify-between mt-4">
                      {ORDER_STATUS_TRANSITIONS[order.status].map(
                        (newStatus) => (
                          <Button
                            key={newStatus}
                            onClick={() =>
                              updateOrderStatus(order.id, newStatus)
                            }
                            disabled={isUpdatingOrderLoading}
                            data-testid={`order-${order.id}-move-to-${newStatus}`}
                          >
                            Mover para {newStatus}
                          </Button>
                        ),
                      )}
                    </div>
                  )}
                </Card>
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
        data-testid="orders-error"
      />
    </div>
  );
}
