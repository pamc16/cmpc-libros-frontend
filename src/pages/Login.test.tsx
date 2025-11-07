// src/pages/Login.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./Login";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

// Mock useAuth
const mockLogin = vi.fn();
vi.mock("../auth/AuthProvider", async () => {
  const actual = await vi.importActual<any>("../auth/AuthProvider");
  return {
    ...actual,
    useAuth: () => ({ login: mockLogin }),
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.alert
vi.spyOn(window, "alert").mockImplementation(() => {});

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<Login />);
  });

  it("renders the form with username and password fields", () => {
    expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar/i })).toBeInTheDocument();
  });

  it("calls login and navigates on valid submission", async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    fireEvent.change(screen.getByLabelText(/Usuario/i), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "pass1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user1", "pass1");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows alert on login failure", async () => {
    const error = { response: { data: { message: "Invalid credentials" } } };
    mockLogin.mockRejectedValueOnce(error);

    fireEvent.change(screen.getByLabelText(/Usuario/i), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user1", "wrong");
      expect(window.alert).toHaveBeenCalledWith("Invalid credentials");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("shows generic alert if error has no response message", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Unknown"));

    fireEvent.change(screen.getByLabelText(/Usuario/i), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("login failed");
    });
  });
});
