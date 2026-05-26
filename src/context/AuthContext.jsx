import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const jwtDecode = (token) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.data;
    } catch (e) {
        return null;
    }
};

const getAuthDataFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        userId: params.get("user_id") || params.get("userId"),
        token: params.get("token") || params.get("jwt")
    };
};

const API_URL = "https://apiweb.hitpoly.com/ajax/usuarioMasterController.php";

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("userId");
    }, []);

    const loadUserData = useCallback(async (id) => {
        setIsLoading(true);
        try {
            // 1. Intentar cargar metadatos del Holding
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
            try { data = JSON.parse(text); } catch (e) { throw new Error("JSON inválido"); }

            if (data.status === "success" && data.user) {
                const newUser = {
                    id: id,
                    email: data.user.correo,
                    nombre: data.user.nombre,
                    avatar: data.user.avatar,
                    id_tipo: data.user.id_tipo || 3, // Default to student
                    id_cargo: data.user.id_cargo || null
                };
                setUser(newUser);
                setIsAuthenticated(true);
                localStorage.setItem("userId", id);
            } else {
                throw new Error("Usuario no encontrado");
            }
        } catch (error) {
            console.warn("[ACADEMY_AUTH] ⚠️ Perfil básico cargado (CORS o No Encontrado)");
            setUser({ id: id, name: "Usuario Holding", email: "", avatar: null, id_tipo: 3 });
            setIsAuthenticated(true);
            localStorage.setItem("userId", id);
        }

        // 2. REGISTRO OBLIGATORIO DE SESIÓN
        try {
            const resVin = await fetch("https://apiacademy.hitpoly.com/ajax/vinculacionAcademyController.php?action=ingreso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: id }),
            });
            const dataVin = await resVin.json();
            if (dataVin.success) {
                setSessionId(dataVin.session_id);
            }
        } catch (err) {
            console.error("[ACADEMY_VINCULACION] ❌ Error en tracking:", err);
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        const { userId: urlUserId, token: urlToken } = getAuthDataFromUrl();
        const storedUserId = localStorage.getItem("userId");
        const storedToken = localStorage.getItem("jwt_token");

        // Caso 1: Token en URL (Login instantáneo)
        if (urlToken) {
            const decoded = jwtDecode(urlToken);
            if (decoded) {
                console.info(`[AUTH] ✅ Acceso instantáneo concedido a la Academia para: ${decoded.nombre || 'Usuario'}`);
                localStorage.setItem("jwt_token", urlToken);
                const userIdFromToken = decoded.user_id || decoded.id;
                
                const newUser = {
                    id: userIdFromToken,
                    email: decoded.email || decoded.correo,
                    nombre: decoded.nombre,
                    avatar: decoded.avatar,
                    id_tipo: decoded.id_tipo || 3,
                    id_cargo: decoded.id_cargo || null
                };

                setUser(newUser);
                setIsAuthenticated(true);
                localStorage.setItem("userId", userIdFromToken);

                // Limpiar URL
                const params = new URLSearchParams(window.location.search);
                params.delete("token");
                params.delete("jwt");
                params.delete("userId");
                params.delete("user_id");
                const newSearch = params.toString();
                window.history.replaceState({}, "", window.location.pathname + (newSearch ? "?" + newSearch : ""));
                
                setIsLoading(false);
                loadUserData(userIdFromToken); // Recargar datos completos en background si es necesario
                return;
            }
        }

        const activeId = urlUserId || storedUserId;
        if (!activeId) {
            setIsLoading(false);
            return;
        }
        loadUserData(activeId);
    }, [loadUserData]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (sessionId) {
                const data = JSON.stringify({ session_id: sessionId });
                navigator.sendBeacon(`https://apiacademy.hitpoly.com/ajax/vinculacionAcademyController.php?action=salida`, data);
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [sessionId]);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            isLoading, 
            logout,
            userRole: user?.id_tipo, 
            userCargo: user?.id_cargo,
            sessionId
        }}>
            {children}
            <ToastContainer /> 
        </AuthContext.Provider>
    );
};

export default AuthProvider;