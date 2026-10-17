// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import OrdersPage from "../../src/pages/OrdersPage";
import { API_URL } from "../../src/config";
import type { OrderModel } from "../../src/models/OrderModel";

vi.mock("axios");

vi.mock("@mui/material", () => ({
  TextField: ({
    label,
    type,
    disabled,
    error,
    helperText,
    "data-testid": testId,
    ...props
  }: any) => (
    <div>
      <label htmlFor={testId}>{label}</label>
      <input
        id={testId}
        type={type}
        disabled={disabled}
        data-testid={testId}
        {...props}
      />
      {error && <span>{helperText}</span>}
    </div>
  ),
  Button: ({
    children,
    type,
    disabled,
    onClick,
    "data-testid": testId,
    ...props
  }: any) => (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      {...props}
    >
      {children}
    </button>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Divider: (props: any) => <hr {...props} />,
  Snackbar: ({ open, message, "data-testid": testId }: any) =>
    open ? <div data-testid={testId}>{message}</div> : null,
}));

describe("OrdersPage", () => {
  const orders: OrderModel[] = [
    {
      id: "1",
      customer: "John Doe",
      items: "Pizza, Soda",
      address: "123 Main Street",
      status: "RECEBIDO",
    },
    {
      id: "2",
      customer: "Jane Doe",
      items: "Burger",
      address: "456 Oak Street",
      status: "ENTREGUE",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the order creation form", async () => {
    render(<OrdersPage />);

    expect(
      screen.getByRole("heading", { name: "Novo Pedido" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("customer")).toBeInTheDocument();
    expect(screen.getByTestId("items")).toBeInTheDocument();
    expect(screen.getByTestId("address")).toBeInTheDocument();
    expect(screen.getByTestId("create-order-button")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/v1/orders`, {
        withCredentials: true,
      });
    });
  });

  it("fetches and displays orders", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: orders });

    render(<OrdersPage />);

    expect(await screen.findByTestId("order-1")).toBeInTheDocument();
    expect(screen.getByTestId("order-1-id")).toHaveTextContent("ID:");
    expect(screen.getByTestId("order-1")).toHaveTextContent("1");
    expect(screen.getByTestId("order-1-customer")).toHaveTextContent(
      "Cliente:",
    );
    expect(screen.getByTestId("order-1")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("order-1")).toHaveTextContent("Pizza, Soda");
    expect(screen.getByTestId("order-1")).toHaveTextContent("123 Main Street");
    expect(screen.getByTestId("order-1-status")).toHaveTextContent("Status:");
    expect(screen.getByTestId("order-1")).toHaveTextContent("RECEBIDO");

    expect(screen.getByTestId("order-2")).toHaveTextContent("Jane Doe");
    expect(screen.getByTestId("order-2")).toHaveTextContent("ENTREGUE");
  });

  it("shows a message when there are no orders", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });

    render(<OrdersPage />);

    expect(await screen.findByTestId("no-orders-found")).toHaveTextContent(
      "No orders found.",
    );
  });

  it("creates an order successfully", async () => {
    const user = userEvent.setup();
    const newOrder: OrderModel = {
      id: "3",
      customer: "Alice",
      items: "Pasta",
      address: "789 Pine Street",
      status: "RECEBIDO",
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: orders });
    vi.mocked(axios.post).mockResolvedValueOnce({ data: newOrder });

    render(<OrdersPage />);

    await screen.findByTestId("order-1");

    await user.type(screen.getByTestId("customer"), "Alice");
    await user.type(screen.getByTestId("items"), "Pasta");
    await user.type(screen.getByTestId("address"), "789 Pine Street");
    await user.click(screen.getByTestId("create-order-button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/v1/orders`,
        {
          customer: "Alice",
          items: "Pasta",
          address: "789 Pine Street",
        },
        { withCredentials: true },
      );
    });

    expect(await screen.findByTestId("order-3")).toBeInTheDocument();
    expect(screen.getByTestId("order-3")).toHaveTextContent("Alice");
    expect(screen.getByTestId("order-3")).toHaveTextContent("Pasta");
    expect(screen.getByTestId("order-3")).toHaveTextContent("789 Pine Street");
    expect(screen.getByTestId("order-3")).toHaveTextContent("RECEBIDO");
  });

  it("shows an error when fetching orders fails", async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error("Network error"));

    render(<OrdersPage />);

    expect(await screen.findByTestId("orders-error")).toHaveTextContent(
      "Failed to fetch orders.",
    );
  });

  it("shows an error when creating an order fails", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("Network error"));

    render(<OrdersPage />);

    await screen.findByTestId("no-orders-found");

    await user.type(screen.getByTestId("customer"), "Alice");
    await user.type(screen.getByTestId("items"), "Pasta");
    await user.type(screen.getByTestId("address"), "789 Pine Street");
    await user.click(screen.getByTestId("create-order-button"));

    expect(await screen.findByTestId("orders-error")).toHaveTextContent(
      "Failed to create order.",
    );
  });

  it("updates an order status successfully", async () => {
    const user = userEvent.setup();
    const updatedOrder: OrderModel = {
      ...orders[0],
      status: "EM_PREPARO",
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: orders });
    vi.mocked(axios.patch).mockResolvedValueOnce({ data: updatedOrder });

    render(<OrdersPage />);

    await screen.findByTestId("order-1");

    await user.click(screen.getByTestId("order-1-move-to-EM_PREPARO"));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/v1/orders/1/status`,
        {},
        {
          withCredentials: true,
          params: { newStatus: "EM_PREPARO" },
        },
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-1")).toHaveTextContent("EM_PREPARO");
    });

    expect(
      screen.getByTestId("order-1-move-to-SAIU_PARA_ENTREGA"),
    ).toBeInTheDocument();
  });

  it("shows an error when updating an order status fails", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.get).mockResolvedValueOnce({ data: orders });
    vi.mocked(axios.patch).mockRejectedValueOnce(new Error("Network error"));

    render(<OrdersPage />);

    await screen.findByTestId("order-1");

    await user.click(screen.getByTestId("order-1-move-to-EM_PREPARO"));

    expect(await screen.findByTestId("orders-error")).toHaveTextContent(
      "Failed to update order status.",
    );
  });

  it("only displays valid status transitions", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: orders });

    render(<OrdersPage />);

    await screen.findByTestId("order-1");

    expect(
      screen.getByTestId("order-1-move-to-EM_PREPARO"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("order-1-move-to-CANCELADO")).toBeInTheDocument();

    expect(
      screen.queryByTestId("order-2-move-to-EM_PREPARO"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("order-2-move-to-CANCELADO"),
    ).not.toBeInTheDocument();
  });
});
