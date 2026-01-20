import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useCourseProgress = (courseId, userId) => {
  const [userProgressMap, setUserProgressMap] = useState({});
  const [completedVideoIdsLocal, setCompletedVideoIdsLocal] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(`completedVideoIds_course_${courseId}`));
    return saved || [];
  });

  const registerOrUpdateProgress = useCallback(async (claseId, completada, tiempo = 0, accion = "progreso") => {
    if (!userId) {
      console.warn("⚠️ [PROGRESS] Intento de registro sin userId");
      return false;
    }
    
    const url = accion === "progreso" 
      ? "https://apiacademy.hitpoly.com/ajax/registrarProgresoClaseController.php"
      : "https://apiacademy.hitpoly.com/ajax/actualizarProgresoController.php";
    
    try {
      const response = await axios.post(url, {
        accion,
        usuario_id: userId,
        clase_id: claseId,
        completada: completada ? 1 : 0,
        tiempo_visto_segundos: Math.max(tiempo || 1, 1),
        ultima_vez_visto: new Date().toISOString().slice(0, 19).replace("T", " "),
      });

      console.log(`🚀 [PROGRESS] API Response (${accion}) para Clase ${claseId}:`, response.data);
      return response.data.status === "success";
    } catch (error) {
      console.error("❌ [PROGRESS] Error en registro/actualización:", error);
      return false;
    }
  }, [userId]);

  useEffect(() => {
    if (userId && courseId) {
      console.log(`%c🔄 [PROGRESS] Cargando datos para Curso: ${courseId} | Usuario: ${userId}`, "color: #3498db; font-weight: bold;");

      axios.post("https://apiacademy.hitpoly.com/ajax/getAllProgresoController.php", {
        accion: "getProgreso",
        usuario_id: userId,
      }).then(res => {
        if (res.data.status === "success" && Array.isArray(res.data.progreso)) {
          const map = {};
          const ids = [];
          
          // 🔥 FILTRADO CRÍTICO: Solo procesamos clases que pertenezcan a este curso
          const progresoFiltrado = res.data.progreso.filter(item => 
            String(item.curso_id) === String(courseId)
          );

          console.log(`%c📥 [PROGRESS] Datos brutos del servidor (Total: ${res.data.progreso.length})`, "color: #95a5a6;");
          console.log(`%c🎯 [PROGRESS] Datos filtrados para Curso ${courseId} (Total: ${progresoFiltrado.length})`, "color: #2ecc71; font-weight: bold;");

          progresoFiltrado.forEach(item => {
            const id = parseInt(item.clase_id, 10);
            const isComp = item.completada === "si" || item.completada === 1 || item.completada === "1";
            
            map[id] = { 
              completada: isComp, 
              tiempo_visto_segundos: parseInt(item.tiempo_visto_segundos || 0, 10) 
            };
            
            if (isComp) ids.push(id);
          });

          setUserProgressMap(map);
          setCompletedVideoIdsLocal(ids);

          console.log(`%c✅ [PROGRESS] Mapeo finalizado para Curso ${courseId}`, "color: #f1c40f;", {
            clasesEncontradas: ids.length,
            idsCompletados: ids
          });
        } else {
          console.error(`❌ [PROGRESS] Error en respuesta de API para curso ${courseId}:`, res.data.message);
        }
      }).catch(err => {
        console.error(`❌ [PROGRESS] Error de red para curso ${courseId}:`, err);
      });
    } else {
      console.warn("⚠️ [PROGRESS] Faltan datos (courseId/userId) para sincronizar progreso.");
    }
  }, [courseId, userId]);

  // Sincronización con LocalStorage individual por curso
  useEffect(() => {
    localStorage.setItem(`completedVideoIds_course_${courseId}`, JSON.stringify(completedVideoIdsLocal));
    
    // Log solo para depuración de guardado
    if (completedVideoIdsLocal.length > 0) {
        console.log(`💾 [PROGRESS] LocalStorage actualizado (Curso ${courseId}):`, completedVideoIdsLocal);
    }
  }, [completedVideoIdsLocal, courseId]);

  return { 
    userProgressMap, 
    setUserProgressMap, 
    completedVideoIdsLocal, 
    setCompletedVideoIdsLocal, 
    registerOrUpdateProgress 
  };
};