import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ClassForm = ({
  moduleId,
  classToEdit,
  open,
  onClose,
  onClassSaved,
  existingClassOrders = [],
}) => {
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
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("enlace");
  const [newResourceFile, setNewResourceFile] = useState(null);

  const resourceTypes = ["pdf", "enlace", "zip", "codigo"];

  useEffect(() => {
    if (classToEdit) {
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

      const { value, unit } = convertSecondsToUnits(classToEdit.duracion_segundos);

      setFormData({
        titulo: classToEdit.titulo || "",
        descripcion: classToEdit.descripcion || "",
        url_video: classToEdit.url_video || "",
        duracion_valor: value,
        orden: classToEdit.orden || "",
        tipo_clase: classToEdit.tipo_clase || "video",
        es_gratis_vista_previa: classToEdit.es_gratis_vista_previa === 1,
        recursos: [], // Siempre carga recursos de la API, no los del classToEdit directamente
      });
      setDurationUnit(unit);
      fetchResourcesForClass(classToEdit.id);
    } else {
      setFormData(initialFormState);
      setDurationUnit("segundos");
    }
    setResponseMessage({ type: "", message: "" });
    setNewResourceUrl("");
    setNewResourceTitle("");
    setNewResourceType("enlace");
    setNewResourceFile(null);
  }, [classToEdit, open]);

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
        console.log("Filtered resources for this class:", classResources);
        setFormData((prevData) => ({
          ...prevData,
          recursos: classResources,
        }));
      } else {
        setResponseMessage({
          type: "warning",
          message:
            data.message || "No se pudieron cargar los recursos existentes de la clase.",
        });
        setFormData((prevData) => ({ ...prevData, recursos: [] }));
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResponseMessage({
        type: "error",
        message: `Error al cargar recursos: ${error.message}`,
      });
      setFormData((prevData) => ({ ...prevData, recursos: [] }));
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

    if (newResourceType === "pdf" && !newResourceFile) {
      setResponseMessage({
        type: "error",
        message: "Por favor, selecciona un archivo PDF para subir.",
      });
      return;
    }

    if (newResourceType !== "pdf" && !newResourceUrl.trim()) {
      setResponseMessage({
        type: "error",
        message: "Por favor, ingresa la URL para el nuevo recurso.",
      });
      return;
    }

    const newResource = {
      titulo: newResourceTitle.trim(),
      tipo: newResourceType,
      url: newResourceType === "pdf" ? "" : newResourceUrl.trim(),
      file: newResourceType === "pdf" ? newResourceFile : null,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID temporal para recursos no guardados
      clase_id: null, // clase_id será nulo hasta que la clase se cree/actualice y tengamos un ID
    };

    setFormData((prevData) => ({
      ...prevData,
      recursos: [...prevData.recursos, newResource],
    }));

    setNewResourceTitle("");
    setNewResourceUrl("");
    setNewResourceType("enlace");
    setNewResourceFile(null);
    setResponseMessage({ type: "", message: "" });
    console.log("Recurso añadido localmente:", newResource);
  };

  const handleDeleteResource = async (resourceToDelete) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este recurso?")) {
      return;
    }

    // Si el recurso ya tiene un ID real (no temporal), intentar eliminar de la DB
    if (resourceToDelete.id && !String(resourceToDelete.id).startsWith("temp-")) {
      setLoading(true);
      console.log("Intentando eliminar recurso de la DB:", resourceToDelete);
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/eliminarRecursoController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "delete", id: resourceToDelete.id }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log("Response from eliminarRecursoController.php:", data);
        if (data.status === "success") {
          setResponseMessage({
            type: "success",
            message: "Recurso eliminado exitosamente de la base de datos.",
          });
          setFormData((prevData) => ({
            ...prevData,
            recursos: prevData.recursos.filter((res) => res.id !== resourceToDelete.id),
          }));
        } else {
          setResponseMessage({
            type: "error",
            message: data.message || "Error al eliminar el recurso en la base de datos.",
          });
        }
      } catch (err) {
        console.error("Error deleting resource:", err);
        setResponseMessage({
          type: "error",
          message: `No se pudo eliminar el recurso: ${err.message}`,
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Si el recurso es temporal, solo eliminarlo del estado local
      setFormData((prevData) => ({
        ...prevData,
        recursos: prevData.recursos.filter((res) => res.id !== resourceToDelete.id),
      }));
      setResponseMessage({
        type: "info",
        message: "Recurso temporal eliminado localmente.",
      });
      console.log("Recurso temporal eliminado localmente:", resourceToDelete);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage({ type: "", message: "" });

    if (!formData.titulo || !formData.orden || !formData.url_video) {
      setResponseMessage({
        type: "error",
        message:
          "Por favor, rellena los campos obligatorios (Título, URL de Video/Contenido, Orden).",
      });
      setLoading(false);
      return;
    }
    if (isNaN(parseInt(formData.orden))) {
      setResponseMessage({
        type: "error",
        message: "El orden debe ser un número.",
      });
      setLoading(false);
      return;
    }

    const currentOrder = parseInt(formData.orden);
    const ordersToCheck = classToEdit
      ? existingClassOrders.filter((order) => order !== parseInt(classToEdit.orden))
      : existingClassOrders;

    if (ordersToCheck.includes(currentOrder)) {
      setResponseMessage({
        type: "error",
        message: `El orden '${currentOrder}' ya existe para otra clase en este módulo. Por favor, elige un orden diferente.`,
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

    // Filtrar recursos: solo enviar los existentes (no temporales) con la clase
    const existingResources = formData.recursos.filter(
      (res) => res.id && !String(res.id).startsWith("temp-")
    );
    // Estos son los recursos que necesitamos procesar después de que la clase se guarde
    const newOrTempResources = formData.recursos.filter(
      (res) => String(res.id).startsWith("temp-")
    );

    const dataToSendClass = {
      ...formData,
      accion: classToEdit ? "update" : "clase",
      modulo_id: moduleId,
      es_gratis_vista_previa: formData.es_gratis_vista_previa ? 1 : 0,
      orden: parseInt(formData.orden),
      duracion_segundos: duracionSegundosToSend,
      // **IMPORTANTE**: Solo enviar recursos existentes junto con los datos de la clase.
      // Los recursos nuevos/temporales se gestionarán después de obtener el ID de la clase.
      recursos: existingResources.map(({ id, titulo, url, tipo }) => ({
        id,
        titulo,
        url,
        tipo,
        clase_id: classToEdit ? classToEdit.id : null, // Asegura que los existentes tengan el clase_id
      })),
    };

    delete dataToSendClass.duracion_valor; // Eliminar propiedad temporal

    if (classToEdit) {
      dataToSendClass.id = classToEdit.id;
    }

    console.log("Datos de la clase enviados a la API (primera llamada):", dataToSendClass);

    const apiUrlClass = classToEdit
      ? "https://apiacademy.hitpoly.com/ajax/editarClasesController.php"
      : "https://apiacademy.hitpoly.com/ajax/subirDatosClaseController.php";

    let classId = classToEdit ? classToEdit.id : null;
    let classSavedSuccessfully = false;
    let overallMessage = "";

    try {
      // 1. Guardar/Actualizar la Clase (sin nuevos recursos adjuntos)
      console.log(`Intentando ${classToEdit ? "actualizar" : "crear"} clase...`);
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
      console.log("Respuesta de la API de clase:", dataClass);

      if (dataClass.status === "success") {
        classSavedSuccessfully = true;
        overallMessage = dataClass.message || `Clase ${classToEdit ? "actualizada" : "creada"} correctamente.`;

        if (!classToEdit && dataClass.id) {
          classId = dataClass.id;
          console.log("ID de clase recién creada:", classId);
        } else if (!classId) {
          // Esto es una advertencia si editamos y por alguna razón no tenemos el ID
          console.warn("No se pudo obtener el ID de la clase. La subida de nuevos recursos podría fallar.");
          overallMessage += ". Advertencia: No se pudo obtener el ID de la clase para adjuntar nuevos recursos.";
          setResponseMessage({ type: "warning", message: overallMessage });
          setLoading(false);
          return; // Detener el proceso si no hay classId para adjuntar recursos
        }

        // 2. Si hay recursos nuevos o temporales, subirlos ahora con el clase_id
        if (newOrTempResources.length > 0 && classId) {
          console.log(`Intentando subir ${newOrTempResources.length} nuevos recursos...`);
          const uploadResourcePromises = newOrTempResources.map(async (resource) => {
            const resourceFormData = new FormData();
            resourceFormData.append("clase_id", classId); // ¡Asignar el ID de la clase aquí!
            resourceFormData.append("nombre", resource.titulo);
            resourceFormData.append("tipo", resource.tipo);

            // Si es un archivo (PDF, ZIP), añadir el archivo
            if (resource.file) {
              resourceFormData.append("archivo", resource.file);
            } else {
              // Si no es un archivo (enlace, código), añadir la URL
              resourceFormData.append("url", resource.url);
            }

            console.log(`Preparando subida de recurso "${resource.titulo}" (tipo: ${resource.tipo})...`);
            try {
              const resourceResponse = await fetch(
                "https://apiacademy.hitpoly.com/ajax/recursosClasesController.php", // Endpoint para recursos
                {
                  method: "POST",
                  body: resourceFormData, // FormData para archivos o datos de recurso
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
            overallMessage += ". Algunos recursos adicionales no se pudieron subir correctamente: " + failedResources.map(f => f.message).join("; ");
            setResponseMessage({ type: "warning", message: overallMessage });
            setLoading(false);
          } else {
            overallMessage += ". Todos los recursos adicionales subidos exitosamente.";
            setResponseMessage({ type: "success", message: overallMessage });
            setTimeout(() => {
                onClassSaved(); // Cerrar modal y refrescar si todo fue bien
            }, 1000);
          }
        } else {
            // No hay recursos nuevos para subir, la operación de la clase ya fue exitosa
            setResponseMessage({ type: "success", message: overallMessage });
            setTimeout(() => {
                onClassSaved(); // Cerrar modal y refrescar si todo fue bien
            }, 1000);
        }

      } else {
        setResponseMessage({
          type: "error",
          message:
            dataClass.message || `Error al ${classToEdit ? "actualizar" : "crear"} la clase.`,
        });
        console.error("Error al guardar/actualizar la clase:", dataClass.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error general en handleSubmit:", error);
      setResponseMessage({
        type: "error",
        message: `Error de conexión: ${error.message}`,
      });
      setLoading(false);
    }
    // El finally se elimina o se ajusta para que el loading se maneje dentro de los bloques success/error
    // y el cierre del modal solo ocurra cuando todo está completado o hay un error definitivo
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="class-form-dialog-title" maxWidth="md" fullWidth>
      <DialogTitle id="class-form-dialog-title">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">
            {classToEdit ? "Editar Clase" : "Crear Nueva Clase"}
          </Typography>
          <IconButton onClick={onClose} aria-label="cerrar">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          {responseMessage.message && (
            <Alert severity={responseMessage.type} sx={{ mb: 2 }}>
              {responseMessage.message}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Título de la Clase"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Descripción de la Clase"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="URL del Video/Contenido"
            name="url_video"
            value={formData.url_video}
            onChange={handleChange}
            margin="normal"
            required
            helperText="URL del recurso principal de la clase (video, PDF, etc.)"
          />
          <FormControl fullWidth margin="normal">
            <TextField
              label="Duración"
              name="duracion_valor"
              type="number"
              value={formData.duracion_valor}
              onChange={handleChange}
              inputProps={{ min: "0" }}
              helperText="Duración estimada de la clase"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Select
                      value={durationUnit}
                      onChange={handleDurationUnitChange}
                      sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
                    >
                      <MenuItem value="segundos">Segundos</MenuItem>
                      <MenuItem value="minutos">Minutos</MenuItem>
                      <MenuItem value="horas">Horas</MenuItem>
                    </Select>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <TextField
            fullWidth
            label="Orden"
            name="orden"
            type="number"
            value={formData.orden}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: "1" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.es_gratis_vista_previa}
                onChange={handleChange}
                name="es_gratis_vista_previa"
                color="primary"
              />
            }
            label="Es Clase de Vista Previa Gratuita"
            sx={{ mt: 1 }}
          />

          <Box sx={{ mt: 3, mb: 2, borderTop: "1px solid #eee", pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recursos Adicionales
            </Typography>
            {formData.recursos.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Recursos actuales:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.recursos.map((resource, index) => (
                    <Chip
                      key={resource.id || `new-${index}`}
                      label={`${resource.titulo} (${resource.tipo || "desconocido"})`}
                      onDelete={() => handleDeleteResource(resource)}
                      deleteIcon={<DeleteIcon />}
                      color={resource.tipo === "pdf" ? "secondary" : "primary"}
                      variant="outlined"
                      onClick={() => resource.url && window.open(resource.url, "_blank")}
                      sx={{ cursor: resource.url ? "pointer" : "default" }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              label="Título del Nuevo Recurso"
              value={newResourceTitle}
              onChange={(e) => setNewResourceTitle(e.target.value)}
              margin="normal"
              size="small"
            />
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="new-resource-type-label">Tipo de Recurso</InputLabel>
              <Select
                labelId="new-resource-type-label"
                value={newResourceType}
                onChange={(e) => setNewResourceType(e.target.value)}
                label="Tipo de Recurso"
              >
                {resourceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {newResourceType === "pdf" ? (
              <Box sx={{ mt: 2, mb: 2 }}>
                <input
                  accept=".pdf"
                  style={{ display: "none" }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    {newResourceFile ? newResourceFile.name : "Seleccionar Archivo PDF"}
                  </Button>
                </label>
                {newResourceFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, ml: 1 }}>
                    Archivo seleccionado: {newResourceFile.name}
                  </Typography>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 0.5, ml: 1 }}>
                  Solo archivos .pdf
                </Typography>
              </Box>
            ) : (
              <TextField
                fullWidth
                label="URL del Nuevo Recurso"
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                margin="normal"
                size="small"
                helperText="Enlace al recurso (ej. documento, imagen, enlace externo)"
              />
            )}
            <Button
              onClick={handleAddResource}
              disabled={
                !newResourceTitle.trim() ||
                (newResourceType === "pdf" && !newResourceFile) ||
                (newResourceType !== "pdf" && !newResourceUrl.trim())
              }
              startIcon={<AddIcon />}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Añadir Recurso a la Lista
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : classToEdit ? (
            "Guardar Cambios"
          ) : (
            "Crear Clase"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassForm;