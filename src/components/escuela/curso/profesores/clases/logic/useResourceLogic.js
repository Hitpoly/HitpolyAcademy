// useResourceLogic.js
import { useState, useEffect } from "react"; // Ya no necesitamos useRef si eliminamos hasResourceListChanged

const useResourceLogic = (setGlobalResponseMessage) => {
  const [resources, setResources] = useState([]);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceFile, setNewResourceFile] = useState(null);
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("pdf"); // 'pdf' o 'url'
  const [deletedResourceIds, setDeletedResourceIds] = useState([]);
  const [resourceResponseMessage, setResourceResponseMessage] = useState({
    type: "",
    message: "",
  });

  // El useEffect para initialResourcesRef.current ya no es necesario aquí.
  // La lógica de comparación de recursos se maneja en useClassFormLogic.js.


  const handleFileChange = (e) => {
    setNewResourceFile(e.target.files[0]);
  };

  const handleAddResource = () => {
    if (!newResourceTitle.trim()) {
      setResourceResponseMessage({
        type: "error",
        message: "Por favor, ingresa un título para el nuevo recurso.",
      });
      return;
    }

    let newResource = null;

    if (newResourceType === "pdf") {
      if (!newResourceFile) {
        setResourceResponseMessage({
          type: "error",
          message: "Por favor, selecciona un archivo PDF para subir.",
        });
        return;
      }
      newResource = {
        nombre: newResourceTitle.trim(), // CAMBIADO: usar 'nombre'
        tipo: "pdf",
        url: "", // La URL real se obtendrá después de la subida
        file: newResourceFile,
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID temporal para recursos nuevos
        clase_id: null,
      };
    } else if (newResourceType === "url") {
      if (!newResourceUrl.trim()) {
        setResourceResponseMessage({
          type: "error",
          message: "Por favor, ingresa una URL para el nuevo recurso.",
        });
        return;
      }
      try {
        new URL(newResourceUrl.trim()); // Validación básica de URL
      } catch (e) {
        setResourceResponseMessage({
          type: "error",
          message: "Por favor, ingresa una URL válida.",
        });
        return;
      }
      newResource = {
        nombre: newResourceTitle.trim(), // CAMBIADO: usar 'nombre'
        tipo: "enlace", // Revisa si tu backend espera 'url' o 'enlace', lo mantengo como estaba.
        url: newResourceUrl.trim(),
        file: null, // No hay archivo para recursos de URL
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID temporal
        clase_id: null,
      };
    }

    if (newResource) {
      setResources((prevResources) => [...prevResources, newResource]);
      setNewResourceTitle("");
      setNewResourceFile(null);
      setNewResourceUrl("");
      setResourceResponseMessage({ type: "", message: "" }); // Limpia el mensaje de error/éxito al añadir
      console.log(`Recurso ${newResourceType} añadido localmente:`, newResource); // LOG
    }
  };

  const handleDeleteResource = async (resourceToDelete) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este recurso?")) {
      return;
    }

    // Si el recurso tiene un ID real (no es temporal)
    if (resourceToDelete.id && !String(resourceToDelete.id).startsWith("temp-")) {
      setDeletedResourceIds((prev) => [...prev, resourceToDelete.id]); // Márcalo para eliminación en el backend
      setResources((prevResources) =>
        prevResources.filter((res) => res.id !== resourceToDelete.id) // Elimínalo visualmente
      );
      setResourceResponseMessage({
        type: "info",
        message: "Recurso marcado para eliminación. Los cambios se aplicarán al guardar la clase.",
      });
      console.log("Recurso existente marcado para eliminación:", resourceToDelete); // LOG
    } else {
      // Si es un recurso temporal (recién añadido y aún no guardado)
      setResources((prevResources) =>
        prevResources.filter((res) => res.id !== resourceToDelete.id) // Solo elimínalo localmente
      );
      setResourceResponseMessage({
        type: "info",
        message: "Recurso temporal eliminado localmente.",
      });
      console.log("Recurso temporal eliminado localmente:", resourceToDelete); // LOG
    }
  };

  return {
    resources,
    setResources, // Exporta el setter directo para que useClassFormLogic pueda establecer los recursos iniciales
    newResourceTitle,
    setNewResourceTitle,
    newResourceFile,
    setNewResourceFile,
    newResourceUrl,
    setNewResourceUrl,
    newResourceType,
    setNewResourceType,
    deletedResourceIds,
    setDeletedResourceIds, // Necesario para que useClassFormLogic pueda reiniciarlo
    handleAddResource,
    handleFileChange, // Exporta handleFileChange
    handleDeleteResource,
    resourceResponseMessage,
    setResourceResponseMessage,
  };
};

export default useResourceLogic;