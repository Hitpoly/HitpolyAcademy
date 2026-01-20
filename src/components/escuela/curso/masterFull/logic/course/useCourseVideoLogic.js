import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../../../../context/AuthContext";
import { useCourseData } from "./useCourseData";
import { useCourseProgress } from "./useCourseProgress";

const useCourseVideoLogic = (courseId) => {
  const { user } = useAuth();
  const userId = user?.id;

  // 1. Datos y Progreso (Aquí ya recibimos los datos filtrados por el Hook de progreso)
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
    return saved ? parseInt(saved, 10) : null;
  });

  // 3. Lógica de Listado de Videos (Aplanado para navegación y cálculos)
  const allVideos = useMemo(() => {
    return modules.flatMap(m => m.classes || []);
  }, [modules]);

  // Sincronización del video inicial si no hay ninguno guardado
  useEffect(() => {
    if (currentVideoId === null && allVideos.length > 0) {
      setCurrentVideoId(allVideos[0].id);
    }
    if (currentVideoId) {
      localStorage.setItem(`currentVideoId_course_${courseId}`, currentVideoId.toString());
    }
  }, [allVideos, currentVideoId, courseId]);

  // 4. Lógica de Navegación
  const currentVideoIndex = useMemo(() => 
    allVideos.findIndex(v => v.id === currentVideoId), 
  [allVideos, currentVideoId]);
  
  const currentClass = useMemo(() => 
    allVideos[currentVideoIndex] || null, 
  [allVideos, currentVideoIndex]);

  const isFirstVideo = allVideos.length > 0 && currentVideoIndex === 0;
  const isLastVideo = allVideos.length > 0 && currentVideoIndex === allVideos.length - 1;

  const handleVideoChange = useCallback((clase) => {
    setCurrentVideoId(clase.id);
  }, []);

  const navigateToPreviousClass = useCallback(() => {
    if (!isFirstVideo) handleVideoChange(allVideos[currentVideoIndex - 1]);
  }, [isFirstVideo, allVideos, currentVideoIndex, handleVideoChange]);

  const navigateToNextClass = useCallback(() => {
    if (!isLastVideo) handleVideoChange(allVideos[currentVideoIndex + 1]);
  }, [isLastVideo, allVideos, currentVideoIndex, handleVideoChange]);

  // 5. Handlers de completado (Actualización local y API)
  const toggleCompletedVideo = async (claseId) => {
    const isComp = completedVideoIdsLocal.includes(claseId);
    
    // Determinamos si es un registro nuevo (progreso) o actualización (update)
    const accion = userProgressMap[claseId] ? "update" : "progreso";
    const tiempoActual = userProgressMap[claseId]?.tiempo_visto_segundos || 0;

    const success = await registerOrUpdateProgress(claseId, !isComp, tiempoActual, accion);
    
    if (success) {
      // Actualizamos el array de IDs para la barra de progreso
      setCompletedVideoIdsLocal(prev => 
        !isComp ? [...prev, claseId] : prev.filter(id => id !== claseId)
      );
      // Actualizamos el mapa detallado
      setUserProgressMap(prev => ({ 
        ...prev, 
        [claseId]: { ...prev[claseId], completada: !isComp } 
      }));
    }
  };

  // 6. Valores para la UI (ProgressBar y Sidebars)
  // Filtramos los IDs completados para asegurarnos de que pertenecen a las clases cargadas del curso
  const validatedCompletedIds = useMemo(() => {
    const courseClassIds = allVideos.map(v => v.id);
    return completedVideoIdsLocal.filter(id => courseClassIds.includes(id));
  }, [completedVideoIdsLocal, allVideos]);

  return {
    modules, 
    loading, 
    error, 
    currentVideoId, 
    completedVideoIdsLocal: validatedCompletedIds, // Usamos la lista validada
    currentClass,
    currentClassResources: allResources.filter(r => String(r.clase_id) === String(currentVideoId)),
    totalCourseVideos: allVideos.length,
    completedVideosCount: validatedCompletedIds.length,
    handleVideoChange,
    handleVideoEnd: () => currentClass && !completedVideoIdsLocal.includes(currentClass.id) && toggleCompletedVideo(currentClass.id),
    toggleCompletedVideo,
    navigateToPreviousClass,
    navigateToNextClass,
    isFirstVideo,
    isLastVideo,
  };
};

export default useCourseVideoLogic;