import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import BooksList from './pages/BooksList';
import BookForm from './pages/BookForm';
import BookDetail from './pages/BookDetail';
import { useAuth } from './auth/AuthProvider';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/" element={<PrivateRoute><BooksList/></PrivateRoute>} />
      <Route path="/books/new" element={<PrivateRoute><BookForm/></PrivateRoute>} />
      <Route path="/books/:id/edit" element={<PrivateRoute><BookForm/></PrivateRoute>} />
      <Route path="/books/:id" element={<PrivateRoute><BookDetail/></PrivateRoute>} />
    </Routes>
  );
}
