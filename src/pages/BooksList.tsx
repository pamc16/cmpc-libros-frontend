import React, { useState, useMemo, useEffect } from "react";
import { useBooks } from "../hooks/useBooks";
import { useDebounce } from "../utils/useDebounce";
import FiltersPanel from "../components/FiltersPanel";
import BooksTable from "../components/BooksTable";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function BooksList() {
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sortBy, setSortBy] = useState<any>(null); // { field: string, dir: 'asc'|'desc' }
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const navigate = useNavigate();

  // Opciones para los filtros (ahora se cargan desde la API)
  const [genres, setGenres] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [optsLoading, setOptsLoading] = useState(true);
  const [optsError, setOptsError] = useState<any>(null);

  // Estado para borrados en progreso (ids)
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Cargar opciones una vez
  useEffect(() => {
    let mounted = true;
    setOptsLoading(true);
    Promise.all([
      api.get("/genres"),
      api.get("/publishers"),
      api.get("/authors"),
    ])
      .then(([gRes, pRes, aRes]) => {
        if (!mounted) return;
        setGenres(
          (gRes?.data?.rows || []).map((x: any) => ({ ...x, id: String(x.id) }))
        );
        setPublishers(
          (pRes?.data?.rows || []).map((x: any) => ({ ...x, id: String(x.id) }))
        );
        setAuthors(
          (aRes?.data?.rows || []).map((x: any) => ({ ...x, id: String(x.id) }))
        );
      })
      .catch((err) => {
        console.error("Error cargando opciones de filtros", err);
        if (mounted) setOptsError(err);
      })
      .finally(() => mounted && setOptsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Reset page when query or filters change
  useEffect(() => {
    setPage(1);
  }, [dq, JSON.stringify(filters)]); // stringify para detectar cambios deep

  // Construye params
  const params = useMemo(() => {
    const p: Record<string, any> = { page, limit };
    if (dq) p.title = dq;
    if (filters.genre) p.genre = filters.genre;
    if (filters.publisher) p.publisher = filters.publisher;
    if (filters.author) p.author = filters.author;
    if (filters.availability !== undefined && filters.availability !== null)
      p.availability = filters.availability;
    if (sortBy?.field) p.sort = `${sortBy.field}:${sortBy.dir}`;
    return p;
  }, [dq, page, limit, JSON.stringify(filters), sortBy]);

  // Hook que hace la petición (tu useBooks)
  const { data, isLoading, error, refetch } = useBooks(params);

  // Mapear rows para añadir campos de presentación (authorsLabel, genresLabel, publishersLabel)
  const rows = useMemo(() => {
    const raw = data?.rows ?? [];
    return raw.map((r: any) => {
      const authorsArr: any[] = Array.isArray(r.authors) ? r.authors : [];
      const genresArr: any[] = Array.isArray(r.genres) ? r.genres : [];
      const publishersArr: any[] = Array.isArray(r.publishers)
        ? r.publishers
        : [];

      const authorsLabel = authorsArr.length
        ? authorsArr
            .map((a) =>
              `${a.first_name ?? a.name ?? ""} ${a.last_name ?? ""}`.trim()
            )
            .join(", ")
        : "—";

      const genresLabel = genresArr.length
        ? genresArr.map((g) => g.name).join(", ")
        : "—";

      // publishers may be empty or contain objects; join names
      const publishersLabel = publishersArr.length
        ? publishersArr.map((p) => p.name).join(", ")
        : "—";

      const publisherSingle =
        publishersArr.length === 1 ? publishersArr[0] : null;

      return {
        ...r,
        authors: authorsArr,
        genres: genresArr,
        publishers: publishersArr,
        authorsLabel,
        genresLabel,
        publishersLabel,
        publisherSingle,
      };
    });
  }, [data]);

  // sort toggle handler
  const handleSort = (field: any) => {
    setPage(1);
    setSortBy((prev: any) => {
      if (!prev || prev.field !== field) return { field, dir: "asc" };
      return { field, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  // Al cambiar filtros desde FiltersPanel
  const handleSetFilters = (newFilters: any) => {
    setFilters((prev: any) => ({ ...(prev || {}), ...(newFilters || {}) }));
    setPage(1);
  };

  // ======== NUEVO: eliminar libro ========
  const handleDelete = async (id: string) => {
    const ok = window.confirm("¿Seguro que quieres eliminar este libro?");
    if (!ok) return;
    try {
      setDeletingIds((s) => [...s, id]);
      await api.delete(`/books/${id}`);
      // opcional: mostrar notificación
      alert("Libro eliminado");
      // recargar lista (refetch viene de useBooks)
      await refetch();
      // si al eliminar la página quedó vacía y page>1, bajar página
      const remaining = (data?.count ?? 0) - 1;
      const maxPage = Math.max(1, Math.ceil(remaining / limit));
      if (page > maxPage) setPage(maxPage);
    } catch (err: any) {
      console.error("Error eliminando libro", err);
      alert(err?.response?.data?.message || "Error eliminando libro");
    } finally {
      setDeletingIds((s) => s.filter((x) => x !== id));
    }
  };
  // ==========================================

  const total = data?.count ?? 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar libros..."
          className="input w-80"
        />
        <div>
          <button
            onClick={() => navigate("/books/new")}
            className="btn-primary"
          >
            Agregar libro
          </button>
        </div>
      </div>

      <FiltersPanel
        filters={filters}
        setFilters={handleSetFilters}
        genres={genres}
        publishers={publishers}
        authors={authors}
        loading={optsLoading}
        error={optsError}
      />

      <div className="mt-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error cargando libros</div>
        ) : (
          <>
            {/* Pasamos rows normalizados a BooksTable */}
            <BooksTable
              rows={rows}
              onSort={(field: any) => handleSort(field)}
              sortBy={sortBy}
              onDelete={handleDelete}
              deletingIds={deletingIds}
            />

            <div className="flex justify-between items-center mt-4">
              <div>
                Mostrando {(page - 1) * limit + 1}–
                {Math.min(page * limit, total)} de {total}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn"
                >
                  Anterior
                </button>

                <span>{page}</span>

                <button
                  disabled={total === 0 || page * limit >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
