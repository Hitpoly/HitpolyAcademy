import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";

const baseUrl = "https://apiacademy.hitpoly.com/";

const useCourseVideoLogic = (courseId) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allResources, setAllResources] = useState([]);

  const { user } = useAuth();
  const userId = user?.id;

  // Estado del video actual (Persistido por curso)
  const [currentVideoId, setCurrentVideoId] = useState(() => {
    const savedVideoId = localStorage.getItem(`currentVideoId_course_${courseId}`);
    return savedVideoId ? parseInt(savedVideoId, 10) : null;
  });

  // Estado de videos completados (Persistido por curso)
  const [completedVideoIdsLocal, setCompletedVideoIdsLocal] = useState(() => {
    const savedCompletedVideoIds = JSON.parse(
      localStorage.getItem(`completedVideoIds_course_${courseId}`)
    );
    return savedCompletedVideoIds || [];
  });

  const [userProgressMap, setUserProgressMap] = useState({});

  const registerClassProgressAPI = useCallback(
    async (claseId, completada, tiempoVistoSegundos) => {
      if (!userId) return false;
      try {
        const payload = {
          accion: "progreso",
          usuario_id: userId,
          clase_id: claseId,
          completada: completada ? 1 : 0,
          tiempo_visto_segundos: Math.max(tiempoVistoSegundos || 1, 1),
          ultima_vez_visto: new Date().toISOString().slice(0, 19).replace("T", " "),
        };
        const response = await axios.post(
          "https://apiacademy.hitpoly.com/ajax/registrarProgresoClaseController.php",
          payload
        );
        return response.data.status === "success";
      } catch (error) {
        console.error("Error al registrar el progreso:", error);
        return false;
      }
    },
    [userId]
  );

  const updateClassProgressAPI = useCallback(
    async (claseId, completada, tiempoVistoSegundos) => {
      if (!userId) return false;
      try {
        const payload = {
          accion: "update",
          usuario_id: userId,
          clase_id: claseId,
          completada: completada ? 1 : 0,
          tiempo_visto_segundos: Math.max(tiempoVistoSegundos || 1, 1),
          ultima_vez_visto: new Date().toISOString().slice(0, 19).replace("T", " "),
        };
        const response = await axios.post(
          "https://apiacademy.hitpoly.com/ajax/actualizarProgresoController.php",
          payload
        );
        return response.data.status === "success";
      } catch (error) {
        console.error("Error al actualizar el progreso:", error);
        return false;
      }
    },
    [userId]
  );

  useEffect(() => {
    const fetchDataAndProgress = async () => {
      if (!courseId) {
        setError("No se proporcionó un ID de curso.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      // Limpieza de estados para evitar mezcla de datos entre cursos
      setModules([]);
      setUserProgressMap({});
      // Solo reseteamos el local si no hay nada en localStorage para este curso específico
      const savedLocal = JSON.parse(localStorage.getItem(`completedVideoIds_course_${courseId}`));
      setCompletedVideoIdsLocal(savedLocal || []);

      try {
        // 1. Cargar Módulos y Clases
        const modulesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getModulosPorCursoController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getModulosCurso", id: courseId }),
          }
        );
        if (!modulesResponse.ok) throw new Error(`HTTP Error: ${modulesResponse.status}`);
        const modulesData = await modulesResponse.json();

        let modulesWithClasses = [];

        if (modulesData.status === "success" && Array.isArray(modulesData.modulos)) {
          const sortedModules = modulesData.modulos.sort((a, b) => a.orden - b.orden);
          modulesWithClasses = await Promise.all(
            sortedModules.map(async (module) => {
              try {
                const classResponse = await fetch(
                  "https://apiacademy.hitpoly.com/ajax/traerTodasClasesController.php",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion: "getClases", id: module.id }),
                  }
                );
                const classData = await classResponse.json();
                if (classData.status === "success" && Array.isArray(classData.clases)) {
                  const filteredClasses = classData.clases.filter(
                    (clase) => String(clase.modulo_id) === String(module.id)
                  );
                  const formattedClasses = filteredClasses
                    .map((clase) => ({
                      id: parseInt(clase.id, 10),
                      title: clase.titulo,
                      videoUrl: clase.url_video,
                      progressPanels: clase.paneles_progreso || [],
                      orden: clase.orden,
                      description: clase.descripcion || null,
                    }))
                    .sort((a, b) => a.orden - b.orden);
                  return {
                    id: module.id,
                    title: module.titulo,
                    order: module.orden,
                    classes: formattedClasses,
                  };
                }
                return { ...module, classes: [] };
              } catch (err) {
                return { ...module, classes: [] };
              }
            })
          );
          setModules(modulesWithClasses);

          // Determinar video inicial
          if (currentVideoId === null && modulesWithClasses.length > 0) {
            const firstModuleWithClasses = modulesWithClasses.find(
              (m) => m.classes && m.classes.length > 0
            );
            if (firstModuleWithClasses) {
              setCurrentVideoId(firstModuleWithClasses.classes[0].id);
            }
          }
        }

        // 2. Obtener IDs de todas las clases de ESTE curso para filtrar el progreso
        const currentCourseClassIds = new Set(
          modulesWithClasses.flatMap((m) => m.classes.map((c) => c.id))
        );

        // 3. Cargar Recursos
        const resourcesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getAllRecursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getRecursos" }),
          }
        );
        const resourcesData = await resourcesResponse.json();
        if (resourcesData.status === "success" && Array.isArray(resourcesData.recursos)) {
          setAllResources(resourcesData.recursos.map(r => ({
            ...r,
            fullUrl: r.url.startsWith("http") ? r.url : baseUrl + r.url
          })));
        }

        // 4. Cargar Progreso filtrado por este curso
        if (userId && currentCourseClassIds.size > 0) {
          const progressResponse = await axios.post(
            "https://apiacademy.hitpoly.com/ajax/getAllProgresoController.php",
            { accion: "getProgreso", usuario_id: userId }
          );

          if (progressResponse.data.status === "success" && Array.isArray(progressResponse.data.progreso)) {
            const progressMap = {};
            const apiCompletedIds = new Set();

            progressResponse.data.progreso.forEach((item) => {
              const claseIdNum = parseInt(item.clase_id, 10);
              
              // REGLA DE ORO: Solo procesar si la clase pertenece a este curso
              if (currentCourseClassIds.has(claseIdNum)) {
                const isCompleted = item.completada === "si" || item.completada === true || item.completada === 1;
                progressMap[claseIdNum] = {
                  completada: isCompleted,
                  tiempo_visto_segundos: parseInt(item.tiempo_visto_segundos, 10),
                  ultima_vez_visto: item.ultima_vez_visto,
                };
                if (isCompleted) apiCompletedIds.add(claseIdNum);
              }
            });

            setUserProgressMap(progressMap);
            setCompletedVideoIdsLocal([...apiCompletedIds]);
          }
        }
      } catch (err) {
        setError(`No se pudieron cargar los datos del curso: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndProgress();
  }, [courseId, userId]);

  // Persistencia en LocalStorage por curso
  useEffect(() => {
    if (currentVideoId !== null && courseId) {
      localStorage.setItem(`currentVideoId_course_${courseId}`, currentVideoId.toString());
    }
  }, [currentVideoId, courseId]);

  useEffect(() => {
    if (courseId) {
      localStorage.setItem(
        `completedVideoIds_course_${courseId}`,
        JSON.stringify(completedVideoIdsLocal)
      );
    }
  }, [completedVideoIdsLocal, courseId]);

  const handleVideoChange = useCallback((clase) => {
    setCurrentVideoId(clase.id);
  }, []);

  const getCurrentClass = useCallback(() => {
    for (const module of modules) {
      const foundClass = module.classes?.find((clase) => clase.id === currentVideoId);
      if (foundClass) return foundClass;
    }
    return null;
  }, [modules, currentVideoId]);

  const currentClass = getCurrentClass();

  // Lógica de Navegación
  const allVideos = useMemo(() => modules.flatMap(module => module.classes || []), [modules]);
  
  const currentVideoIndex = useMemo(() => 
    allVideos.findIndex(video => video.id === currentVideoId), 
  [allVideos, currentVideoId]);

  const isFirstVideo = allVideos.length > 0 && currentVideoIndex === 0; 
  const isLastVideo = allVideos.length > 0 && currentVideoIndex === allVideos.length - 1; 

  const navigateToPreviousClass = useCallback(() => {
    if (currentVideoIndex > 0) handleVideoChange(allVideos[currentVideoIndex - 1]);
  }, [currentVideoIndex, allVideos, handleVideoChange]);

  const navigateToNextClass = useCallback(() => {
    if (currentVideoIndex < allVideos.length - 1) handleVideoChange(allVideos[currentVideoIndex + 1]);
  }, [currentVideoIndex, allVideos, handleVideoChange]);

  const currentClassResources = currentVideoId
    ? allResources.filter((resource) => String(resource.clase_id) === String(currentVideoId))
    : [];

  const handleVideoEnd = useCallback(async () => {
    if (currentClass) {
      const claseId = currentClass.id;
      const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");
      const hasExistingProgress = !!userProgressMap[claseId];
      
      const success = hasExistingProgress 
        ? await updateClassProgressAPI(claseId, true, userProgressMap[claseId]?.tiempo_visto_segundos || 0)
        : await registerClassProgressAPI(claseId, true, 0);

      if (success) {
        setUserProgressMap((prev) => ({
          ...prev,
          [claseId]: { ...prev[claseId], completada: true, ultima_vez_visto: timeStamp },
        }));
        setCompletedVideoIdsLocal((prev) => (!prev.includes(claseId) ? [...prev, claseId] : prev));
      }
    }
  }, [currentClass, userProgressMap, updateClassProgressAPI, registerClassProgressAPI]);

  const toggleCompletedVideo = useCallback(
    async (claseId) => {
      const isCurrentlyCompleted = completedVideoIdsLocal.includes(claseId);
      const newCompletedState = !isCurrentlyCompleted;
      const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");
      const hasExistingProgress = !!userProgressMap[claseId];
      
      const success = hasExistingProgress
        ? await updateClassProgressAPI(claseId, newCompletedState, userProgressMap[claseId]?.tiempo_visto_segundos || 0)
        : await registerClassProgressAPI(claseId, newCompletedState, 0);

      if (success) {
        setUserProgressMap((prev) => ({
          ...prev,
          [claseId]: { ...prev[claseId], completada: newCompletedState, ultima_vez_visto: timeStamp },
        }));
        setCompletedVideoIdsLocal((prev) => 
          newCompletedState ? [...prev, claseId] : prev.filter((id) => id !== claseId)
        );
      }
    },
    [completedVideoIdsLocal, userProgressMap, updateClassProgressAPI, registerClassProgressAPI]
  );

  const totalCourseVideos = allVideos.length;
  const completedVideosCount = completedVideoIdsLocal.length;

  return {
    modules,
    loading,
    error,
    currentVideoId,
    completedVideoIdsLocal,
    currentClass,
    currentClassResources,
    totalCourseVideos,
    completedVideosCount,
    handleVideoChange,
    handleVideoEnd,
    toggleCompletedVideo,
    navigateToPreviousClass,
    navigateToNextClass,
    isFirstVideo,
    isLastVideo,
  };
};

export default useCourseVideoLogic;