// hooks/useCourseVideoLogic.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext"; // Asegúrate de que esta ruta sea correcta

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

  // Función para registrar un nuevo progreso (primera vez que se ve/completa)
  const registerClassProgressAPI = useCallback(
    async (claseId, completada, tiempoVistoSegundos) => {
      console.log(
        `Hook: Intentando REGISTRAR progreso API para claseId: ${claseId}, completada: ${completada}, tiempo: ${tiempoVistoSegundos}`
      );
      if (!userId) {
        console.error(
          "Hook: No se puede registrar el progreso: ID de usuario no disponible."
        );
        return false;
      }
      try {
        const payload = {
          accion: "progreso",
          usuario_id: userId,
          clase_id: claseId,
          completada: completada ? 1 : 0,
          tiempo_visto_segundos: Math.max(tiempoVistoSegundos || 1, 1),
          ultima_vez_visto: new Date().toISOString().slice(0, 19).replace("T", " "),
        };
        console.log("Hook: Payload para REGISTRAR progreso:", payload);

        const response = await axios.post(
          "https://apiacademy.hitpoly.com/ajax/registrarProgresoClaseController.php",
          payload
        );

        console.log(
          "Hook: Respuesta de registrarProgresoClaseController.php:",
          response.data
        );
        if (response.data.status === "success") {
          console.log("Hook: Progreso registrado exitosamente en la API.");
          return true;
        } else {
          console.error(
            "Hook: Error al registrar progreso en la API:",
            response.data.message
          );
          return false;
        }
      } catch (error) {
        console.error("Hook: Error en la petición de registro de progreso:", error);
        return false;
      }
    },
    [userId]
  );

  // Función para actualizar el progreso de una clase existente
  const updateClassProgressAPI = useCallback(
    async (claseId, completada, tiempoVistoSegundos) => {
      console.log(
        `Hook: Intentando ACTUALIZAR progreso API para claseId: ${claseId}, completada: ${completada}, tiempo: ${tiempoVistoSegundos}`
      );
      if (!userId) {
        console.error(
          "Hook: No se puede actualizar el progreso: ID de usuario no disponible."
        );
        return false;
      }
      try {
        const payload = {
          accion: "update",
          usuario_id: userId,
          clase_id: claseId,
          completada: completada ? 1 : 0,
          tiempo_visto_segundos: Math.max(tiempoVistoSegundos || 1, 1),
          ultima_vez_visto: new Date().toISOString().slice(0, 19).replace("T", " "),
        };

        console.log("📤 Hook: Enviando progreso a la API:", payload);

        const response = await axios.post(
          "https://apiacademy.hitpoly.com/ajax/actualizarProgresoController.php",
          payload
        );

        console.log("📥 Hook: Respuesta del backend:", response.data);

        if (response.data.status === "success") {
          console.log("Hook: Progreso actualizado exitosamente en la API.");
          return true;
        } else {
          console.error(
            "Hook: Error al actualizar progreso en la API:",
            response.data.message
          );
          return false;
        }
      } catch (error) {
        console.error("Hook: Error en la petición de actualización de progreso:", error);
        return false;
      }
    },
    [userId]
  );

  // --- Efectos para cargar datos iniciales (curso y progreso del usuario) ---
  useEffect(() => {
    const fetchDataAndProgress = async () => {
      console.log(
        "Hook: Iniciando fetchDataAndProgress general del curso y progreso..."
      );
      if (!courseId) {
        setError("No se proporcionó un ID de curso.");
        setLoading(false);
        return;
      }

      setLoading(true); // Carga principal del layout
      setError(null);

      try {
        // --- 1. Cargar módulos y clases ---
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
        console.log("Hook: Datos de módulos obtenidos:", modulesData);

        if (modulesData.status === "success" && Array.isArray(modulesData.modulos)) {
          const sortedModules = modulesData.modulos.sort(
            (a, b) => a.orden - b.orden
          );
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
                console.error(
                  `Hook: Error al cargar clases para el módulo ${module.id}:`,
                  err
                );
                return { ...module, classes: [] };
              }
            })
          );
          setModules(modulesWithClasses);
          console.log("Hook: Módulos con clases cargados:", modulesWithClasses);

          // Si currentVideoId es null, establece el primer video como actual
          if (currentVideoId === null && modulesWithClasses.length > 0) {
            const firstModuleWithClasses = modulesWithClasses.find(
              (m) => m.classes && m.classes.length > 0
            );
            if (firstModuleWithClasses) {
              setCurrentVideoId(firstModuleWithClasses.classes[0].id);
              console.log(
                "Hook: Estableciendo el primer video como actual:",
                firstModuleWithClasses.classes[0].id
              );
            }
          }
        } else {
          setError(
            modulesData.message ||
              "Error al cargar los módulos o formato de datos inesperado."
          );
          setModules([]);
        }

        // --- 2. Cargar recursos ---
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
        console.log("Hook: Datos de recursos obtenidos:", resourcesData);

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
          console.log("Hook: Recursos cargados:", formattedResources.length);
        } else {
          setAllResources([]);
        }

        // --- 3. Cargar progreso del usuario (UNA SOLA VEZ AL INICIO) ---
        if (userId) {
          console.log(
            `Hook: Realizando POST a getAllProgresoController.php para usuario_id: ${userId}`
          );
          const progressResponse = await axios.post(
            "https://apiacademy.hitpoly.com/ajax/getAllProgresoController.php",
            {
              accion: "getProgreso",
              usuario_id: userId,
            }
          );
          console.log(
            "Hook: Respuesta de getAllProgresoController.php (para progreso de usuario):",
            progressResponse.data
          );

          if (
            progressResponse.data.status === "success" &&
            Array.isArray(progressResponse.data.progreso)
          ) {
            const progressMap = {};
            const apiCompletedIds = [];
            progressResponse.data.progreso.forEach((item) => {
              const claseIdNum = parseInt(item.clase_id, 10);
              progressMap[claseIdNum] = {
                completada:
                  item.completada === "si" || item.completada === true || item.completada === 1,
                tiempo_visto_segundos: parseInt(item.tiempo_visto_segundos, 10),
                ultima_vez_visto: item.ultima_vez_visto,
              };
              if (progressMap[claseIdNum].completada) {
                apiCompletedIds.push(claseIdNum);
              }
            });
            setUserProgressMap(progressMap);
            setCompletedVideoIdsLocal(apiCompletedIds); // Sincroniza el estado local de VideoList con lo de la API
            console.log(
              "Hook: Progreso del usuario y videos completados cargados desde API."
            );
          } else {
            setUserProgressMap({});
            setCompletedVideoIdsLocal([]);
            console.warn(
              "Hook: No se encontró progreso del usuario o hubo un problema al cargar desde API:",
              progressResponse.data.message
            );
          }
        }
      } catch (err) {
        console.error("Hook: Error general en fetchDataAndProgress:", err);
        setError(`No se pudieron cargar los datos del curso: ${err.message}`);
      } finally {
        setLoading(false);
        console.log("Hook: fetchDataAndProgress general finalizado.");
      }
    };

    fetchDataAndProgress();
  }, [courseId, userId]); // userId es la única dependencia que justifica recargar todo el progreso si cambia

  // Persistencia de currentVideoId en localStorage
  useEffect(() => {
    if (currentVideoId !== null) {
      localStorage.setItem(`currentVideoId_course_${courseId}`, currentVideoId.toString());
      console.log(`Hook: currentVideoId (${currentVideoId}) guardado en localStorage.`);
    }
  }, [currentVideoId, courseId]);

  // Persistencia de completedVideoIdsLocal en localStorage (para VideoList UI)
  useEffect(() => {
    localStorage.setItem(
      `completedVideoIds_course_${courseId}`,
      JSON.stringify(completedVideoIdsLocal)
    );
    console.log(
      `Hook: completedVideoIdsLocal (${completedVideoIdsLocal.length} videos) guardados en localStorage.`
    );
  }, [completedVideoIdsLocal, courseId]);

  const getCurrentClass = useCallback(() => {
    for (const module of modules) {
      const foundClass = module.classes?.find((clase) => clase.id === currentVideoId);
      if (foundClass) {
        console.log("Hook: Clase actual encontrada:", foundClass);
        return foundClass;
      }
    }
    console.log("Hook: Clase actual no encontrada para currentVideoId:", currentVideoId);
    return null;
  }, [modules, currentVideoId]);

  const currentClass = getCurrentClass();

  const currentClassResources = currentVideoId
    ? allResources.filter((resource) => String(resource.clase_id) === String(currentVideoId))
    : [];

  const handleVideoChange = useCallback((clase) => {
    setCurrentVideoId(clase.id);
    console.log("Hook: Cambiando video a:", clase.id);
  }, []);

  const handleVideoEnd = useCallback(async () => {
    if (currentClass) {
      const claseId = currentClass.id;
      const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");
      console.log(`Hook: Video ${claseId} finalizado.`);

      const hasExistingProgress = !!userProgressMap[claseId];

      // Actualiza el estado local de inmediato
      setCompletedVideoIdsLocal((prev) => {
        if (!prev.includes(claseId)) {
          return [...prev, claseId];
        }
        return prev;
      });
      setUserProgressMap((prevMap) => ({
        ...prevMap,
        [claseId]: { completada: true, tiempo_visto_segundos: 0, ultima_vez_visto: timeStamp },
      }));

      // Realiza la llamada a la API en segundo plano
      if (hasExistingProgress) {
        console.log(
          `Hook: Actualizando progreso existente para claseId: ${claseId} (video finalizado) en segundo plano.`
        );
        updateClassProgressAPI(claseId, true, 0);
      } else {
        console.log(
          `Hook: Registrando nuevo progreso para claseId: ${claseId} (video finalizado) en segundo plano.`
        );
        registerClassProgressAPI(claseId, true, 0);
      }
    }
  }, [currentClass, userProgressMap, updateClassProgressAPI, registerClassProgressAPI]);

  const toggleCompletedVideo = useCallback(
    async (claseId) => {
      const isCurrentlyCompleted = completedVideoIdsLocal.includes(claseId);
      const newCompletedState = !isCurrentlyCompleted;
      const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");
      console.log(
        `Hook: Toggleando estado de completado para claseId: ${claseId}. Nuevo estado: ${newCompletedState}`
      );

      const hasExistingProgress = !!userProgressMap[claseId];

      // Actualiza el estado local de inmediato
      setCompletedVideoIdsLocal((prev) =>
        newCompletedState ? [...prev, claseId] : prev.filter((id) => id !== claseId)
      );
      setUserProgressMap((prevMap) => ({
        ...prevMap,
        [claseId]: {
          completada: newCompletedState,
          tiempo_visto_segundos: 0,
          ultima_vez_visto: timeStamp,
        },
      }));

      // Realiza la llamada a la API en segundo plano
      if (hasExistingProgress) {
        console.log(
          `Hook: Actualizando progreso existente para claseId: ${claseId} (toggle) en segundo plano.`
        );
        updateClassProgressAPI(claseId, newCompletedState, 0);
      } else {
        console.log(
          `Hook: Registrando nuevo progreso para claseId: ${claseId} (toggle) en segundo plano.`
        );
        registerClassProgressAPI(claseId, newCompletedState, 0);
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