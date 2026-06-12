import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getProfile } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((res) => setUser(res.data || res))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    setUser(res.data?.user || res.user);
    return res;
  };

  const register = async (data) => {
    const res = await registerUser(data);
    return res;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore API errors — always clear local state
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
