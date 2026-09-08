import { createContext, useState, useContext, useEffect, useRef } from 'react';
import authService from '../services/auth/auth.service';

const AuthContext = createContext();

const DASHBOARD_ROUTES = {
  admin: '/admin',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

const isPortalTab = () => sessionStorage.getItem('isAdminAccess') === 'true';

const getStoredAuth = () => {
  const storage = isPortalTab() ? sessionStorage : localStorage;
  return {
    accessToken: storage.getItem('accessToken'),
    refreshToken: storage.getItem('refreshToken'),
    user: storage.getItem('user'),
    role: storage.getItem('role'),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inactiveError, setInactiveError] = useState('');
  const loggedInRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const storage = isPortalTab() ? sessionStorage : localStorage;

      const autoLogout = storage.getItem('autoLogout') === 'true';
      if (autoLogout) {
        storage.removeItem('accessToken');
        storage.removeItem('refreshToken');
        storage.removeItem('user');
        storage.removeItem('role');
        if (mounted) setLoading(false);
        setInactiveError('');
        return;
      }

      const accessToken = storage.getItem('accessToken');
      if (!accessToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (!mounted || loggedInRef.current) return;
        setUser(response.user);
        setRole(response.user.role);
      } catch (error) {
        if (!mounted || loggedInRef.current) return;
        console.error('Session validation failed:', error);
        setUser(null);
        setRole(null);
        storage.removeItem('accessToken');
        storage.removeItem('refreshToken');
        storage.removeItem('user');
        storage.removeItem('role');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;

    const watchAuthChanges = () => {
      const { accessToken, user: userStr, role: roleStr } = getStoredAuth();
      const parsedUser = userStr ? JSON.parse(userStr) : null;

      if (!accessToken || !parsedUser || !roleStr) {
        if (mounted) {
          setUser(null);
          setRole(null);
          setInactiveError('');
        }
      }
    };

    watchAuthChanges();

    const handleStorage = (e) => {
      if (e.key === 'accessToken' || e.key === 'user' || e.key === 'role') {
        watchAuthChanges();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = (userData, userRole, accessToken, refreshToken) => {
    loggedInRef.current = true;
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    setInactiveError('');
  };

  const logout = async () => {
    const storage = isPortalTab() ? sessionStorage : localStorage;
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      setRole(null);
      storage.removeItem('accessToken');
      storage.removeItem('refreshToken');
      storage.removeItem('user');
      storage.removeItem('role');
      storage.removeItem('isAdminAccess');
      setInactiveError('');
      setLoading(false);
    }
  };

  const setInactiveAccountError = (message) => {
    setInactiveError(message);
  };

  const clearInactiveAccountError = () => {
    setInactiveError('');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, inactiveError, setInactiveAccountError, clearInactiveAccountError, login, logout, DASHBOARD_ROUTES }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
