import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Este componente no renderiza nada. 
 * Su función es duplicada:
 * 1. Notificar al Dashboard padre los cambios de ruta (postMessage).
 * 2. Recibir instrucciones de ruta inicial ("Safe Root") para evitar 404s.
 */
const NavigationNotifier = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 🛡️ LÓGICA DE RAÍZ SEGURA: RECIBIR RUTA ---
  useEffect(() => {
    // Leemos si el Holding nos mandó una ruta específica en el parámetro 'route'
    const params = new URLSearchParams(window.location.search);
    const targetRoute = params.get('route');

    // Si hay una ruta y no estamos ya en ella, navegamos internamente
    if (targetRoute && targetRoute !== location.pathname) {
      console.log("🚀 Redirección interna detectada a:", targetRoute);
      navigate(targetRoute, { replace: true });
    }
  }, []); // Solo se ejecuta una vez al cargar la App

  // --- NOTIFICACIÓN AL PADRE: ENVIAR RUTA ---
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    window.parent.postMessage(
      {
        type: "NAVIGATED",
        path: currentPath,
      },
      "*"
    );
  }, [location]);

  return null;
};

export default NavigationNotifier;
