import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

type User = { id:string; username:string } | null;
type AuthCtx = { user: User; login: (u:string,p:string)=>Promise<void>; logout: ()=>void; token?:string };

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (token && u) setUser(JSON.parse(u));
  }, []);

  const login = async (username:string, password:string) => {
    const res = await api.post('/auth/login', { username, password });
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username }));
    setUser({ id: username, username });
  };
  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
