// src/components/FiltersPanel.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FiltersPanel from "./FiltersPanel";

const genres = [
  { id: "g1", name: "Ficción" },
  { id: "g2", name: "No Ficción" },
];

const publishers = [
  { id: "p1", name: "Editorial A" },
  { id: "p2", name: "Editorial B" },
];

const authors = [
  { id: "a1", first_name: "Juan", last_name: "Perez" },
  { id: "a2", first_name: "Ana", last_name: "Gomez" },
];

describe("FiltersPanel", () => {
  let filters: any;
  let setFilters: any;

  beforeEach(() => {
    filters = {};
    setFilters = vi.fn();
    render(
      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        genres={genres}
        publishers={publishers}
        authors={authors}
      />
    );
  });

  it("renders all filter selects", () => {
    expect(screen.getByLabelText("Género")).toBeInTheDocument();
    expect(screen.getByLabelText("Editorial")).toBeInTheDocument();
    expect(screen.getByLabelText("Autor")).toBeInTheDocument();
    expect(screen.getByLabelText("Disponibilidad")).toBeInTheDocument();
  });

  it("renders genre options correctly", () => {
    const genreSelect = screen.getByLabelText("Género") as HTMLSelectElement;
    expect(genreSelect.options.length).toBe(3); // Todos + 2 géneros
    expect(genreSelect.options[1].text).toBe("Ficción");
    expect(genreSelect.options[2].text).toBe("No Ficción");
  });

  it("calls setFilters on availability change to true", () => {
    const availabilitySelect = screen.getByLabelText("Disponibilidad");
    fireEvent.change(availabilitySelect, { target: { value: "true" } });
    expect(setFilters).toHaveBeenCalledWith({ ...filters, availability: true });
  });

  it("calls setFilters on availability change to false", () => {
    const availabilitySelect = screen.getByLabelText("Disponibilidad");
    fireEvent.change(availabilitySelect, { target: { value: "false" } });
    expect(setFilters).toHaveBeenCalledWith({
      ...filters,
      availability: false,
    });
  });

  it("calls setFilters on availability change to empty", () => {
    const availabilitySelect = screen.getByLabelText("Disponibilidad");
    fireEvent.change(availabilitySelect, { target: { value: "" } });
    expect(setFilters).toHaveBeenCalledWith({
      ...filters,
      availability: undefined,
    });
  });
});
