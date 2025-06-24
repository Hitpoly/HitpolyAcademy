// useClassFormLogic.js
import { useState, useEffect, useRef } from "react";

// Mover convertSecondsToUnits fuera del useEffect para que sea accesible globalmente
const convertSecondsToUnits = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return { value: "", unit: "segundos" };
  }
  if (totalSeconds % 3600 === 0 && totalSeconds >= 3600) {
    return { value: totalSeconds / 3600, unit: "horas" };
  }
  if (totalSeconds % 60 === 0 && totalSeconds >= 60) {
    return { value: totalSeconds / 60, unit: "minutos" };
  }
  return { value: totalSeconds, unit: "segundos" };
};


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
    recursos: [],
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({
    type: "",
    message: "",
  });
  const [durationUnit, setDurationUnit] = useState("segundos");
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceFile, setNewResourceFile] = useState(null);

  const [deletedResourceIds, setDeletedResourceIds] = useState([]);

  const initialFormDataRef = useRef(null);
  const initialResourcesRef = useRef([]);

  useEffect(() => {
    console.log("useEffect - classToEdit:", classToEdit); // LOG
    if (classToEdit) {
      const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);

      const newFormData = {
        titulo: classToEdit.titulo || "",
        descripcion: classToEdit.descripcion || "",
        url_video: classToEdit.url_video || "",
        duracion_valor: value,
        orden: classToEdit.orden || "",
        tipo_clase: classToEdit.tipo_clase || "video",
        es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1, // Asegúrate de que sea booleano aquí
        recursos: [],
      };
      setFormData(newFormData);
      setDurationUnit(unit);
      fetchResourcesForClass(classToEdit.id);
      setDeletedResourceIds([]);
    } else {
      setFormData(initialFormState);
      setDurationUnit("segundos");
      // Importante: para una clase nueva, la referencia inicial debe ser el estado actual para que hasClassDataChanged funcione
      initialFormDataRef.current = { ...initialFormState, durationUnit: "segundos" }; 
      initialResourcesRef.current = [];
      setDeletedResourceIds([]);
    }
    setResponseMessage({ type: "", message: "" });
    setNewResourceTitle("");
    setNewResourceFile(null);
  }, [classToEdit, moduleId, onClassSaved]);

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
      console.log("Response from getAllRecursosController.php:", data);
      if (data.status === "success" && Array.isArray(data.recursos)) {
        const classResources = data.recursos.filter(
          (res) => String(res.clase_id) === String(classId)
        );
        console.log("Filtered resources for this class:", classResources); // LOG

        setFormData((prevData) => {
          const updatedData = {
            ...prevData,
            recursos: classResources,
          };
          if (classToEdit) {
            // Asegurarse de que el initialFormDataRef contenga también la unidad de duración y el valor original
            initialFormDataRef.current = {
                ...updatedData,
                duracion_valor: updatedData.duracion_valor, // Mantener el valor numérico
                durationUnit: durationUnit // Mantener la unidad
            };
            initialResourcesRef.current = classResources.map(r => ({ ...r })); // Copia superficial de cada recurso
            console.log("initialFormDataRef.current set in fetchResources (edit mode):", initialFormDataRef.current); // LOG
            console.log("initialResourcesRef.current set in fetchResources (edit mode):", initialResourcesRef.current); // LOG
          }
          return updatedData;
        });
      } else {
        setResponseMessage({
          type: "warning",
          message:
            data.message || "No se pudieron cargar los recursos existentes de la clase.",
        });
        setFormData((prevData) => ({ ...prevData, recursos: [] }));
        if (classToEdit) {
          // Establecer estado inicial si falla la carga para una clase existente
          const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);
          initialFormDataRef.current = { 
            ...initialFormState, 
            titulo: classToEdit.titulo || "",
            descripcion: classToEdit.descripcion || "",
            url_video: classToEdit.url_video || "",
            duracion_valor: value,
            orden: classToEdit.orden || "",
            tipo_clase: classToEdit.tipo_clase || "video",
            es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1,
            recursos: [], 
            durationUnit: unit 
          }; 
          initialResourcesRef.current = [];
        }
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResponseMessage({
        type: "error",
        message: `Error al cargar recursos: ${error.message}`,
      });
      setFormData((prevData) => ({ ...prevData, recursos: [] }));
      if (classToEdit) {
        // Establecer estado inicial si falla la carga para una clase existente
        const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);
        initialFormDataRef.current = { 
          ...initialFormState, 
          titulo: classToEdit.titulo || "",
          descripcion: classToEdit.descripcion || "",
          url_video: classToEdit.url_video || "",
          duracion_valor: value,
          orden: classToEdit.orden || "",
          tipo_clase: classToEdit.tipo_clase || "video",
          es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1,
          recursos: [], 
          durationUnit: unit 
        }; 
        initialResourcesRef.current = [];
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

  const handleFileChange = (e) => {
    setNewResourceFile(e.target.files[0]);
  };

  const handleAddResource = () => {
    if (!newResourceTitle.trim()) {
      setResponseMessage({
        type: "error",
        message: "Por favor, ingresa un título para el nuevo recurso.",
      });
      return;
    }

    if (!newResourceFile) {
      setResponseMessage({
        type: "error",
        message: "Por favor, selecciona un archivo PDF para subir.",
      });
      return;
    }

    const newResource = {
      titulo: newResourceTitle.trim(),
      tipo: "pdf",
      url: "",
      file: newResourceFile,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clase_id: null,
    };

    setFormData((prevData) => ({
      ...prevData,
      recursos: [...prevData.recursos, newResource],
    }));

    setNewResourceTitle("");
    setNewResourceFile(null);
    setResponseMessage({ type: "", message: "" });
    console.log("Recurso PDF añadido localmente:", newResource); // LOG
  };

  const handleDeleteResource = async (resourceToDelete) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este recurso?")) {
      return;
    }

    if (resourceToDelete.id && !String(resourceToDelete.id).startsWith("temp-")) {
      setDeletedResourceIds((prev) => [...prev, resourceToDelete.id]);
      setFormData((prevData) => ({
        ...prevData,
        recursos: prevData.recursos.filter((res) => res.id !== resourceToDelete.id),
      }));
      setResponseMessage({
        type: "info",
        message: "Recurso marcado para eliminación. Los cambios se aplicarán al guardar la clase.",
      });
      console.log("Recurso existente marcado para eliminación:", resourceToDelete); // LOG
    } else {
      setFormData((prevData) => ({
        ...prevData,
        recursos: prevData.recursos.filter((res) => res.id !== resourceToDelete.id),
      }));
      setResponseMessage({
        type: "info",
        message: "Recurso temporal eliminado localmente.",
      });
      console.log("Recurso temporal eliminado localmente:", resourceToDelete); // LOG
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage({ type: "", message: "" });

    // Validaciones iniciales del formulario (mantener la lógica existente)
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

    const newOrTempResources = formData.recursos.filter(
      (res) => String(res.id).startsWith("temp-")
    );

    const hasClassDataChanged = () => {
      console.log("hasClassDataChanged - initialFormDataRef.current:", initialFormDataRef.current); // LOG
      console.log("hasClassDataChanged - current formData:", formData); // LOG
      console.log("hasClassDataChanged - duracionSegundosToSend:", duracionSegundosToSend); // LOG
      console.log("hasClassDataChanged - durationUnit:", durationUnit); // LOG


      if (!initialFormDataRef.current) {
        console.log("hasClassDataChanged: initialFormDataRef.current is null/undefined. Returning true."); // LOG
        return true; // Si no hay estado inicial (ej. nueva clase), siempre hay cambios.
      }

      const initial = initialFormDataRef.current;
      
      const current = {
        ...formData,
        duracion_segundos: duracionSegundosToSend,
        es_gratis_vista_previa: formData.es_gratis_vista_previa ? 1 : 0,
      };

      const { recursos: initialRecursos, duracion_valor: initialDuracionValueRaw, ...initialClassDataClean } = initial;
      const { recursos: currentRecursos, duracion_valor: currentDuracionValueRaw, ...currentClassDataClean } = current;

      // Comparar campos principales
      const classKeysToCompare = ['titulo', 'descripcion', 'url_video', 'orden', 'tipo_clase', 'es_gratis_vista_previa']; // Explicitamos los campos
      for (const key of classKeysToCompare) {
        // Asegúrate de que ambas estén en el mismo tipo (cadena o número) para la comparación
        const initialValue = String(initialClassDataClean[key]);
        const currentValue = String(currentClassDataClean[key]);
        
        if (initialValue !== currentValue) {
          console.log(`Class data changed: ${key} from '${initialValue}' to '${currentValue}'`); // LOG
          return true;
        }
      }

      // Comparar específicamente la duración en segundos
      const initialDurationInSeconds = initial.duracion_valor !== "" && initial.duracion_valor !== null && !isNaN(initial.duracion_valor) ?
          parseInt(initial.duracion_valor) * (initial.durationUnit === 'horas' ? 3600 : initial.durationUnit === 'minutos' ? 60 : 1) : null;
      
      console.log(`Comparing durations: Initial ${initialDurationInSeconds}s vs Current ${duracionSegundosToSend}s`); // LOG
      if (initialDurationInSeconds !== duracionSegundosToSend) {
        console.log(`Duration changed: from '${initial.duracion_valor} ${initial.durationUnit}' (as ${initialDurationInSeconds}s) to '${formData.duracion_valor} ${durationUnit}' (as ${duracionSegundosToSend}s)`); // LOG
        return true;
      }

      console.log("hasClassDataChanged: No changes detected in main class data."); // LOG
      return false;
    };

    const hasResourceListChanged = () => {
        console.log("hasResourceListChanged - initialResourcesRef.current:", initialResourcesRef.current); // LOG
        console.log("hasResourceListChanged - formData.recursos:", formData.recursos); // LOG

        // CAMBIO: Considerar solo cambios si hay recursos existentes para comparar o nuevos temporales
        // O si se eliminaron recursos existentes
        if (initialResourcesRef.current.length !== formData.recursos.length || deletedResourceIds.length > 0) {
            console.log("Resource list length changed or resources deleted. Returning true."); // LOG
            return true;
        }
        // Comparar IDs y títulos para asegurar que son los mismos recursos en el mismo orden
        for (let i = 0; i < initialResourcesRef.current.length; i++) {
            // Asegurarse de que ambos IDs no sean temporales para una comparación justa si se mezcla el array
            const initialResId = String(initialResourcesRef.current[i].id).startsWith("temp-") ? null : initialResourcesRef.current[i].id;
            const currentResId = String(formData.recursos[i].id).startsWith("temp-") ? null : formData.recursos[i].id;
            
            if (initialResId !== currentResId || initialResourcesRef.current[i].titulo !== formData.recursos[i].titulo) {
                console.log(`Resource at index ${i} changed: Initial ID/Title ${initialResId}/${initialResourcesRef.current[i].titulo} vs Current ID/Title ${currentResId}/${formData.recursos[i].titulo}`); // LOG
                return true;
            }
        }
        console.log("Resource list content and order unchanged. Returning false."); // LOG
        return false;
    };
    
    const classDataChanged = classToEdit ? hasClassDataChanged() : true;
    const hasNewTempResources = newOrTempResources.length > 0;
    const hasDeletedResources = deletedResourceIds.length > 0;
    
    // CAMBIO: Refinar la determinación de si los recursos necesitan procesamiento
    // Si es una nueva clase, los recursos temporales siempre necesitan procesamiento.
    // Si es una clase existente, cualquier cambio en la lista de recursos (nuevos temporales, eliminados, o si la lista en sí ha cambiado)
    const resourcesNeedProcessing = hasNewTempResources || hasDeletedResources || (classToEdit && hasResourceListChanged());

    console.log("Final check: classDataChanged:", classDataChanged, "resourcesNeedProcessing:", resourcesNeedProcessing); // LOG

    if (!classDataChanged && !resourcesNeedProcessing) {
      setResponseMessage({
        type: "info", // Mantener como info para este caso específico de "sin cambios"
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
    let messages = []; // Se usará para mensajes de error/advertencia
    let hasError = false; 
    let hasWarning = false;
    let classOperationSuccessful = false;
    let resourcesOperationSuccessful = false;
    let classOperationAttempted = false;
    let resourceOperationAttempted = false;


    try {
      // 1. Manejar la actualización/creación de la clase principal SI sus datos cambiaron o es nueva
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
          // NO AGREGAR MENSAJE DE ÉXITO DE CLASE AQUÍ PARA MODO DE EDICIÓN
          classOperationSuccessful = true; 
          if (!classToEdit && dataClass.id) {
            classId = dataClass.id;
            console.log("ID de clase recién creada:", classId); // LOG
          } else if (!classId) {
            hasWarning = true;
            messages.push("Advertencia: No se pudo obtener el ID de la clase para adjuntar nuevos recursos.");
          }
        } else {
            // *** INICIO DE LA MODIFICACIÓN CLAVE ***
            // Verifica si el mensaje de error es el de "No se realizaron cambios"
            // Y si hay cambios en los recursos (nuevos o eliminados).
            const isNoChangesError = dataClass.message && dataClass.message.includes("No se realizaron cambios");
            
            if (isNoChangesError && resourcesNeedProcessing) {
                // Si es el error de "no cambios" y SÍ hay recursos que procesar,
                // NO LO MARCAMOS COMO ERROR FATAL PARA LA CLASE PRINCIPAL
                // y la operación de la clase se considera "exitosa" para poder continuar con los recursos.
                console.log("Ignorando error de 'No se realizaron cambios' porque hay recursos a procesar.");
                classOperationSuccessful = true; 
            } else {
                // Si no es el error específico o si no hay recursos que procesar,
                // entonces sí es un error real para la clase principal.
                hasError = true;
                messages.push(`Error al ${classToEdit ? "actualizar" : "crear"} la clase: ${dataClass.message || "error desconocido."}`); 
                console.error("Error al guardar/actualizar la clase:", dataClass.message); // LOG
            }
            // *** FIN DE LA MODIFICACIÓN CLAVE ***
        }
      } else {
        console.log("Datos de clase principal no cambiaron, omitiendo llamada a la API de clase."); // LOG
        classOperationSuccessful = true; // Se considera "éxito" que no hubo necesidad de modificar
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
          messages.push("Algunos recursos existentes no se pudieron eliminar: " + failedDeletions.map(f => f.message).join("; "));
        } else {
          resourcesOperationSuccessful = true;
        }
        setDeletedResourceIds([]); 
      }


      // 3. Manejar la subida de nuevos recursos (si hay un classId válido)
      if (hasNewTempResources && classId) {
            resourceOperationAttempted = true;
        console.log(`Intentando subir ${newOrTempResources.length} nuevos recursos...`); // LOG
        const uploadResourcePromises = newOrTempResources.map(async (resource) => {
          const resourceFormData = new FormData();
          resourceFormData.append("clase_id", classId);
          resourceFormData.append("nombre", resource.titulo);
          resourceFormData.append("tipo", "pdf");
          resourceFormData.append("archivo", resource.file);

          console.log(`Preparando subida de recurso "${resource.titulo}" (tipo: ${resource.tipo})...`);
          try {
            const resourceResponse = await fetch(
              "https://apiacademy.hitpoly.com/ajax/recursosClasesController.php",
              {
                method: "POST",
                body: resourceFormData,
              }
            );

            if (!resourceResponse.ok) {
              const errorResourceText = await resourceResponse.text();
              throw new Error(
                `Error al subir recurso "${resource.titulo}": ${resourceResponse.status} - ${errorResourceText}`
              );
            }
            const resourceData = await resourceResponse.json();
            console.log(`Respuesta subida recurso "${resource.titulo}":`, resourceData);
            if (resourceData.status === "success") {
              return { success: true, message: `Recurso '${resource.titulo}' subido.` };
            } else {
              console.error(
                `Error del servidor al subir recurso "${resource.titulo}":`,
                resourceData.message
              );
              return { success: false, message: `Fallo al subir recurso '${resource.titulo}': ${resourceData.message}` };
            }
          } catch (resourceError) {
            console.error(`Fallo de conexión/red al subir recurso "${resource.titulo}":`, resourceError);
            return { success: false, message: `Fallo de red para recurso '${resource.titulo}': ${resourceError.message}` };
          }
        });

        const resultsResources = await Promise.all(uploadResourcePromises);

        const failedResources = resultsResources.filter(r => !r.success);

        if (failedResources.length > 0) {
          hasError = true;
          messages.push("Algunos recursos adicionales no se pudieron subir: " + failedResources.map(f => f.message).join("; "));
        } else {
          resourcesOperationSuccessful = true;
        }
      } else if (hasNewTempResources && !classId) {
        hasWarning = true;
        messages.push("Advertencia: No se pudieron subir nuevos recursos porque no se obtuvo un ID de clase válido. Guarde la clase primero."); 
      }
      
      // Lógica MEJORADA para determinar el tipo de mensaje final
      let finalMessageType = "success"; // Por defecto, si todo sale bien o no hay cambios, es éxito.
      let finalMessageText = "";

      if (hasError) {
        finalMessageType = "error";
      } else if (hasWarning) {
        finalMessageType = "warning";
      } else {
        // Si no hay errores ni advertencias, construimos un mensaje de éxito más amigable
        const successMessages = [];
        
        // Solo agrega el mensaje de clase si es una CLASE NUEVA
        if (!classToEdit && classDataChanged && classOperationSuccessful) {
            successMessages.push(`Clase creada exitosamente.`);
        } 
        // En modo de edición, no agregar mensaje de éxito para cambios de clase principal.
        // Solo agregar mensajes si hay recursos.

        if (hasDeletedResources && resourcesOperationSuccessful) {
          successMessages.push("Recursos eliminados exitosamente.");
        }
        if (hasNewTempResources && resourcesOperationSuccessful) {
          successMessages.push("Nuevos recursos subidos exitosamente.");
        }
        
        // Si no hubo cambios en la clase principal y no se procesaron recursos (ni se agregaron ni se eliminaron)
        if (!classDataChanged && !resourcesNeedProcessing) {
             finalMessageType = "info"; 
             finalMessageText = "No se detectaron cambios en la clase ni en sus recursos.";
        } else if (successMessages.length > 0) {
            // Si hay mensajes de éxito de recursos, o si es una clase nueva (y se agregó un mensaje)
          finalMessageText = successMessages.join(" "); // Unimos los mensajes de éxito
        } else if (classToEdit && classDataChanged && !resourcesNeedProcessing && classOperationSuccessful) {
            // Este es el caso cuando se actualizó la clase en modo edición, pero no hay recursos procesados.
            // Según tu petición, no queremos mensaje para esto. Así que dejamos finalMessageText vacío.
            finalMessageType = ""; // No mostrar mensaje
            finalMessageText = "";
        }
      }

      // Si hay errores o advertencias, unimos todos los mensajes capturados
      if (hasError || hasWarning) {
        finalMessageText = messages.join("\n");
      }

      setResponseMessage({ 
        type: finalMessageType, 
        message: finalMessageText 
      });

      setLoading(false);
      
      // Llamar a onClassSaved si hubo cambios en la clase, o si se procesaron recursos (nuevos/eliminados),
      // siempre que la operación general no sea un error fatal (ej. fallo de la clase principal)
      if (((classDataChanged && classOperationSuccessful) || resourcesNeedProcessing) && !hasError) { // Añadido !hasError
        setTimeout(() => {
          onClassSaved();
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
    newResourceTitle,
    newResourceFile,
    handleChange,
    handleDurationUnitChange,
    handleFileChange,
    handleAddResource,
    handleDeleteResource,
    handleSubmit,
    setResponseMessage,
    setNewResourceTitle,
    setNewResourceFile,
  };
};

export default useClassFormLogic;