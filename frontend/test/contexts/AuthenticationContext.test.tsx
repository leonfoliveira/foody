// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import AuthenticationContext, {
  AuthenticationProvider,
} from "../../src/contexts/AuthenticationContext";
import { API_URL } from "../../src/config";

vi.mock("axios");
vi.mock("@mui/material", () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

const TestConsumer = () => {
  const { loggedInUser, setLoggedInUser } = React.useContext(
    AuthenticationContext,
  );
  return (
    <div>
      <span data-testid="user-name">
        {loggedInUser ? loggedInUser.name : "Not Logged In"}
      </span>
      <button
        onClick={() => setLoggedInUser({ id: "2", name: "Jane Doe" } as any)}
      >
        Update User
      </button>
    </div>
  );
};

describe("AuthenticationProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading state initially and then renders children on successful authentication", async () => {
    const mockUser = { id: "1", name: "John Doe" };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockUser });

    render(
      <AuthenticationProvider>
        <TestConsumer />
      </AuthenticationProvider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    });

    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/v1/users/me`, {
      withCredentials: true,
    });
  });

  it("renders children and sets user to undefined when authentication fails", async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AuthenticationProvider>
        <TestConsumer />
      </AuthenticationProvider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent(
        "Not Logged In",
      );
    });
  });
});
