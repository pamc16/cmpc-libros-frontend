// src/components/BookDetail.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import BookDetail from "./BookDetail";
import api from "../api/axios";
import * as router from "react-router-dom";

// Mock del API
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock de useParams
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>, // simple Link mock
  };
});

describe("BookDetail component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading initially", () => {
    (router.useParams as any).mockReturnValue({ id: "1" });
    (api.get as any).mockResolvedValueOnce({ data: {} });

    render(<BookDetail />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("renders book details when API returns data", async () => {
    (router.useParams as any).mockReturnValue({ id: "1" });

    const mockBook = {
      id: "1",
      title: "Libro Test",
      price: 1234.5,
      availability: true,
      pages: 100,
      description: "Descripción de prueba",
      authors: [{ id: "a1", first_name: "Autor", last_name: "Uno" }],
      genres: [{ id: "g1", name: "Ficción" }],
      publisher: { name: "Editorial X" },
    };

    (api.get as any).mockResolvedValueOnce({ data: mockBook });

    render(<BookDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Libro Test/)).toBeInTheDocument();
      expect(screen.getByText("Autor Uno")).toBeInTheDocument();
      expect(screen.getByText("Ficción")).toBeInTheDocument();
      expect(screen.getByText(/Disponible/)).toBeInTheDocument();
    });
  });

  it('renders "Libro no encontrado" when API returns null', async () => {
    (router.useParams as any).mockReturnValue({ id: "2" });
    (api.get as any).mockRejectedValueOnce(new Error("Not found"));

    render(<BookDetail />);

    await waitFor(() => {
      expect(screen.getByText(/libro no encontrado/i)).toBeInTheDocument();
    });
  });

  it("renders placeholder image if book has no image", async () => {
    (router.useParams as any).mockReturnValue({ id: "3" });

    const mockBook = {
      id: "3",
      title: "Sin Imagen",
      price: null,
      availability: false,
      pages: 50,
      authors: [],
      genres: [],
    };

    (api.get as any).mockResolvedValueOnce({ data: mockBook });

    render(<BookDetail />);

    await waitFor(() => {
      const img = screen.getByRole("img") as HTMLImageElement;
      expect(img.src).toContain("/placeholder.png");
    });
  });
});
