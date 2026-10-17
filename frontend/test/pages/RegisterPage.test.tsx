// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RegisterPage from "../../src/pages/RegisterPage";
import AuthenticationContext from "../../src/contexts/AuthenticationContext";
import { API_URL } from "../../src/config";

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
    "data-testid": testId,
    ...props
  }: any) => (
    <button type={type} disabled={disabled} data-testid={testId} {...props}>
      {children}
    </button>
  ),
  Snackbar: ({ open, message, "data-testid": testId }: any) =>
    open ? <div data-testid={testId}>{message}</div> : null,
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("RegisterPage", () => {
  const setLoggedInUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  function renderRegisterPage() {
    return render(
      <MemoryRouter initialEntries={["/register"]}>
        <AuthenticationContext.Provider value={{ setLoggedInUser } as any}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );
  }

  it("renders the registration form correctly", () => {
    renderRegisterPage();

    expect(
      screen.getByRole("heading", { name: "Registrar" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("name")).toBeInTheDocument();
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("successfully registers and navigates to root", async () => {
    const user = userEvent.setup();
    const mockUser = { id: "1", name: "John Doe", email: "john@example.com" };

    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUser });

    renderRegisterPage();

    await user.type(screen.getByTestId("name"), "John Doe");
    await user.type(screen.getByTestId("email"), "john@example.com");
    await user.type(screen.getByTestId("password"), "password123");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/v1/users/register`,
        {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
        { withCredentials: true },
      );
    });

    await waitFor(() => {
      expect(setLoggedInUser).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error snackbar when registration fails", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.post).mockRejectedValueOnce(
      new Error("Registration failed"),
    );

    renderRegisterPage();

    await user.type(screen.getByTestId("name"), "John Doe");
    await user.type(screen.getByTestId("email"), "john@example.com");
    await user.type(screen.getByTestId("password"), "password123");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByTestId("registration-error")).toHaveTextContent(
      "Registration failed. Please check your details and try again.",
    );

    expect(setLoggedInUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not submit the form when required fields are empty", async () => {
    const user = userEvent.setup();

    renderRegisterPage();

    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("does not submit the form when the email is invalid", async () => {
    const user = userEvent.setup();

    renderRegisterPage();

    await user.type(screen.getByTestId("name"), "John Doe");
    await user.type(screen.getByTestId("email"), "invalid-email");
    await user.type(screen.getByTestId("password"), "password123");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(axios.post).not.toHaveBeenCalled();
  });
});
