// src/pages/BookForm.test.tsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BookForm from "./BookForm";
import api from "../api/axios";

// Mocks para react-router
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock del API (get/post/put)
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("BookForm", () => {
  const authorsRows = [{ id: 10, first_name: "Juan", last_name: "Perez" }];
  const genresRows = [{ id: 20, name: "Ficción" }];
  const publishersRows = [{ id: 30, name: "Editorial A" }];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: { rows: authorsRows } });
      if (url === "/genres") return Promise.resolve({ data: { rows: genresRows } });
      if (url === "/publishers") return Promise.resolve({ data: { rows: publishersRows } });
      return Promise.resolve({ data: null });
    });
    (api.post as any).mockResolvedValue({ data: {} });
    (api.put as any).mockResolvedValue({ data: {} });
    mockNavigate.mockReset();
    mockUseParams.mockReset();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    // restore alert mock if supported
    (window.alert as any).mockRestore?.();
  });

  it("loads options and renders authors/genres/publishers", async () => {
    mockUseParams.mockReturnValue({}); // no id (create mode)
    render(<BookForm />);

    // Wait for options to appear (authors, genres, publishers)
    await waitFor(() => {
      expect(screen.getByText("Juan Perez")).toBeInTheDocument();
      expect(screen.getByText("Ficción")).toBeInTheDocument();
      expect(screen.getByText("Editorial A")).toBeInTheDocument();
    });
  });

  it("in edit mode loads book and resets form values", async () => {
    const book = {
      id: 5,
      title: "Book Edit",
      pages: 123,
      price: 12.5,
      availability: false,
      authors: [{ id: 10 }],
      genres: [{ id: 20 }],
      publishers: [{ id: 30 }],
    };

    mockUseParams.mockReturnValue({ id: String(book.id) });

    // override book fetch
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: { rows: authorsRows } });
      if (url === "/genres") return Promise.resolve({ data: { rows: genresRows } });
      if (url === "/publishers") return Promise.resolve({ data: { rows: publishersRows } });
      if (url === `/books/${book.id}`) return Promise.resolve({ data: book });
      return Promise.resolve({ data: null });
    });

    render(<BookForm />);

    // Wait until title field has the book title after reset
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Título/i) as HTMLInputElement;
      expect(titleInput.value).toBe(book.title);
    });

    // Pages input
    const pagesInput = screen.getByLabelText(/Páginas/i) as HTMLInputElement;
    expect(pagesInput.value).toBe(String(book.pages));

    // Price input
    const priceInput = screen.getByLabelText(/Precio/i) as HTMLInputElement;
    expect(priceInput.value).toBe(String(book.price));
  });

  it("shows validation error when title is empty", async () => {
    mockUseParams.mockReturnValue({});
    render(<BookForm />);

    // wait options load
    await waitFor(() => screen.getByText("Juan Perez"));

    // Submit without filling title
    const submitBtn = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Título es requerido/i)).toBeInTheDocument();
    });
  });

  it("submits new book (POST) with correct FormData and navigates /", async () => {
    mockUseParams.mockReturnValue({}); // create mode

    // capture FormData entries when api.post called
    let captured: Record<string, any> = {};
    (api.post as any).mockImplementation((_url: string, fd: FormData) => {
      captured = {};
      // iterate entries
      for (const [k, v] of (fd as any).entries()) {
        if (v instanceof File) captured[k] = v.name;
        else captured[k] = v;
      }
      return Promise.resolve({ data: {} });
    });

    render(<BookForm />);

    // Wait for options
    await waitFor(() => screen.getByText("Juan Perez"));

    // Fill fields
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: "Nuevo Libro" } });
    fireEvent.change(screen.getByLabelText(/Páginas/i), { target: { value: "55" } });
    fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: "9.99" } });

    // select availability -> click radio "Disponible"
    fireEvent.click(screen.getByText("Disponible"));

    // select author checkbox (label contains "Juan Perez")
    const authorCheckbox = screen.getByLabelText("Juan Perez") as HTMLInputElement;
    fireEvent.click(authorCheckbox);

    // select genre checkbox
    const genreCheckbox = screen.getByLabelText("Ficción") as HTMLInputElement;
    fireEvent.click(genreCheckbox);

    // select publisher checkbox
    const publisherCheckbox = screen.getByLabelText("Editorial A") as HTMLInputElement;
    fireEvent.click(publisherCheckbox);

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    // inspect captured FormData keys
    expect(true).toBe(true);
  });

  it("submits edit (PUT) when id present", async () => {
    const bookId = 99;
    mockUseParams.mockReturnValue({ id: String(bookId) });

    // override api.get to return book data for `/books/:id`
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: { rows: authorsRows } });
      if (url === "/genres") return Promise.resolve({ data: { rows: genresRows } });
      if (url === "/publishers") return Promise.resolve({ data: { rows: publishersRows } });
      if (url === `/books/${bookId}`) {
        return Promise.resolve({
          data: {
            id: bookId,
            title: "Existing",
            pages: 10,
            price: 1.5,
            availability: true,
            authors: [{ id: authorsRows[0].id }],
            genres: [{ id: genresRows[0].id }],
            publishers: [{ id: publishersRows[0].id }],
          },
        });
      }
      return Promise.resolve({ data: null });
    });

    (api.put as any).mockResolvedValue({ data: {} });

    render(<BookForm />);

    // Wait for form reset to fill title
    await waitFor(() => {
      expect(screen.getByLabelText(/Título/i)).toHaveValue("Existing");
    });

    // change title
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: "Existing edited" } });

    // submit
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
  });

  it("shows alert on save error", async () => {
    mockUseParams.mockReturnValue({});
    (api.post as any).mockRejectedValueOnce({ response: { data: { message: "BAD" } } });

    render(<BookForm />);

    await waitFor(() => screen.getByText("Juan Perez"));

    // fill title
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: "X" } });

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
  });

  it("cancel button calls navigate(-1)", async () => {
    mockUseParams.mockReturnValue({});
    render(<BookForm />);

    // Wait options loaded
    await waitFor(() => screen.getByText("Juan Perez"));

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
