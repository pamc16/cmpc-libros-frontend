// src/components/FiltersPanel.tsx
import React from "react";

export default function FiltersPanel({
  filters,
  setFilters,
  genres,
  publishers,
  authors,
}: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex gap-4 items-end">
      <div>
        <label className="text-sm" htmlFor="genre">
          Género
        </label>
        <select
          id="genre"
          value={filters.genre || ""}
          onChange={(e) =>
            setFilters({ ...filters, genre: e.target.value || undefined })
          }
        >
          <option value="">Todos</option>
          {genres.map((g: any) => (
            <option value={g.id} key={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm" htmlFor="publisher">
          Editorial
        </label>
        <select
          id="publisher"
          value={filters.publisher || ""}
          onChange={(e) =>
            setFilters({ ...filters, publisher: e.target.value || undefined })
          }
        >
          <option value="">Todas</option>
          {publishers.map((p: any) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm" htmlFor="author">
          Autor
        </label>
        <select
          id="author"
          value={filters.author || ""}
          onChange={(e) =>
            setFilters({ ...filters, author: e.target.value || undefined })
          }
        >
          <option value="">Todos</option>
          {authors.map((a: any) => (
            <option value={a.id} key={a.id}>
              {a.first_name} {a.last_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm" htmlFor="availability">
          Disponibilidad
        </label>
        <select
          id="availability"
          value={filters.availability ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              availability:
                e.target.value === "" ? undefined : e.target.value === "true",
            })
          }
        >
          <option value="">Todos</option>
          <option value="true">Disponible</option>
          <option value="false">No disponible</option>
        </select>
      </div>
    </div>
  );
}
