import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Este componente no renderiza nada. 
 * Su función es notificar al Dashboard principal (padre) 
 * que la ruta interna del iframe ha cambiado.
 */
const NavigationNotifier = () => {
  const location = useLocation();

  useEffect(() => {
    // Enviamos el mensaje a la ventana padre
    // 'path' incluye la ruta y los parámetros de búsqueda (ej: /clases?id=1)
    const currentPath = location.pathname + location.search;
    
    window.parent.postMessage(
      {
        type: "NAVIGATED",
        path: currentPath,
      },
      "*" // En producción, puedes cambiar "*" por el dominio de tu Dashboard principal
    );
  }, [location]);

  return null;
};

export default NavigationNotifier;