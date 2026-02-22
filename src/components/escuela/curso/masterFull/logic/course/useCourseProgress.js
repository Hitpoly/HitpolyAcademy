import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useCourseProgress = (courseId, userId) => {
  const [userProgressMap, setUserProgressMap] = useState({});
  const [completedVideoIdsLocal, setCompletedVideoIdsLocal] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(`completedVideoIds_course_${courseId}`));
    return saved || [];
  });

  const registerOrUpdateProgress = useCallback(async (claseId, completada, tiempo = 0, accion = "progreso") => {
    if (!userId) return false;

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

      return response.data.status === "success";
    } catch (error) {
      return false;
    }
  }, [userId]);

  useEffect(() => {
    if (userId && courseId) {
      axios.post("https://apiacademy.hitpoly.com/ajax/getAllProgresoController.php", {
        accion: "getProgreso",
        usuario_id: userId,
      }).then(res => {
        if (res.data.status === "success" && Array.isArray(res.data.progreso)) {
          const map = {};
          const ids = [];
          
          const progresoFiltrado = res.data.progreso.filter(item => 
            String(item.curso_id) === String(courseId)
          );

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
        }
      }).catch(() => {
        // Silenciado según lo solicitado
      });
    }
  }, [courseId, userId]);

  useEffect(() => {
    localStorage.setItem(`completedVideoIds_course_${courseId}`, JSON.stringify(completedVideoIdsLocal));
  }, [completedVideoIdsLocal, courseId]);

  return { 
    userProgressMap, 
    setUserProgressMap, 
    completedVideoIdsLocal, 
    setCompletedVideoIdsLocal, 
    registerOrUpdateProgress 
  };
};