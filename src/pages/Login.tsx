import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });
type Form = z.infer<typeof schema>;

export default function Login(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data:Form) => {
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (e:any) {
      alert(e?.response?.data?.message || 'login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-pink-500">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-md w-[420px]">
        <h2 className="text-2xl font-bold mb-4">Ingresar — CMPC Libros</h2>
        <label className="block mb-2">Usuario
          <input {...register('username')} className="input" />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        </label>
        <label className="block mb-2">Contraseña
          <input {...register('password')} type="password" className="input" />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </label>
        <button className="mt-4 w-full py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition">Entrar</button>
      </form>
    </div>
  );
}
