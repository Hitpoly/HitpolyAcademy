// useClassFormLogic.js
import { useState, useEffect, useRef } from "react";
import { convertSecondsToUnits } from "./utils";
import useResourceLogic from "./useResourceLogic";

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
    recursos: [], 
  };

  const [formData, setFormData] = useState(() => {
    if (classToEdit) {
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

  const initialFormDataRef = useRef(null);

  const {
    resources,
    setResources: setResourcesInLogic, 
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
    handleAddResource: handleAddResourceFromLogic, 
    handleDeleteResource: handleDeleteResourceFromLogic,
    handleFileChange: handleFileChangeFromLogic, 
    resourceResponseMessage,
    setResourceResponseMessage,
  } = useResourceLogic(setResponseMessage); 

  useEffect(() => {
    if (classToEdit) {
      const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);

      const newFormData = {
        titulo: classToEdit.titulo || "",
        descripcion: classToEdit.descripcion || "",
        url_video: classToEdit.url_video || "",
        duracion_valor: value,
        orden: classToEdit.orden || "",
        tipo_clase: classToEdit.tipo_clase || "video",
        es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1,
        recursos: [], 
      };
      setFormData(newFormData);
      setDurationUnit(unit);

      fetchResourcesForClass(classToEdit.id);
      setDeletedResourceIds([]); 

    } else {

      setFormData(initialFormState); 
      setDurationUnit("segundos");
      initialFormDataRef.current = { ...initialFormState, durationUnit: "segundos" }; // Reinicia la ref
      setResourcesInLogic([]); 
      setDeletedResourceIds([]); 
    }
    setResponseMessage({ type: "", message: "" });
    setNewResourceTitle("");
    setNewResourceFile(null);
    setNewResourceUrl("");
    setNewResourceType("pdf");
    setResourceResponseMessage({ type: "", message: "" });
  }, [
    classToEdit,
    setResourcesInLogic,
    setDeletedResourceIds,
    setNewResourceTitle,
    setNewResourceFile,
    setNewResourceUrl,
    setNewResourceType,
    setResponseMessage,
    setResourceResponseMessage,
  ]);

  useEffect(() => {
    if (JSON.stringify(formData.recursos) !== JSON.stringify(resources)) {
        setFormData((prevData) => ({
            ...prevData,
            recursos: resources,
        }));
    }
  }, [resources, setFormData]); 

  useEffect(() => {
    if (resourceResponseMessage.message) {
      setResponseMessage(resourceResponseMessage);
    }
  }, [resourceResponseMessage, setResponseMessage]);

  const fetchResourcesForClass = async (classId) => {
    setLoading(true);
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
      if (data.status === "success" && Array.isArray(data.recursos)) {
        const classResources = data.recursos
          .filter(
            (res) => String(res.clase_id) === String(classId)
          )
          .map(res => {
            const fullResourceUrl = res.url && !res.url.startsWith("http")
              ? BASE_API_URL + res.url
              : res.url;

            return {
              ...res,
              nombre: res.nombre || res.titulo || 'Recurso sin título',
              tipo: (res.tipo && typeof res.tipo === 'string') ? res.tipo.toLowerCase() : res.tipo,
              url: fullResourceUrl, 
            };
          });
        
        setResourcesInLogic(classResources); 

        const { value, unit } = convertSecondsToUnits(classToEdit?.duracion_segundos);
        initialFormDataRef.current = {
            ...classToEdit,
            duracion_valor: value, 
            durationUnit: unit,
            es_gratis_vista_previa: classToEdit?.es_gratis_vista_previa === 1,
            recursos: classResources.map(({ id, nombre, tipo, url }) => ({ id, nombre, tipo, url })), // Solo propiedades relevantes y 'nombre', 'tipo' normalizado
        };
        
      } else {
        setResponseMessage({
          type: "warning",
          message:
            data.message || "No se pudieron cargar los recursos existentes de la clase.",
        });
        setResourcesInLogic([]); 
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
      }
    } catch (error) {
      setResponseMessage({
        type: "error",
        message: `Error al cargar recursos: ${error.message}`,
      });
      setResourcesInLogic([]); 
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

  const handleAddResource = () => {
    handleAddResourceFromLogic();
  };

  const handleDeleteResource = (resource) => {
    handleDeleteResourceFromLogic(resource);
  };

  const handleFileChange = (event) => {
    handleFileChangeFromLogic(event);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage({ type: "", message: "" });

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

    const newTempPdfResources = resources.filter( 
      (res) => String(res.id).startsWith("temp-") && res.tipo === "pdf"
    );
    const newTempUrlResources = resources.filter( 
      (res) => String(res.id).startsWith("temp-") && res.tipo !== "pdf"
    );


    const hasClassDataChanged = () => {
      if (!initialFormDataRef.current) {
        return true;
      }

      const initial = initialFormDataRef.current;
      const current = {
        ...formData,
        duracion_segundos: duracionSegundosToSend,
        es_gratis_vista_previa: formData.es_gratis_vista_previa ? 1 : 0,
      };

      const classKeysToCompare = ['titulo', 'descripcion', 'url_video', 'orden', 'tipo_clase', 'es_gratis_vista_previa'];
      for (const key of classKeysToCompare) {
        const initialValue = String(initial[key]); 
        const currentValue = String(current[key]);

        if (initialValue !== currentValue) {
          return true;
        }
      }

      const initialDurationInSeconds = initial.duracion_valor !== "" && initial.duracion_valor !== null && !isNaN(initial.duracion_valor) ?
        parseInt(initial.duracion_valor) * (initial.durationUnit === 'horas' ? 3600 : initial.durationUnit === 'minutos' ? 60 : 1) : null;

      if (initialDurationInSeconds !== duracionSegundosToSend) {
        return true;
      }

      const getComparableResources = (resourceArray) => {
        return resourceArray
          .filter(res => !String(res.id).startsWith("temp-")) 
          .map(({ id, nombre, tipo, url }) => ({ id, nombre, tipo, url })) 
          .sort((a, b) => (a.id || '').localeCompare(b.id || '')); 
      };

      const initialExistingResources = getComparableResources(initial.recursos || []);
      const currentExistingResources = getComparableResources(resources || []); 
      
      if (JSON.stringify(initialExistingResources) !== JSON.stringify(currentExistingResources)) {
          return true;
      }

      return false;
    };

    const classDataChanged = classToEdit ? hasClassDataChanged() : true;
    const hasNewTempResources = newTempPdfResources.length > 0 || newTempUrlResources.length > 0;
    const hasDeletedResources = deletedResourceIds.length > 0;    
    const resourcesNeedProcessing = hasNewTempResources || hasDeletedResources;

    
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
      recursos: undefined,
    };

    delete dataToSendClass.duracion_valor;

    if (classToEdit) {
      dataToSendClass.id = classToEdit.id;
    }

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
        if (dataClass.status === "success") {
          classOperationSuccessful = true;
          if (!classToEdit && dataClass.id) {
            classId = dataClass.id;
            } else if (!classId && classToEdit) { 
              classId = classToEdit.id; 
          } else if (!classId) {
              hasWarning = true;
              messages.push("Advertencia: No se pudo obtener el ID de la clase para adjuntar nuevos recursos.");
          }
        } else {
          const isNoChangesError = dataClass.message && dataClass.message.includes("No se realizaron cambios");
          
          if (isNoChangesError && resourcesNeedProcessing) {
            classOperationSuccessful = true;
          } else {
            hasError = true;
            messages.push(`Error al ${classToEdit ? "actualizar" : "crear"} la clase: ${dataClass.message || "error desconocido."}`);
            }
        }
      } else {
        classOperationSuccessful = true; 
      }

      if (hasDeletedResources) {
        resourceOperationAttempted = true;
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
            if (data.status === "success") {
              return { success: true, message: `Recurso '${resourceId}' eliminado.` };
            } else {
              return { success: false, message: `Fallo al eliminar recurso '${resourceId}': ${data.message}` };
            }
          } catch (err) {
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
        setDeletedResourceIds([]); 
      }


      if (hasNewTempResources && classId) {
        resourceOperationAttempted = true;
        
        const uploadPromises = [];

        newTempPdfResources.forEach(resource => {
          const resourceFormData = new FormData();
          resourceFormData.append("clase_id", classId);
          resourceFormData.append("nombre", resource.nombre); 
          resourceFormData.append("tipo", "pdf"); 
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
              if (data.status === "success") {
                return { success: true, message: `Recurso PDF '${resource.nombre}' subido.` };
              } else {
                return { success: false, message: `Fallo al subir PDF '${resource.nombre}': ${data.message}` };
              }
            })
            .catch(resourceError => {
              return { success: false, message: `Fallo de red para PDF '${resource.nombre}': ${resourceError.message}` };
            })
          );
        });

        newTempUrlResources.forEach(resource => {
          const dataToSendUrlResource = {
            clase_id: classId,
            nombre: resource.nombre, 
            tipo: resource.tipo, 
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
              if (data.status === "success") {
                return { success: true, message: `Recurso URL '${resource.nombre}' subido.` };
              } else {
                return { success: false, message: `Fallo al subir URL '${resource.nombre}': ${data.message}` };
              }
            })
            .catch(resourceError => {
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

      if ((classOperationSuccessful || !classOperationAttempted) && (resourcesOperationSuccessful || !resourceOperationAttempted)) {
        setTimeout(() => {
          onClassSaved();
          if (!classToEdit) { 
            setFormData(initialFormState);
            setDurationUnit("segundos");
            setResourcesInLogic([]);
            setDeletedResourceIds([]); 
            setNewResourceTitle("");
            setNewResourceFile(null);
            setNewResourceUrl("");
            setNewResourceType("pdf");
            initialFormDataRef.current = { ...initialFormState, durationUnit: "segundos" }; 
          }
        }, 1000);
      }

    } catch (error) {
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
    resources,
    newResourceTitle,
    setNewResourceTitle,
    newResourceFile,
    setNewResourceFile,
    newResourceUrl,
    setNewResourceUrl,
    newResourceType,
    setNewResourceType,
    handleAddResource,
    handleDeleteResource,
    handleFileChange, 
    deletedResourceIds,
    setResources: setResourcesInLogic, 
  };
};

export default useClassFormLogic;