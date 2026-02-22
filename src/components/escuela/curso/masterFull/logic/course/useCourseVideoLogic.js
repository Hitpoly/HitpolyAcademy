import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../../../../context/AuthContext";
import { useCourseData } from "./useCourseData";
import { useCourseProgress } from "./useCourseProgress";

const useCourseVideoLogic = (courseId) => {
  const { user } = useAuth();
  const userId = user?.id;

  // 1. Datos y Progreso
  const { modules, allResources, loading, error } = useCourseData(courseId);
  const { 
    userProgressMap, 
    setUserProgressMap, 
    completedVideoIdsLocal, 
    setCompletedVideoIdsLocal, 
    registerOrUpdateProgress 
  } = useCourseProgress(courseId, userId);

  // 2. Estado del Video Actual
  const [currentVideoId, setCurrentVideoId] = useState(() => {
    const saved = localStorage.getItem(`currentVideoId_course_${courseId}`);
    // Normalizamos a número desde el inicio
    return saved ? Number(saved) : null;
  });

  // 3. Lógica de Listado de Videos (Aplanado para navegación y cálculos)
  const allVideos = useMemo(() => {
    return modules.flatMap(m => m.classes || []);
  }, [modules]);

  // Sincronización del video inicial si no hay ninguno guardado
  useEffect(() => {
    if (currentVideoId === null && allVideos.length > 0) {
      setCurrentVideoId(Number(allVideos[0].id));
    }
    if (currentVideoId) {
      localStorage.setItem(`currentVideoId_course_${courseId}`, currentVideoId.toString());
    }
  }, [allVideos, currentVideoId, courseId]);

  // 4. Lógica de Navegación (Normalizando IDs para evitar fallos de tipo)
  const currentVideoIndex = useMemo(() => 
    allVideos.findIndex(v => Number(v.id) === Number(currentVideoId)), 
  [allVideos, currentVideoId]);
  
  const currentClass = useMemo(() => 
    allVideos[currentVideoIndex] || null, 
  [allVideos, currentVideoIndex]);

  const isFirstVideo = allVideos.length > 0 && currentVideoIndex === 0;
  const isLastVideo = allVideos.length > 0 && currentVideoIndex === allVideos.length - 1;

  const handleVideoChange = useCallback((clase) => {
    setCurrentVideoId(Number(clase.id));
  }, []);

  const navigateToPreviousClass = useCallback(() => {
    if (!isFirstVideo) handleVideoChange(allVideos[currentVideoIndex - 1]);
  }, [isFirstVideo, allVideos, currentVideoIndex, handleVideoChange]);

  const navigateToNextClass = useCallback(() => {
    if (!isLastVideo) handleVideoChange(allVideos[currentVideoIndex + 1]);
  }, [isLastVideo, allVideos, currentVideoIndex, handleVideoChange]);

  // 5. Handlers de completado (Actualización local y API)
  const toggleCompletedVideo = async (claseId) => {
    const idNum = Number(claseId);
    
    // USAMOS .some() con Number() para asegurar detección
    const isComp = completedVideoIdsLocal.some(id => Number(id) === idNum);
    
    // DETECCIÓN CRÍTICA DE ACCIÓN: 
    // Si la clase ya existe en el mapa del servidor, usamos 'update'. Si no, 'progreso'.
    const accion = userProgressMap[idNum] ? "update" : "progreso";
    const tiempoActual = userProgressMap[idNum]?.tiempo_visto_segundos || 0;

    console.log(`[LOGIC] Intentando ${accion} para clase ${idNum}. Estado actual completado: ${isComp}`);

    const success = await registerOrUpdateProgress(idNum, !isComp, tiempoActual, accion);
    
    if (success) {
      // Actualizamos el array de IDs para la barra de progreso
      setCompletedVideoIdsLocal(prev => 
        !isComp 
          ? [...prev, idNum] 
          : prev.filter(id => Number(id) !== idNum)
      );
      
      // Actualizamos el mapa detallado para que la siguiente vez sepa que ya existe (y use 'update')
      setUserProgressMap(prev => ({ 
        ...prev, 
        [idNum]: { ...prev[idNum], completada: !isComp } 
      }));
    }
  };

  // 6. Valores para la UI (ProgressBar y Sidebars)
  // Blindaje: Aseguramos que los IDs completados realmente existen en este curso y son números
  const validatedCompletedIds = useMemo(() => {
    const courseClassIds = allVideos.map(v => Number(v.id));
    return completedVideoIdsLocal
      .filter(id => courseClassIds.includes(Number(id)))
      .map(id => Number(id));
  }, [completedVideoIdsLocal, allVideos]);

  return {
    modules, 
    loading, 
    error, 
    currentVideoId, 
    completedVideoIdsLocal: validatedCompletedIds, 
    currentClass,
    currentClassResources: allResources.filter(r => Number(r.clase_id) === Number(currentVideoId)),
    totalCourseVideos: allVideos.length,
    completedVideosCount: validatedCompletedIds.length,
    handleVideoChange,
    handleVideoEnd: () => {
      if (currentClass) {
        const idNum = Number(currentClass.id);
        const yaCompletado = validatedCompletedIds.includes(idNum);
        if (!yaCompletado) {
          toggleCompletedVideo(idNum);
        }
      }
    },
    toggleCompletedVideo,
    navigateToPreviousClass,
    navigateToNextClass,
    isFirstVideo,
    isLastVideo,
  };
};

export default useCourseVideoLogic;