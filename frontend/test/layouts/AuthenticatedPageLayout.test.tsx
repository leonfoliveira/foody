// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuthenticatedPageLayout from "../../src/layouts/AuthenticatedPageLayout";
import AuthenticationContext from "../../src/contexts/AuthenticationContext";
import { API_URL } from "../../src/config";

vi.mock("axios");
vi.mock("@mui/material", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Snackbar: ({ open, message }: { open: boolean; message?: string }) =>
    open ? <div data-testid="snackbar">{message}</div> : null,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AuthenticatedPageLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects to /login when loggedInUser is undefined", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthenticationContext.Provider
          value={{ loggedInUser: undefined, setLoggedInUser: () => {} }}
        >
          <Routes>
            <Route path="/dashboard" element={<AuthenticatedPageLayout />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders user name and children when loggedInUser is present", () => {
    const mockUser = { id: "1", name: "John Doe" };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthenticationContext.Provider
          value={{ loggedInUser: mockUser as any, setLoggedInUser: () => {} }}
        >
          <Routes>
            <Route path="/dashboard" element={<AuthenticatedPageLayout />}>
              <Route index element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Olá, John Doe")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });

  it("calls logout API and navigates to /login on success", async () => {
    const mockUser = { id: "1", name: "John Doe" };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthenticationContext.Provider
          value={{ loggedInUser: mockUser as any, setLoggedInUser: () => {} }}
        >
          <Routes>
            <Route path="/dashboard" element={<AuthenticatedPageLayout />} />
          </Routes>
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );

    const logoutButton = screen.getByRole("button", { name: /sair/i });
    logoutButton.click();

    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/v1/users/logout`,
      {},
      { withCredentials: true },
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error snackbar when logout fails", async () => {
    const mockUser = { id: "1", name: "John Doe" };
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("Logout failed"));

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthenticationContext.Provider
          value={{ loggedInUser: mockUser as any, setLoggedInUser: () => {} }}
        >
          <Routes>
            <Route path="/dashboard" element={<AuthenticatedPageLayout />} />
          </Routes>
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    );

    const logoutButton = screen.getByRole("button", { name: /sair/i });
    logoutButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("snackbar")).toHaveTextContent(
        "Failed to logout.",
      );
    });
  });
});
