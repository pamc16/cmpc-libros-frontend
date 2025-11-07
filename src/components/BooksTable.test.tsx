// src/components/BooksTable.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BooksTable from './BooksTable';
import { MemoryRouter } from 'react-router-dom';

// Datos de prueba
const rows = [
  {
    id: '1',
    title: 'Libro 1',
    price: 1234.5,
    authors: [{ first_name: 'Juan', last_name: 'Perez' }],
    genres: [{ name: 'Ficción' }],
    publishers: [{ name: 'Editorial A' }],
    availability: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Libro 2',
    price: null,
    authors: [],
    genres: [],
    publishers: [],
    availability: false,
  },
];

describe('BooksTable', () => {
  it('renders table headers', () => {
    render(
      <MemoryRouter>
        <BooksTable rows={rows} />
      </MemoryRouter>
    );

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
    expect(screen.getByText('Editorial')).toBeInTheDocument();
    expect(screen.getByText('Autores')).toBeInTheDocument();
    expect(screen.getByText('Géneros')).toBeInTheDocument();
    expect(screen.getByText('Disponibilidad')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  it('renders rows correctly', () => {
    render(
      <MemoryRouter>
        <BooksTable rows={rows} />
      </MemoryRouter>
    );

    // Primer libro
    expect(screen.getByText('Libro 1')).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Ficción')).toBeInTheDocument();
    expect(screen.getByText('Editorial A')).toBeInTheDocument();
    expect(screen.getByText('Sí')).toBeInTheDocument();

    // Segundo libro
    expect(screen.getByText('Libro 2')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onSort when header clicked', () => {
    const onSort = vi.fn();

    render(
      <MemoryRouter>
        <BooksTable rows={rows} onSort={onSort} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Título'));
    expect(onSort).toHaveBeenCalledWith('title');

    fireEvent.click(screen.getByText('Precio'));
    expect(onSort).toHaveBeenCalledWith('price');
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();

    render(
      <MemoryRouter>
        <BooksTable rows={rows} onDelete={onDelete} />
      </MemoryRouter>
    );

    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('disables delete button if id is in deletingIds', () => {
    render(
      <MemoryRouter>
        <BooksTable rows={rows} onDelete={() => {}} deletingIds={['1']} />
      </MemoryRouter>
    );

    const button = screen.getByText('Eliminando...');
    expect(button).toBeDisabled();
  });

  it('renders links correctly', () => {
    render(
      <MemoryRouter>
        <BooksTable rows={rows} />
      </MemoryRouter>
    );

    const verLinks = screen.getAllByText('Ver') as HTMLElement[];
    const editLinks = screen.getAllByText('Editar') as HTMLElement[];

    expect((verLinks[0] as HTMLAnchorElement).href).toContain('/books/1');
    expect((editLinks[0] as HTMLAnchorElement).href).toContain('/books/1/edit');
  });
});
