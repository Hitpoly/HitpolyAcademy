import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Inicialización de isAuthenticated
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    return storedAuth;
  });

  // Inicialización de user
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    return parsedUser;
  });

  // *** Nuevo estado para userRole, derivado de 'user' ***
  const userRole = user ? user.id_tipo_usuario : undefined; 
  // Usa 'undefined' o 'null' si no hay usuario o rol, como prefieras.
  // 'undefined' es lo que te aparecía, así que lo mantendremos coherente.


  const login = (userData) => {
    // Este `userData` es el que viene de `LoginForm` y DEBE contener todo
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData)); // Aquí se guarda el objeto completo
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  return (
    // *** ¡Importante! Pasa userRole aquí ***
    <AuthContext.Provider value={{ isAuthenticated, user, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};