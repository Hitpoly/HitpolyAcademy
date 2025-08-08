import { useState, useEffect, useCallback } from "react";
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

  const [currentVideoId, setCurrentVideoId] = useState(() => {
    const savedVideoId = localStorage.getItem(
      `currentVideoId_course_${courseId}`
    );
    return savedVideoId ? parseInt(savedVideoId, 10) : null;
  });

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

      try {
        // Cargar Módulos y Clases
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

        if (modulesData.status === "success" && Array.isArray(modulesData.modulos)) {
          const sortedModules = modulesData.modulos.sort((a, b) => a.orden - b.orden);
          const modulesWithClasses = await Promise.all(
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
                if (!classResponse.ok) throw new Error(`HTTP Error: ${classResponse.status}`);
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
                } else {
                  return { ...module, classes: [] };
                }
              } catch (err) {
                return { ...module, classes: [] };
              }
            })
          );
          setModules(modulesWithClasses);

          if (currentVideoId === null && modulesWithClasses.length > 0) {
            const firstModuleWithClasses = modulesWithClasses.find(
              (m) => m.classes && m.classes.length > 0
            );
            if (firstModuleWithClasses) {
              setCurrentVideoId(firstModuleWithClasses.classes[0].id);
            }
          }
        } else {
          setError(
            modulesData.message ||
            "Error al cargar los módulos o formato de datos inesperado."
          );
          setModules([]);
        }

        // Cargar Recursos
        const resourcesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getAllRecursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getRecursos" }),
          }
        );
        if (!resourcesResponse.ok) throw new Error(`HTTP Error: ${resourcesResponse.status}`);
        const resourcesData = await resourcesResponse.json();

        if (
          resourcesData.status === "success" &&
          Array.isArray(resourcesData.recursos)
        ) {
          const formattedResources = resourcesData.recursos.map((resource) => ({
            ...resource,
            fullUrl: resource.url.startsWith("http")
              ? resource.url
              : baseUrl + resource.url,
          }));
          setAllResources(formattedResources);
        } else {
          setAllResources([]);
        }

        // Cargar Progreso del Usuario
        if (userId) {
          const progressResponse = await axios.post(
            "https://apiacademy.hitpoly.com/ajax/getAllProgresoController.php",
            {
              accion: "getProgreso",
              usuario_id: userId,
            }
          );

          if (
            progressResponse.data.status === "success" &&
            Array.isArray(progressResponse.data.progreso)
          ) {
            const progressMap = {};
            const apiCompletedIds = new Set();
            progressResponse.data.progreso.forEach((item) => {
              const claseIdNum = parseInt(item.clase_id, 10);
              const isCompleted = item.completada === "si" || item.completada === true || item.completada === 1;
              progressMap[claseIdNum] = {
                completada: isCompleted,
                tiempo_visto_segundos: parseInt(item.tiempo_visto_segundos, 10),
                ultima_vez_visto: item.ultima_vez_visto,
              };
              if (isCompleted) {
                apiCompletedIds.add(claseIdNum);
              }
            });
            setUserProgressMap(progressMap);
            setCompletedVideoIdsLocal([...apiCompletedIds]);
          } else {
            setUserProgressMap({});
            setCompletedVideoIdsLocal([]);
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

  useEffect(() => {
    if (currentVideoId !== null) {
      localStorage.setItem(`currentVideoId_course_${courseId}`, currentVideoId.toString());
    }
  }, [currentVideoId, courseId]);

  useEffect(() => {
    localStorage.setItem(
      `completedVideoIds_course_${courseId}`,
      JSON.stringify(completedVideoIdsLocal)
    );
  }, [completedVideoIdsLocal, courseId]);

  const getCurrentClass = useCallback(() => {
    for (const module of modules) {
      const foundClass = module.classes?.find((clase) => clase.id === currentVideoId);
      if (foundClass) {
        return foundClass;
      }
    }
    return null;
  }, [modules, currentVideoId]);

  const currentClass = getCurrentClass();

  const currentClassResources = currentVideoId
    ? allResources.filter((resource) => String(resource.clase_id) === String(currentVideoId))
    : [];

  const handleVideoChange = useCallback((clase) => {
    setCurrentVideoId(clase.id);
  }, []);

  const handleVideoEnd = useCallback(async () => {
    if (currentClass) {
      const claseId = currentClass.id;
      const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");

      const hasExistingProgress = !!userProgressMap[claseId];
      
      if (hasExistingProgress) {
        // Si ya existe, actualiza el estado de completado
        const success = await updateClassProgressAPI(claseId, true, userProgressMap[claseId]?.tiempo_visto_segundos || 0);
        if (success) {
          setUserProgressMap((prevMap) => ({
            ...prevMap,
            [claseId]: { ...prevMap[claseId], completada: true, ultima_vez_visto: timeStamp },
          }));
          setCompletedVideoIdsLocal((prev) => (!prev.includes(claseId) ? [...prev, claseId] : prev));
        }
      } else {
        // Si no existe, crea un nuevo registro
        const success = await registerClassProgressAPI(claseId, true, 0);
        if (success) {
          setUserProgressMap((prevMap) => ({
            ...prevMap,
            [claseId]: { completada: true, tiempo_visto_segundos: 0, ultima_vez_visto: timeStamp },
          }));
          setCompletedVideoIdsLocal((prev) => (!prev.includes(claseId) ? [...prev, claseId] : prev));
        }
      }
    }
  }, [currentClass, userProgressMap, updateClassProgressAPI, registerClassProgressAPI]);

  const toggleCompletedVideo = useCallback(
    async (claseId) => {
      const isCurrentlyCompleted = completedVideoIdsLocal.includes(claseId);
      const newCompletedState = !isCurrentlyCompleted;
      const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");

      const hasExistingProgress = !!userProgressMap[claseId];
      
      if (hasExistingProgress) {
        // Si el progreso ya existe, actualiza el registro en la API y el estado local
        const success = await updateClassProgressAPI(claseId, newCompletedState, userProgressMap[claseId]?.tiempo_visto_segundos || 0);
        if (success) {
          setUserProgressMap((prevMap) => ({
            ...prevMap,
            [claseId]: { 
              ...prevMap[claseId], 
              completada: newCompletedState, 
              ultima_vez_visto: timeStamp 
            },
          }));
          setCompletedVideoIdsLocal((prev) => 
            newCompletedState ? [...prev, claseId] : prev.filter((id) => id !== claseId)
          );
        }
      } else {
        // Si no existe, crea un nuevo registro en la API y el estado local
        const success = await registerClassProgressAPI(claseId, newCompletedState, 0);
        if (success) {
          setUserProgressMap((prevMap) => ({
            ...prevMap,
            [claseId]: { 
              completada: newCompletedState, 
              tiempo_visto_segundos: 0, 
              ultima_vez_visto: timeStamp 
            },
          }));
          setCompletedVideoIdsLocal((prev) =>
            newCompletedState ? [...prev, claseId] : prev.filter((id) => id !== claseId)
          );
        }
      }
    },
    [completedVideoIdsLocal, userProgressMap, updateClassProgressAPI, registerClassProgressAPI]
  );

  const totalCourseVideos = modules.reduce(
    (acc, mod) => acc + (mod.classes?.length || 0),
    0
  );

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
  };
};

export default useCourseVideoLogic;