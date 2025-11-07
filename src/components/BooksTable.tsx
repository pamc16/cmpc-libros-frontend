import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function BooksTable({
  rows,
  onSort,
  sortBy,
  onDelete,
  deletingIds,
}: any) {
  const header = (field: string, label: string) => (
    <th
      className="cursor-pointer select-none text-left p-3"
      onClick={() => onSort && onSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sortBy?.field === field ? (
          <span className="text-xs">{sortBy.dir === "asc" ? "▲" : "▼"}</span>
        ) : null}
      </div>
    </th>
  );

  const fmtPrice = (p: any) => {
    if (p === null || typeof p === "undefined" || p === "") return "—";
    const n = typeof p === "string" ? parseFloat(p) : Number(p);
    if (Number.isNaN(n)) return String(p);
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            {header("title", "Título")}
            {header("price", "Precio")}
            {header("publisher", "Editorial")}
            {header("authors", "Autores")}
            <th className="p-3 text-left">Géneros</th>
            <th className="p-3 text-left">Disponibilidad</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r: any) => {
            const authorsLabel =
              r.authorsLabel ??
              (Array.isArray(r.authors) && r.authors.length
                ? r.authors
                    .map((a: any) =>
                      `${a.first_name ?? a.name ?? ""} ${
                        a.last_name ?? ""
                      }`.trim()
                    )
                    .join(", ")
                : "—");

            const genresLabel =
              r.genresLabel ??
              (Array.isArray(r.genres) && r.genres.length
                ? r.genres.map((g: any) => g.name).join(", ")
                : "—");

            const publishersLabel =
              r.publishersLabel ??
              (Array.isArray(r.publishers) && r.publishers.length
                ? r.publishers.map((p: any) => p.name).join(", ")
                : "—");

            const publisherName =
              r.publisherSingle?.name ||
              r.publisher?.name ||
              (Array.isArray(r.publishers) && r.publishers[0]?.name) ||
              publishersLabel ||
              "—";

            const isDeleting =
              Array.isArray(deletingIds) && deletingIds.includes(r.id);

            return (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border-t"
              >
                <td className="p-3 align-top">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : ""}
                  </div>
                </td>

                <td className="p-3 align-top">{fmtPrice(r.price)}</td>

                <td className="p-3 align-top">
                  <div className="text-sm">{publisherName}</div>
                </td>

                <td className="p-3 align-top">
                  <div className="text-sm">{authorsLabel}</div>
                </td>

                <td className="p-3 align-top">
                  <div className="text-sm">{genresLabel}</div>
                </td>

                <td className="p-3 align-top">
                  {r.availability ? (
                    <span className="text-green-700">Sí</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </td>

                <td className="p-3 align-top">
                  <Link
                    to={`/books/${r.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/books/${r.id}/edit`}
                    className="ml-3 text-green-600 hover:underline"
                  >
                    Editar
                  </Link>

                  {/* Eliminar */}
                  <button
                    onClick={() => onDelete && onDelete(r.id)}
                    disabled={isDeleting}
                    className={`ml-3 px-2 py-1 text-sm rounded ${
                      isDeleting
                        ? "opacity-50 cursor-not-allowed"
                        : "text-red-600 hover:underline"
                    }`}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
