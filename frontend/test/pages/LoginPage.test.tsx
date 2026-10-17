// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../../src/pages/LoginPage";
import AuthenticationContext from "../../src/contexts/AuthenticationContext";
import { API_URL } from "../../src/config";

vi.mock("axios");
vi.mock("@mui/material", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mui/material")>();

  return {
    ...actual,
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
      loading,
      "data-testid": testId,
      ...props
    }: any) => (
      <button
        type={type}
        disabled={disabled || loading}
        data-testid={testId}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    ),
    Snackbar: ({ open, message, "data-testid": testId }: any) =>
      open ? <div data-testid={testId}>{message}</div> : null,
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  const setLoggedInUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders login form correctly", () => {
    render(
      <MemoryRouter>
        <AuthenticationContext.Provider value={{ setLoggedInUser } as any}>
          <LoginPage />
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it("successfully logs in and navigates to root", async () => {
    const mockUser = { id: "1", name: "John Doe" };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUser });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthenticationContext.Provider value={{ setLoggedInUser } as any}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByTestId("email"), "test@example.com");
    await userEvent.type(screen.getByTestId("password"), "password123");
    await userEvent.click(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/v1/users/login`,
        { email: "test@example.com", password: "password123" },
        { withCredentials: true },
      );
    });

    await waitFor(() => {
      expect(setLoggedInUser).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error snackbar when login fails", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(
      new Error("Invalid credentials"),
    );

    render(
      <MemoryRouter>
        <AuthenticationContext.Provider value={{ setLoggedInUser } as any}>
          <LoginPage />
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByTestId("email"), "wrong@example.com");
    await userEvent.type(screen.getByTestId("password"), "wrongpassword");
    await userEvent.click(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(screen.getByTestId("login-error")).toHaveTextContent(
        "Login failed. Please check your credentials and try again.",
      );
    });
  });
});
