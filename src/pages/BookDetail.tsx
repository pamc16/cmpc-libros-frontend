import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((r) => setBook(r.data))
      .catch((e) => {
        console.error('Error al cargar libro:', e);
        setBook(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!book) return <div className="p-6">Libro no encontrado</div>;

  // Helpers
  const formatPrice = (p: any) =>
    p === undefined || p === null ? '—' : Number(p).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const imageUrl =
    // intenta varios campos que podrías usar (ajusta según tu API)
    book.imageUrl || book.image?.url || book.image || '/placeholder.png';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 flex items-start justify-center">
          <img
            src={imageUrl}
            alt={book.title || 'Portada'}
            className="rounded-lg shadow-md max-h-80 object-contain"
            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
          />
        </div>

        <div className="col-span-2">
          <h2 className="text-3xl font-bold">{book.title || 'Sin título'}</h2>

          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {/* Si tienes publisher/publication_date u otros campos, los puedes mostrar aquí */}
            {book.publisher?.name && <span>{book.publisher.name}</span>}
            {book.publication_date && <span>• {book.publication_date}</span>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Páginas</p>
              <p className="text-lg font-semibold">{book.pages ?? '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Precio</p>
              <p className="text-lg font-semibold">${formatPrice(book.price)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Disponibilidad</p>
              <div className="mt-1">
                {book.availability === false ? (
                  <span className="px-2 py-1 rounded-full text-sm bg-red-100 text-red-700">No disponible</span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-700">Disponible</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">ISBN / ID</p>
              <p className="text-sm">{book.id}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Descripción</p>
            <p className="mt-2">{book.description ?? 'Sin descripción'}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Autores</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(book.authors) && book.authors.length > 0 ? (
                book.authors.map((a: any) => (
                  <span key={a.id} className="px-2 py-1 rounded bg-gray-100 text-sm">
                    {a.first_name ? `${a.first_name} ${a.last_name ?? ''}` : a.name ?? a.id}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">Sin autores</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Géneros</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(book.genres) && book.genres.length > 0 ? (
                book.genres.map((g: any) => (
                  <span key={g.id} className="px-2 py-1 rounded bg-gray-100 text-sm">
                    {g.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">Sin géneros</span>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Link to={`/books/${book.id}/edit`} className="btn">
              Editar
            </Link>
            <Link to="/" className="btn">
              Volver
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
