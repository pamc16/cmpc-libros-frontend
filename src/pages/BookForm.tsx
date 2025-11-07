import React, { useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

const schema = z.object({
  title: z.string().min(1, "Título es requerido"),
  publishers: z.array(z.string().uuid()).optional(),
  pages: z
    .union([
      z.number().int().nonnegative(),
      z.string().regex(/^\d*$/, "Debe ser un número"),
    ])
    .optional()
    .transform((v) =>
      typeof v === "string" && v.length ? parseInt(v, 10) : v
    ),
  price: z
    .union([
      z.number().nonnegative(),
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Formato inválido"),
    ])
    .optional()
    .transform((v) => (typeof v === "string" && v.length ? parseFloat(v) : v)),
  availability: z.boolean().optional(),
  authors: z.array(z.string().uuid()).optional(),
  genres: z.array(z.string().uuid()).optional(),
  image: z.any().optional(),
});

type FormSchema = z.infer<typeof schema>;

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema) as Resolver<FormSchema>,
    defaultValues: { availability: true } as any,
  });

  // Normalizamos ids a string para evitar mismatch number vs string
  const [authorsOptions, setAuthorsOptions] = useState<
    Array<{ id: string; first_name: string; last_name: string }>
  >([]);
  const [genresOptions, setGenresOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [publishersOptions, setPublishersOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  // Cargar options y (si aplica) el libro en paralelo, luego resetear
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const authorsReq = api.get("/authors");
    const genresReq = api.get("/genres");
    const publishersReq = api.get("/publishers");
    const bookReq = id ? api.get(`/books/${id}`) : Promise.resolve(null);

    Promise.all([authorsReq, genresReq, publishersReq, bookReq])
      .then(([aRes, gRes, pRes, bRes]) => {
        if (!mounted) return;

        const authors = (aRes?.data?.rows || []).map((a: any) => ({
          ...a,
          id: String(a.id),
        }));
        const genres = (gRes?.data?.rows || []).map((g: any) => ({
          ...g,
          id: String(g.id),
        }));

        const publishers = (pRes?.data?.rows || []).map((g: any) => ({
          ...g,
          id: String(g.id),
        }));

        setAuthorsOptions(authors);
        setGenresOptions(genres);
        setPublishersOptions(publishers);

        if (bRes && bRes.data) {
          const b = bRes.data;
          // Coercion segura de ids a string
          const authorsIds =
            Array.isArray(b.authors) && b.authors.length
              ? b.authors.map((a: any) => String(a.id ?? a))
              : [];
          const genresIds =
            Array.isArray(b.genres) && b.genres.length
              ? b.genres.map((g: any) => String(g.id ?? g))
              : [];
          const publishersIds =
            Array.isArray(b.publishers) && b.publishers.length
              ? b.publishers.map((g: any) => String(g.id ?? g))
              : [];

          reset({
            title: b.title,
            pages: b.pages ?? undefined,
            price: b.price ?? undefined,
            availability: b.availability ?? true,
            authors: authorsIds,
            genres: genresIds,
            publishers: publishersIds,
          });
        }
      })
      .catch((e) => {
        console.error("Error cargando autores/géneros/libro", e);
        alert("Error cargando datos");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, reset]);

  // Si en algún caso necesitas actualizar manualmente (por ejemplo, la API devuelve nuevos options después),
  // puedes usar setValue para forzar el valor:
  // setValue('authors', ['id1','id2'])

  const onSubmit = async (formData: FormSchema) => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", String(formData.title));
      if (formData.pages !== undefined && formData.pages !== null)
        fd.append("pages", String(formData.pages));
      if (formData.price !== undefined && formData.price !== null)
        fd.append("price", String(formData.price));
      fd.append("availability", String(Boolean(formData.availability)));

      // enviamos arrays de ids (strings)
      fd.append("authors", JSON.stringify(formData.authors ?? []));
      fd.append("genres", JSON.stringify(formData.genres ?? []));
      fd.append("publishers", JSON.stringify(formData.publishers ?? []));

      const file = (formData as any).image[0];
      console.log("file:", file);
      if (file) fd.append("image", file);

      if (id) {
        await api.put(`/books/${id}`, fd);
      } else {
        await api.post("/books", fd);
      }
      navigate("/");
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "Error al guardar libro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow max-w-2xl"
      >
        <h3 className="text-xl mb-4">{id ? "Editar libro" : "Nuevo libro"}</h3>

        <label className="block mb-2">
          Título
          <input {...register("title")} className="input" />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block mb-2">
            Páginas
            <Controller
              name="pages"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  className="input"
                />
              )}
            />
            {errors.pages && (
              <p className="text-sm text-red-600">
                {(errors.pages as any).message}
              </p>
            )}
          </label>

          <label className="block mb-2">
            Precio
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  className="input"
                />
              )}
            />
            {errors.price && (
              <p className="text-sm text-red-600">
                {(errors.price as any).message}
              </p>
            )}
          </label>
        </div>
        <label className="block mb-2 mt-2">
          Disponibilidad
          <div className="mt-1">
            <Controller
              name="availability"
              control={control}
              render={({ field }) => (
                <>
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span className="ml-2">Disponible</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span className="ml-2">No disponible</span>
                  </label>
                </>
              )}
            />
          </div>
        </label>

        <fieldset className="block mb-2 mt-2">
          <legend className="font-medium">Autores</legend>
          <Controller
            name="authors"
            control={control}
            render={({ field }) => {
              const selected: string[] = (field.value ?? []).map(String);
              const toggle = (id: string) => {
                if (selected.includes(id)) {
                  field.onChange(selected.filter((s) => s !== id));
                } else {
                  field.onChange([...selected, id]);
                }
              };
              return (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
                  {authorsOptions.map((a) => (
                    <label key={a.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(a.id)}
                        onChange={() => toggle(a.id)}
                      />
                      <span className="ml-2">
                        {a.first_name} {a.last_name}
                      </span>
                    </label>
                  ))}
                  {authorsOptions.length === 0 && <div>No hay autores</div>}
                </div>
              );
            }}
          />
        </fieldset>

        <fieldset className="block mb-2 mt-2">
          <legend className="font-medium">Géneros</legend>
          <Controller
            name="genres"
            control={control}
            render={({ field }) => {
              const selected: string[] = (field.value ?? []).map(String);
              const toggle = (id: string) => {
                if (selected.includes(id)) {
                  field.onChange(selected.filter((s) => s !== id));
                } else {
                  field.onChange([...selected, id]);
                }
              };
              return (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
                  {genresOptions.map((g) => (
                    <label key={g.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(g.id)}
                        onChange={() => toggle(g.id)}
                      />
                      <span className="ml-2">{g.name}</span>
                    </label>
                  ))}
                  {genresOptions.length === 0 && <div>No hay géneros</div>}
                </div>
              );
            }}
          />
        </fieldset>
        <fieldset className="block mb-2 mt-2">
          <legend className="font-medium">Editorial</legend>
          <Controller
            name="publishers"
            control={control}
            render={({ field }) => {
              const selected: string[] = (field.value ?? []).map(String);
              const toggle = (id: string) => {
                if (selected.includes(id)) {
                  field.onChange(selected.filter((s) => s !== id));
                } else {
                  field.onChange([...selected, id]);
                }
              };
              return (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
                  {publishersOptions.map((g) => (
                    <label key={g.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(g.id)}
                        onChange={() => toggle(g.id)}
                      />
                      <span className="ml-2">{g.name}</span>
                    </label>
                  ))}
                  {publishersOptions.length === 0 && (
                    <div>No hay Editoriales</div>
                  )}
                </div>
              );
            }}
          />
        </fieldset>

        <label className="block mb-2 mt-2">
          Imagen
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                onChange={(e) => field.onChange(e.target.files)}
              />
            )}
          />
        </label>

        <div className="flex gap-2 mt-4">
          <button
            className="btn-primary"
            type="submit"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
