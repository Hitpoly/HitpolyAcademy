import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    return storedAuth;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    return parsedUser;
  });

  const userRole = user ? user.id_tipo_usuario : undefined;
  
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};