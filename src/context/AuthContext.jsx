import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const getUserIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("user_id");
    if (id) console.log("🔗 [Bridge] ID recibido del sistema externo:", id);
    return id;
};

const API_URL = "https://apiweb.hitpoly.com/ajax/usuarioMasterController.php";

export const AuthProvider = ({ children }) => {
    const urlUserId = getUserIdFromUrl();
    const storedUserId = localStorage.getItem("userId");

    const [user, setUser] = useState(null);
    // Cambiado a false por defecto para validar primero con la API
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        console.log("🚪 [Auth] Cerrando sesión...");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("userId");
    }, []);

    const loadUserData = useCallback(async (id) => {
        console.log(`📡 [API] Validando ID ${id} contra la Base de Datos Maestra...`);
        setIsLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    funcion: "getUsuario",
                    id_usuario: id,
                }),
            });

            const text = await res.text();
            let data;
            
            try {
                data = JSON.parse(text);
                console.log("📥 [API] Datos recuperados para auditoría:", data);
            } catch (e) {
                console.error("❌ [Error] Error al parsear JSON.");
                throw new Error("JSON inválido");
            }

            if (data.status === "success" && data.user) {
                const userData = {
                    id: id,
                    email: data.user.correo,
                    nombre: data.user.nombre,
                    apellido: data.user.apellido,
                    id_tipo: Number(data.user.id_tipo),
                    id_cargo: Number(data.user.id_cargo),
                    avatar: data.user.avatar,
                };

                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem("userId", id);
                console.log(`✅ [Auth] Acceso concedido: ${userData.nombre} (Tipo: ${userData.id_tipo}, Cargo: ${userData.id_cargo})`);

                if (window.location.href.includes("user_id=")) {
                    const clean = window.location.pathname;
                    window.history.replaceState({}, "", clean);
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error("🔥 [Error] Fallo en la conexión:", error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        const activeId = urlUserId || storedUserId;
        if (!activeId) {
            setIsLoading(false);
            return;
        }
        loadUserData(activeId);
    }, [urlUserId, storedUserId, loadUserData]);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            isLoading, 
            logout,
            userRole: user?.id_tipo, 
            userCargo: user?.id_cargo 
        }}>
            {children}
            <ToastContainer /> 
        </AuthContext.Provider>
    );
};

export default AuthProvider;