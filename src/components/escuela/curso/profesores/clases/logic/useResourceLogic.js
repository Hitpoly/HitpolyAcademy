import { useState, useEffect } from "react"; 

const useResourceLogic = (setGlobalResponseMessage) => {
  const [resources, setResources] = useState([]);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceFile, setNewResourceFile] = useState(null);
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("pdf"); 
  const [deletedResourceIds, setDeletedResourceIds] = useState([]);
  const [resourceResponseMessage, setResourceResponseMessage] = useState({
    type: "",
    message: "",
  });

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
        nombre: newResourceTitle.trim(), 
        tipo: "pdf",
        url: "",
        file: newResourceFile,
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        new URL(newResourceUrl.trim());
      } catch (e) {
        setResourceResponseMessage({
          type: "error",
          message: "Por favor, ingresa una URL válida.",
        });
        return;
      }
      newResource = {
        nombre: newResourceTitle.trim(),
        tipo: "enlace",
        url: newResourceUrl.trim(),
        file: null, 
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        clase_id: null,
      };
    }

    if (newResource) {
      setResources((prevResources) => [...prevResources, newResource]);
      setNewResourceTitle("");
      setNewResourceFile(null);
      setNewResourceUrl("");
      setResourceResponseMessage({ type: "", message: "" }); 
      }
  };

  const handleDeleteResource = async (resourceToDelete) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este recurso?")) {
      return;
    }

    if (resourceToDelete.id && !String(resourceToDelete.id).startsWith("temp-")) {
      setDeletedResourceIds((prev) => [...prev, resourceToDelete.id]); 
      setResources((prevResources) =>
        prevResources.filter((res) => res.id !== resourceToDelete.id) 
      );
      setResourceResponseMessage({
        type: "info",
        message: "Recurso marcado para eliminación. Los cambios se aplicarán al guardar la clase.",
      });
      } else {
      setResources((prevResources) =>
        prevResources.filter((res) => res.id !== resourceToDelete.id)
      );
      setResourceResponseMessage({
        type: "info",
        message: "Recurso temporal eliminado localmente.",
      });
      }
  };

  return {
    resources,
    setResources,
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
    handleAddResource,
    handleFileChange,
    handleDeleteResource,
    resourceResponseMessage,
    setResourceResponseMessage,
  };
};

export default useResourceLogic;