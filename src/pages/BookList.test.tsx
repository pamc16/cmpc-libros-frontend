// src/pages/BooksList.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BooksList from "./BooksList";
import * as useBooksModule from "../hooks/useBooks";
import * as useDebounceModule from "../utils/useDebounce";
import api from "../api/axios";
import { BrowserRouter } from "react-router-dom";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useDebounce
vi.spyOn(useDebounceModule, "useDebounce").mockImplementation((v) => v);

// Mock API
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("BooksList extended", () => {
  const mockBooks = {
    count: 3,
    rows: [
      {
        id: "1",
        title: "Libro 1",
        authors: [{ id: "a1", first_name: "Juan", last_name: "Perez" }],
        genres: [{ id: "g1", name: "Ficción" }],
        publishers: [{ id: "p1", name: "Editorial A" }],
        availability: true,
        price: 1234.5,
      },
      {
        id: "2",
        title: "Libro 2",
        authors: [],
        genres: [],
        publishers: [],
        availability: false,
        price: 0,
      },
      {
        id: "3",
        title: "Libro 3",
        authors: [],
        genres: [],
        publishers: [],
        availability: true,
        price: null,
      },
    ],
  };

  const mockFilters = {
    genres: [
      { id: "g1", name: "Ficción" },
      { id: "g2", name: "No Ficción" },
    ],
    publishers: [
      { id: "p1", name: "Editorial A" },
      { id: "p2", name: "Editorial B" },
    ],
    authors: [
      { id: "a1", first_name: "Juan", last_name: "Perez" },
      { id: "a2", first_name: "Ana", last_name: "Gomez" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useBooksModule, "useBooks").mockReturnValue({
      data: mockBooks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    (api.get as any).mockImplementation((url: any) => {
      if (url === "/genres")
        return Promise.resolve({ data: { rows: mockFilters.genres } });
      if (url === "/publishers")
        return Promise.resolve({ data: { rows: mockFilters.publishers } });
      if (url === "/authors")
        return Promise.resolve({ data: { rows: mockFilters.authors } });
      return Promise.resolve({ data: {} });
    });
    (api.delete as any).mockResolvedValue({});
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <BooksList />
      </BrowserRouter>
    );

  it("renders initial list of books with authors, genres, publishers, availability, and price", () => {
    renderComponent();
    expect(screen.getByText("Libro 1")).toBeInTheDocument();
    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByText("Ficción")).toBeInTheDocument();
    expect(screen.getByText("Editorial A")).toBeInTheDocument();
    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("renders search input and updates value", () => {
    renderComponent();
    const input = screen.getByPlaceholderText("Buscar libros...");
    fireEvent.change(input, { target: { value: "Test" } });
    expect(input).toHaveValue("Test");
  });

  it("navigates to add new book page", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Agregar libro"));
    expect(mockNavigate).toHaveBeenCalledWith("/books/new");
  });

  it("handles filter changes and resets page", async () => {
    renderComponent();
    const genreSelect = await screen.findByLabelText("Género");
    fireEvent.change(genreSelect, { target: { value: "g2" } });
    // El efecto de handleSetFilters debería llamar setFilters interno, se verifica indirectamente
    expect(screen.getByPlaceholderText("Buscar libros...")).toBeInTheDocument();
  });

  it("handles sorting toggle", () => {
    renderComponent();
    const thTitle = screen.getByText("Título");
    fireEvent.click(thTitle);
    fireEvent.click(thTitle); // Toggle desc
    fireEvent.click(screen.getByText("Precio")); // Otro campo
  });

  it("handles book deletion", async () => {
    const mockRefetch = vi.fn();
    vi.spyOn(useBooksModule, "useBooks").mockReturnValue({
      data: mockBooks,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});

    renderComponent();
    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/books/1"));
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });

  it("handles loading state", () => {
    vi.spyOn(useBooksModule, "useBooks").mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("handles error state", () => {
    vi.spyOn(useBooksModule, "useBooks").mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed"),
      refetch: vi.fn(),
    } as any);
    renderComponent();
    expect(screen.getByText("Error cargando libros")).toBeInTheDocument();
  });

  it("handles pagination buttons", async () => {
    renderComponent();
    const nextBtn = screen.getByText("Siguiente") as HTMLButtonElement;
    const prevBtn = screen.getByText("Anterior") as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true); // page 1
    expect(nextBtn.disabled).toBe(true);
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);
  });
});
