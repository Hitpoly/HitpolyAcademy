import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const AuthContext = createContext();
const API_BASE_URL = "https://apiacademy.hitpoly.com/ajax/"; 

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // const navigate = useNavigate(); 

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

  const verifyUserActivity = useCallback(async () => {
    if (isAuthenticated && user && user.id) {
      try {
        const response = await fetch(`${API_BASE_URL}getAllUserController.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accion: "getAllUser" }), 
        });
        const data = await response.json();
        
        if (data && data.status === 'success' && Array.isArray(data.clases)) {
          const currentUserFromApi = data.clases.find(u => u.id === user.id); 

          if (currentUserFromApi) {
            const userCurrentStatus = currentUserFromApi.estado; 

            if (userCurrentStatus === 'Inactivo') {
              logout(); 
              toast.error(
                <div>
                  <p>Tu cuenta ha sido **desactivada**.</p>
                  <p>Por favor, contacta a soporte o reactívala.</p>
                  <button 
                    onClick={() => {
                      window.location.href = '/ofertas'; 
                      toast.dismiss(); 
                    }}
                    style={{ 
                      marginTop: '15px', 
                      padding: '10px 20px', 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px', 
                      cursor: 'pointer',
                      fontSize: '1em'
                    }}
                  >
                    Ir a la página de pago
                  </button>
                </div>,
                {
                  position: "top-center", 
                  autoClose: false, 
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  className: 'toast-inactive-user', 
                }
              );
            } 
          } else {
            logout();
            toast.error(
              <div>
                <p>Tu sesión ha expirado o tu usuario no está disponible.</p>
                <button 
                  onClick={() => {
                    // navigate('/login');
                    window.location.href = '/login';
                    toast.dismiss();
                  }}
                  style={{ 
                    marginTop: '15px', 
                    padding: '10px 20px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    fontSize: '1em'
                  }}
                >
                  Iniciar sesión
                </button>
              </div>,
              {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }
        } 
      } catch (error) {
        // Manejo de errores
      }
    } 
  }, [isAuthenticated, user, logout]);

  useEffect(() => {
    let intervalId;
    if (isAuthenticated && user && user.id) {
      verifyUserActivity(); 
      intervalId = setInterval(verifyUserActivity, 300000); 
    } 

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, user, verifyUserActivity]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userRole, login, logout }}>
      {children}
      <ToastContainer /> 
    </AuthContext.Provider>
  );
};