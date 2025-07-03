// useClassFormLogic.js
import { useState, useEffect, useRef } from "react";
import { convertSecondsToUnits } from "./utils";
import useResourceLogic from "./useResourceLogic";

// --- ¡CAMBIO AQUÍ! ---
// Define la base URL aquí, tal como en tu archivo HTML
const BASE_API_URL = "https://apiacademy.hitpoly.com/";

const useClassFormLogic = (
  moduleId,
  classToEdit,
  onClassSaved,
  existingClassOrders = []
) => {
  const initialFormState = {
    titulo: "",
    descripcion: "",
    url_video: "",
    duracion_valor: "",
    orden: "",
    tipo_clase: "video",
    es_gratis_vista_previa: false,
    recursos: [], // Asegúrate de que 'recursos' siempre sea un array en el estado inicial por defecto
  };

  // 1. Inicialización de formData: Se ejecuta solo en el primer renderizado o cuando classToEdit cambia.
  const [formData, setFormData] = useState(() => {
    if (classToEdit) {
      // Si estamos editando, usa classToEdit, pero asegura que 'recursos' sea un array inicialmente
      // Los recursos reales se cargarán en el useEffect de abajo
      return {
        ...classToEdit,
        recursos: classToEdit.recursos || [],
      };
    }
    return initialFormState;
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({
    type: "",
    message: "",
  });
  const [durationUnit, setDurationUnit] = useState("segundos");

  // initialFormDataRef para comparar cambios. Se inicializa de forma más robusta en los useEffect.
  const initialFormDataRef = useRef(null);

  // Usa el nuevo hook para la lógica de recursos
  const {
    resources,
    setResources: setResourcesInLogic, // Renombré setResources para evitar conflicto con el estado global
    newResourceTitle,
    setNewResourceTitle,
    newResourceFile,
    setNewResourceFile,
    newResourceUrl,
    setNewResourceUrl,
    newResourceType,
    setNewResourceType,
    deletedResourceIds,
    setDeletedResourceIds,
    handleAddResource: handleAddResourceFromLogic, // Renombrado para evitar conflicto
    handleDeleteResource: handleDeleteResourceFromLogic, // Renombrado
    handleFileChange: handleFileChangeFromLogic, // Renombrado
    resourceResponseMessage,
    setResourceResponseMessage,
  } = useResourceLogic(setResponseMessage); // Pasa setResponseMessage para que useResourceLogic pueda actualizar los mensajes globales

  // --- Primer useEffect: Para inicializar el formulario y los recursos al cargar/cambiar classToEdit ---
  useEffect(() => {
    console.log("useEffect [classToEdit] - classToEdit:", classToEdit); // LOG
    if (classToEdit) {
      // Si estamos en modo edición
      const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);

      const newFormData = {
        titulo: classToEdit.titulo || "",
        descripcion: classToEdit.descripcion || "",
        url_video: classToEdit.url_video || "",
        duracion_valor: value,
        orden: classToEdit.orden || "",
        tipo_clase: classToEdit.tipo_clase || "video",
        es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1,
        recursos: [], // Temporalmente vacío, se llenará con fetchResourcesForClass
      };
      setFormData(newFormData);
      setDurationUnit(unit);

      // Llama a la función para cargar los recursos desde la API
      fetchResourcesForClass(classToEdit.id);
      setDeletedResourceIds([]); // Limpiar eliminados al cargar una nueva clase para edición

    } else {
      // Si estamos creando una nueva clase
      setFormData(initialFormState); // Vuelve al estado inicial base
      setDurationUnit("segundos");
      initialFormDataRef.current = { ...initialFormState, durationUnit: "segundos" }; // Reinicia la ref
      setResourcesInLogic([]); // Reinicia los recursos en useResourceLogic
      setDeletedResourceIds([]); // Reinicia los IDs de recursos eliminados
    }
    // Limpiar mensajes y campos de recursos al cambiar la clase o al crear una nueva
    setResponseMessage({ type: "", message: "" });
    setNewResourceTitle("");
    setNewResourceFile(null);
    setNewResourceUrl("");
    setNewResourceType("pdf");
    setResourceResponseMessage({ type: "", message: "" });
  }, [
    classToEdit,
    setResourcesInLogic, // Usar el setter renombrado
    setDeletedResourceIds,
    setNewResourceTitle,
    setNewResourceFile,
    setNewResourceUrl,
    setNewResourceType,
    setResponseMessage,
    setResourceResponseMessage,
  ]);

  // --- Segundo useEffect: Sincroniza `formData.recursos` con `resources` del hook de recursos ---
  // Este useEffect es vital para que formData siempre tenga los recursos más actuales.
  useEffect(() => {
    // Solo actualiza si resources es diferente de formData.recursos para evitar bucles infinitos
    // La comparación JSON.stringify es superficial pero suficiente para este caso.
    if (JSON.stringify(formData.recursos) !== JSON.stringify(resources)) {
        console.log("Sincronizando formData.recursos con resources desde useResourceLogic:", resources); // LOG
        setFormData((prevData) => ({
            ...prevData,
            recursos: resources,
        }));
    }
  }, [resources, setFormData]); // No incluir formData.recursos aquí si solo se usa para la comparación, ya que podría causar un bucle si el setFormData anterior no lo actualiza de inmediato.

  // --- Tercer useEffect: Para sincronizar mensajes de recursos con el mensaje global ---
  useEffect(() => {
    if (resourceResponseMessage.message) {
      setResponseMessage(resourceResponseMessage);
    }
  }, [resourceResponseMessage, setResponseMessage]);

  const fetchResourcesForClass = async (classId) => {
    setLoading(true);
    console.log("Fetching resources for class ID:", classId);
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/getAllRecursosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getRecursos" }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response from getAllRecursosController.php:", data); // LOG completo de la respuesta de la API
      if (data.status === "success" && Array.isArray(data.recursos)) {
        const classResources = data.recursos
          .filter(
            (res) => String(res.clase_id) === String(classId)
          )
          .map(res => {
            // --- ¡CAMBIO AQUÍ! Construye la URL completa del recurso ---
            const fullResourceUrl = res.url && !res.url.startsWith("http")
              ? BASE_API_URL + res.url
              : res.url;

            return {
              ...res,
              // ASEGURAR que el recurso tenga una propiedad 'nombre' para el frontend
              nombre: res.nombre || res.titulo || 'Recurso sin título',
              // Normaliza 'tipo' a minúsculas
              tipo: (res.tipo && typeof res.tipo === 'string') ? res.tipo.toLowerCase() : res.tipo,
              url: fullResourceUrl, // Asigna la URL completa
            };
          });
        console.log("Filtered and Mapped resources for this class (after type normalization and URL construction):", classResources); // LOG

        setResourcesInLogic(classResources); // <-- ¡Actualiza los recursos en useResourceLogic!

        // Después de cargar los recursos, establece initialFormDataRef con los datos completos
        // Esto es importante para hasClassDataChanged.
        const { value, unit } = convertSecondsToUnits(classToEdit?.duracion_segundos);
        initialFormDataRef.current = {
            ...classToEdit, // Usar el objeto classToEdit original como base
            duracion_valor: value, // Usar el valor convertido de la duración original
            durationUnit: unit,    // Usar la unidad convertida
            es_gratis_vista_previa: classToEdit?.es_gratis_vista_previa === 1,
            // Aquí, mapea los recursos de classResources para la referencia inicial
            recursos: classResources.map(({ id, nombre, tipo, url }) => ({ id, nombre, tipo, url })), // Solo propiedades relevantes y 'nombre', 'tipo' normalizado
        };
        console.log("initialFormDataRef.current set in fetchResources (edit mode):", initialFormDataRef.current); // LOG

      } else {
        setResponseMessage({
          type: "warning",
          message:
            data.message || "No se pudieron cargar los recursos existentes de la clase.",
        });
        setResourcesInLogic([]); // Asegura que los recursos estén vacíos en useResourceLogic
        // También inicializa initialFormDataRef en caso de que no se carguen recursos
        if (classToEdit) {
            const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);
            initialFormDataRef.current = {
                ...classToEdit,
                duracion_valor: value,
                orden: classToEdit.orden || "",
                tipo_clase: classToEdit.tipo_clase || "video",
                es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1,
                recursos: [], // Si no hay recursos, se inicializa como vacío
                durationUnit: unit,
            };
        }
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResponseMessage({
        type: "error",
        message: `Error al cargar recursos: ${error.message}`,
      });
      setResourcesInLogic([]); // Asegura que los recursos estén vacíos en useResourceLogic
      // También inicializa initialFormDataRef en caso de error
      if (classToEdit) {
        const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);
        initialFormDataRef.current = {
            ...classToEdit,
            duracion_valor: value,
            orden: classToEdit.orden || "",
            tipo_clase: classToEdit.tipo_clase || "video",
            es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1,
            recursos: [],
            durationUnit: unit,
        };
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDurationUnitChange = (e) => {
    setDurationUnit(e.target.value);
  };

  // Envoltura para handleAddResource de useResourceLogic, si necesitas pasarle algo extra
  const handleAddResource = () => {
    // Asumiendo que useResourceLogic ya tiene acceso a newResourceTitle, newResourceFile, etc.
    // Solo necesitamos pasar el método aquí.
    handleAddResourceFromLogic();
  };

  // Envoltura para handleDeleteResource de useResourceLogic
  const handleDeleteResource = (resource) => {
    handleDeleteResourceFromLogic(resource);
  };

  // Envoltura para handleFileChange de useResourceLogic
  const handleFileChange = (event) => {
    handleFileChangeFromLogic(event);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage({ type: "", message: "" });

    // Validaciones iniciales del formulario
    if (!formData.titulo || !formData.descripcion || !formData.orden) {
      setResponseMessage({
        type: "error",
        message: "Por favor, completa todos los campos obligatorios (Título, Descripción, Orden).",
      });
      setLoading(false);
      return;
    }

    const ordenNum = parseInt(formData.orden);
    if (isNaN(ordenNum) || ordenNum <= 0) {
      setResponseMessage({
        type: "error",
        message: "El campo 'Orden' debe ser un número positivo.",
      });
      setLoading(false);
      return;
    }

    if (!classToEdit && existingClassOrders.includes(ordenNum)) {
      setResponseMessage({
        type: "error",
        message: `El orden ${ordenNum} ya existe en este módulo. Por favor, elige otro.`,
      });
      setLoading(false);
      return;
    }

    let duracionSegundosToSend = null;
    if (formData.duracion_valor) {
      let numericDuration = parseInt(formData.duracion_valor);
      if (isNaN(numericDuration)) {
        setResponseMessage({
          type: "error",
          message: "El valor de la duración debe ser un número.",
        });
        setLoading(false);
        return;
      }
      switch (durationUnit) {
        case "minutos":
          duracionSegundosToSend = numericDuration * 60;
          break;
        case "horas":
          duracionSegundosToSend = numericDuration * 3600;
          break;
        case "segundos":
        default:
          duracionSegundosToSend = numericDuration;
          break;
      }
    }

    const newTempPdfResources = resources.filter( // Filtra directamente del estado 'resources'
      (res) => String(res.id).startsWith("temp-") && res.tipo === "pdf"
    );
    const newTempUrlResources = resources.filter( // Filtra directamente del estado 'resources'
      (res) => String(res.id).startsWith("temp-") && res.tipo !== "pdf"
    );


    const hasClassDataChanged = () => {
      console.log("hasClassDataChanged - initialFormDataRef.current:", initialFormDataRef.current); // LOG
      console.log("hasClassDataChanged - current formData:", formData); // LOG
      console.log("hasClassDataChanged - duracionSegundosToSend:", duracionSegundosToSend); // LOG
      console.log("hasClassDataChanged - durationUnit:", durationUnit); // LOG

      if (!initialFormDataRef.current) {
        console.log("hasClassDataChanged: initialFormDataRef.current is null/undefined. Returning true."); // LOG
        return true;
      }

      const initial = initialFormDataRef.current;
      const current = {
        ...formData,
        duracion_segundos: duracionSegundosToSend,
        es_gratis_vista_previa: formData.es_gratis_vista_previa ? 1 : 0,
        // No incluir 'recursos' en esta comparación, se maneja por separado
      };

      const classKeysToCompare = ['titulo', 'descripcion', 'url_video', 'orden', 'tipo_clase', 'es_gratis_vista_previa'];
      for (const key of classKeysToCompare) {
        // Asegurarse de comparar valores del estado inicial con los actuales,
        // teniendo en cuenta que algunos pueden venir del objeto classToEdit original.
        const initialValue = String(initial[key]); // Usar initial directamente
        const currentValue = String(current[key]);

        if (initialValue !== currentValue) {
          console.log(`Class data changed: ${key} from '${initialValue}' to '${currentValue}'`); // LOG
          return true;
        }
      }

      // Comparación de duración: Convertir initial.duracion_valor a segundos para una comparación consistente
      const initialDurationInSeconds = initial.duracion_valor !== "" && initial.duracion_valor !== null && !isNaN(initial.duracion_valor) ?
        parseInt(initial.duracion_valor) * (initial.durationUnit === 'horas' ? 3600 : initial.durationUnit === 'minutos' ? 60 : 1) : null;

      console.log(`Comparing durations: Initial ${initialDurationInSeconds}s vs Current ${duracionSegundosToSend}s`); // LOG
      if (initialDurationInSeconds !== duracionSegundosToSend) {
        console.log(`Duration changed: from '${initial.duracion_valor} ${initial.durationUnit}' (as ${initialDurationInSeconds}s) to '${formData.duracion_valor} ${durationUnit}' (as ${duracionSegundosToSend}s)`); // LOG
        return true;
      }

      // Comparar recursos: Convertir ambos arrays a una cadena JSON ordenada para una comparación profunda.
      // Solo comparar los recursos "persistidos" o que no son temporales
      const getComparableResources = (resourceArray) => {
        console.log("getComparableResources - Input resourceArray:", resourceArray); // LOG
        return resourceArray
          .filter(res => !String(res.id).startsWith("temp-")) // Ignorar recursos temporales para la comparación inicial
          .map(({ id, nombre, tipo, url }) => ({ id, nombre, tipo, url })) // Normalizar propiedades
          .sort((a, b) => (a.id || '').localeCompare(b.id || '')); // Asegurar orden consistente
      };

      const initialExistingResources = getComparableResources(initial.recursos || []);
      const currentExistingResources = getComparableResources(resources || []); // Usa el estado 'resources' de useResourceLogic
      
      console.log("initialExistingResources for comparison:", initialExistingResources); // LOG
      console.log("currentExistingResources for comparison:", currentExistingResources); // LOG

      if (JSON.stringify(initialExistingResources) !== JSON.stringify(currentExistingResources)) {
          console.log("hasClassDataChanged: Existing resources list changed."); // LOG
          return true;
      }

      console.log("hasClassDataChanged: No changes detected in main class data or existing resources."); // LOG
      return false;
    };

    const classDataChanged = classToEdit ? hasClassDataChanged() : true;
    const hasNewTempResources = newTempPdfResources.length > 0 || newTempUrlResources.length > 0;
    const hasDeletedResources = deletedResourceIds.length > 0;
    
    // hasResourceListChanged de useResourceLogic sería ideal aquí si la exportas.
    const resourcesNeedProcessing = hasNewTempResources || hasDeletedResources;

    console.log("Final check: classDataChanged:", classDataChanged, "resourcesNeedProcessing:", resourcesNeedProcessing); // LOG

    if (!classDataChanged && !resourcesNeedProcessing) {
      setResponseMessage({
        type: "info",
        message: "No se detectaron cambios en la clase ni en sus recursos.",
      });
      setLoading(false);
      return;
    }

    const dataToSendClass = {
      ...formData,
      accion: classToEdit ? "update" : "clase",
      modulo_id: moduleId,
      es_gratis_vista_previa: formData.es_gratis_vista_previa ? 1 : 0,
      orden: parseInt(formData.orden),
      duracion_segundos: duracionSegundosToSend,
      recursos: undefined, // No enviar recursos aquí, se manejan por separado
    };

    delete dataToSendClass.duracion_valor;

    if (classToEdit) {
      dataToSendClass.id = classToEdit.id;
    }

    console.log("Datos de la clase a enviar (primera llamada a la API):", dataToSendClass); // LOG

    const apiUrlClass = classToEdit
      ? "https://apiacademy.hitpoly.com/ajax/editarClasesController.php"
      : "https://apiacademy.hitpoly.com/ajax/subirDatosClaseController.php";

    let classId = classToEdit ? classToEdit.id : null;
    let messages = [];
    let hasError = false;
    let hasWarning = false;
    let classOperationSuccessful = false;
    let resourcesOperationSuccessful = true;
    let classOperationAttempted = false;
    let resourceOperationAttempted = false;


    try {
      if (classDataChanged) {
        classOperationAttempted = true;
        console.log(`Intentando ${classToEdit ? "actualizar" : "crear"} clase principal...`); // LOG
        const responseClass = await fetch(apiUrlClass, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSendClass),
        });

        if (!responseClass.ok) {
          const errorText = await responseClass.text();
          throw new Error(
            `Error HTTP al ${
              classToEdit ? "actualizar" : "crear"
            } clase: ${responseClass.status}, mensaje: ${errorText}`
          );
        }

        const dataClass = await responseClass.json();
        console.log("Respuesta de la API de clase:", dataClass); // LOG

        if (dataClass.status === "success") {
          classOperationSuccessful = true;
          if (!classToEdit && dataClass.id) {
            classId = dataClass.id;
            console.log("ID de clase recién creada:", classId); // LOG
          } else if (!classId && classToEdit) { // Si estamos editando y no hay un ID de clase válido.
              classId = classToEdit.id; // Re-asegurar el ID de la clase existente.
          } else if (!classId) {
              hasWarning = true;
              messages.push("Advertencia: No se pudo obtener el ID de la clase para adjuntar nuevos recursos.");
          }
        } else {
          const isNoChangesError = dataClass.message && dataClass.message.includes("No se realizaron cambios");
          
          if (isNoChangesError && resourcesNeedProcessing) {
            console.log("Ignorando error de 'No se realizaron cambios' porque hay recursos a procesar.");
            classOperationSuccessful = true;
          } else {
            hasError = true;
            messages.push(`Error al ${classToEdit ? "actualizar" : "crear"} la clase: ${dataClass.message || "error desconocido."}`);
            console.error("Error al guardar/actualizar la clase:", dataClass.message); // LOG
          }
        }
      } else {
        console.log("Datos de clase principal no cambiaron, omitiendo llamada a la API de clase."); // LOG
        classOperationSuccessful = true; // Si no hay cambios, considera la operación exitosa para continuar con recursos.
      }

      // 2. Manejar la eliminación de recursos existentes
      if (hasDeletedResources) {
        resourceOperationAttempted = true;
        console.log(`Intentando eliminar ${deletedResourceIds.length} recursos existentes...`); // LOG
        const deletePromises = deletedResourceIds.map(async (resourceId) => {
          try {
            const response = await fetch(
              "https://apiacademy.hitpoly.com/ajax/eliminarRecursoController.php",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "delete", id: resourceId }),
              }
            );
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Error HTTP al eliminar recurso ${resourceId}: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log(`Respuesta eliminación recurso ${resourceId}:`, data);
            if (data.status === "success") {
              return { success: true, message: `Recurso '${resourceId}' eliminado.` };
            } else {
              console.error(`Error del servidor al eliminar recurso ${resourceId}:`, data.message);
              return { success: false, message: `Fallo al eliminar recurso '${resourceId}': ${data.message}` };
            }
          } catch (err) {
            console.error(`Fallo de conexión/red al eliminar recurso ${resourceId}:`, err);
            return { success: false, message: `Fallo de red para eliminar recurso '${resourceId}': ${err.message}` };
          }
        });

        const deleteResults = await Promise.all(deletePromises);
        const failedDeletions = deleteResults.filter(r => !r.success);

        if (failedDeletions.length > 0) {
          hasError = true;
          resourcesOperationSuccessful = false;
          messages.push("Algunos recursos existentes no se pudieron eliminar: " + failedDeletions.map(f => f.message).join("; "));
        }
        setDeletedResourceIds([]); // Limpia los IDs eliminados después de intentar procesarlos
      }


      // 3. Manejar la subida de nuevos recursos (si hay un classId válido)
      if (hasNewTempResources && classId) {
        resourceOperationAttempted = true;
        console.log(`Intentando subir ${newTempPdfResources.length} PDFs y ${newTempUrlResources.length} URLs...`); // LOG

        const uploadPromises = [];

        newTempPdfResources.forEach(resource => {
          const resourceFormData = new FormData();
          resourceFormData.append("clase_id", classId);
          resourceFormData.append("nombre", resource.nombre); // USAR 'nombre' aquí
          resourceFormData.append("tipo", "pdf"); // Se envía "pdf" al backend para PDFs
          resourceFormData.append("archivo", resource.file);

          uploadPromises.push(
            fetch("https://apiacademy.hitpoly.com/ajax/recursosClasesController.php", {
              method: "POST",
              body: resourceFormData,
            })
            .then(response => {
              if (!response.ok) {
                return response.text().then(text => Promise.reject(new Error(`Error al subir PDF "${resource.nombre}": ${response.status} - ${text}`)));
              }
              return response.json();
            })
            .then(data => {
              console.log(`Respuesta subida PDF "${resource.nombre}":`, data);
              if (data.status === "success") {
                return { success: true, message: `Recurso PDF '${resource.nombre}' subido.` };
              } else {
                console.error(`Error del servidor al subir PDF "${resource.nombre}":`, data.message);
                return { success: false, message: `Fallo al subir PDF '${resource.nombre}': ${data.message}` };
              }
            })
            .catch(resourceError => {
              console.error(`Fallo de conexión/red al subir PDF "${resource.nombre}":`, resourceError);
              return { success: false, message: `Fallo de red para PDF '${resource.nombre}': ${resourceError.message}` };
            })
          );
        });

        newTempUrlResources.forEach(resource => {
          const dataToSendUrlResource = {
            clase_id: classId,
            nombre: resource.nombre, // USAR 'nombre' aquí
            tipo: resource.tipo, // Se envía el tipo que ya tiene, que debería ser 'enlace'
            url: resource.url,
          };
          
          uploadPromises.push(
            fetch("https://apiacademy.hitpoly.com/ajax/recursoConUrlController.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dataToSendUrlResource),
            })
            .then(response => {
              if (!response.ok) {
                return response.text().then(text => Promise.reject(new Error(`Error al subir URL "${resource.nombre}": ${response.status} - ${text}`)));
              }
              return response.json();
            })
            .then(data => {
              console.log(`Respuesta subida URL "${resource.nombre}":`, data);
              if (data.status === "success") {
                return { success: true, message: `Recurso URL '${resource.nombre}' subido.` };
              } else {
                console.error(`Error del servidor al subir URL "${resource.nombre}":`, data.message);
                return { success: false, message: `Fallo al subir URL '${resource.nombre}': ${data.message}` };
              }
            })
            .catch(resourceError => {
              console.error(`Fallo de conexión/red al subir URL "${resource.nombre}":`, resourceError);
              return { success: false, message: `Fallo de red para URL '${resource.nombre}': ${resourceError.message}` };
            })
          );
        });

        const resultsResources = await Promise.all(uploadPromises);

        const failedResources = resultsResources.filter(r => !r.success);

        if (failedResources.length > 0) {
          hasError = true;
          resourcesOperationSuccessful = false;
          messages.push("Algunos recursos adicionales no se pudieron subir: " + failedResources.map(f => f.message).join("; "));
        }
      } else if (hasNewTempResources && !classId) {
        hasWarning = true;
        messages.push("Advertencia: No se pudieron subir nuevos recursos porque no se obtuvo un ID de clase válido. Guarde la clase primero.");
      }
      
      let finalMessageType = "success";
      let finalMessageText = "";

      if (hasError) {
        finalMessageType = "error";
      } else if (hasWarning) {
        finalMessageType = "warning";
      } else {
        const successMessages = [];
        
        if (!classToEdit && classDataChanged && classOperationSuccessful) {
          successMessages.push(`Clase creada exitosamente.`);
        } else if (classToEdit && classDataChanged && classOperationSuccessful) {
          successMessages.push(`Clase actualizada exitosamente.`);
        }

        if (hasDeletedResources && resourcesOperationSuccessful) {
          successMessages.push("Recursos eliminados exitosamente.");
        }
        if (hasNewTempResources && resourcesOperationSuccessful) {
          successMessages.push("Nuevos recursos subidos exitosamente.");
        }
        
        if (!classDataChanged && !resourcesNeedProcessing) {
          finalMessageType = "info";
          finalMessageText = "No se detectaron cambios en la clase ni en sus recursos.";
        } else if (successMessages.length > 0) {
          finalMessageText = successMessages.join(" ");
        } else if (classToEdit && classDataChanged && !resourcesNeedProcessing && classOperationSuccessful) {
          // Este caso podría ser si la clase se actualizó pero no hay mensajes específicos de recursos.
          finalMessageText = "Clase actualizada exitosamente.";
        }
      }

      if (hasError || hasWarning) {
        finalMessageText = messages.join("\n");
      }

      setResponseMessage({ 
        type: finalMessageType, 
        message: finalMessageText 
      });

      setLoading(false);

      // Llama a onClassSaved solo si la operación principal fue exitosa (clase y recursos si aplicable)
      if ((classOperationSuccessful || !classOperationAttempted) && (resourcesOperationSuccessful || !resourceOperationAttempted)) {
        setTimeout(() => {
          onClassSaved();
          // --- ¡CAMBIO AQUÍ! Limpiar el formulario y los recursos después de guardar exitosamente ---
          if (!classToEdit) { // Solo limpiar si se está creando una nueva clase
            setFormData(initialFormState);
            setDurationUnit("segundos");
            setResourcesInLogic([]); // Limpiar los recursos en el hook de recursos
            setDeletedResourceIds([]); // Asegurarse de que no haya IDs de recursos eliminados pendientes
            setNewResourceTitle("");
            setNewResourceFile(null);
            setNewResourceUrl("");
            setNewResourceType("pdf");
            initialFormDataRef.current = { ...initialFormState, durationUnit: "segundos" }; // Reiniciar la referencia inicial
          }
        }, 1000);
      }

    } catch (error) {
      console.error("Error general en handleSubmit:", error);
      setResponseMessage({
        type: "error",
        message: `Error de conexión: ${error.message}`,
      });
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    responseMessage,
    durationUnit,
    handleChange,
    handleDurationUnitChange,
    handleSubmit,
    setResponseMessage,
    // Propiedades y funciones de recursos que vienen de useResourceLogic
    resources, // Proporciona el estado 'resources' para que ClassForm lo use.
    newResourceTitle,
    setNewResourceTitle,
    newResourceFile,
    setNewResourceFile,
    newResourceUrl,
    setNewResourceUrl,
    newResourceType,
    setNewResourceType,
    handleAddResource, // Usar las envolturas
    handleDeleteResource, // Usar las envolturas
    handleFileChange, // Usar la envoltura
    deletedResourceIds,
    setResources: setResourcesInLogic, // Exporta el setter renombrado de useResourceLogic
  };
};

export default useClassFormLogic;