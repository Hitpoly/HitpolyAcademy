import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * Componente que sincroniza el estado interno de la Academia con la URL del padre (Holding).
 */
export function ParentUrlSynchronizer() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // 1. Auto-navegación inicial
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Parámetros específicos de la Academia
    const cursoId = searchParams.get('cursoId');
    const categoria = searchParams.get('categoria');
    const route = searchParams.get('route');

    if (location.pathname === '/') {
      if (route) {
        console.log("[ACADEMIA] Auto-navegando por ruta específica:", route);
        navigate(route, { replace: true });
      } else if (cursoId) {
        console.log("[ACADEMIA] Auto-navegando a curso:", cursoId);
        navigate(`/curso/${cursoId}`, { replace: true });
      } else if (categoria) {
        console.log("[ACADEMIA] Auto-navegando a categoría:", categoria);
        navigate(`/cursos/${categoria}`, { replace: true });
      }
    }
  }, []);

  // 2. Sincronización con el padre
  useEffect(() => {
    const messageParams = {};
    const path = location.pathname;
    
    // Detectamos cursoId de varias rutas posibles
    const pathParts = path.split('/');
    if ((pathParts[1] === 'curso' || pathParts[1] === 'master-full') && pathParts[2]) {
      messageParams.cursoId = pathParts[2];
    } else if (pathParts[1] === 'cursos' && pathParts[2]) {
      messageParams.categoria = pathParts[2];
    } else {
      messageParams.cursoId = null;
      messageParams.categoria = null;
    }

    // Sincronizar ruta (Estándar Hitpoly)
    messageParams.route = path !== '/' ? path : null;

    if (window.parent !== window) {
      console.log("🚀 [ACADEMIA] DISPARANDO postMessage al padre:", messageParams);
      window.parent.postMessage({
        type: 'UPDATE_PARENT_URL',
        params: messageParams
      }, '*');
    } else {
      console.log("ℹ️ [ACADEMIA] No se detectó padre (ejecución independiente). Omitiendo postMessage.");
    }
  }, [location.pathname, location.search]);

  return null;
}
