import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import { signInWithGoogle, firebaseSignOut } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('tf_user');
    const storedToken = localStorage.getItem('tf_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('tf_user');
        localStorage.removeItem('tf_token');
      }
    }
    setLoading(false);
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem('tf_token', token);
    localStorage.setItem('tf_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    persistSession(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    persistSession(data.token, data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const firebaseResult = await signInWithGoogle();
    const { data } = await authAPI.googleAuth(firebaseResult.idToken);
    persistSession(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch {
    }
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
