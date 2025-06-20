// src/components/clases/ClassForm.jsx
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
  Dialog, // Importamos Dialog
  DialogTitle, // Importamos DialogTitle
  DialogContent, // Importamos DialogContent
  DialogActions, // Importamos DialogActions
  IconButton, // Para el botón de cerrar en el título
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Icono de cerrar

// Añade las nuevas props: open y onClose
const ClassForm = ({
  moduleId,
  classToEdit,
  open, // Nueva prop: para controlar si el modal está abierto
  onClose, // Nueva prop: para cerrar el modal
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
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({
    type: "",
    message: "",
  });
  const [durationUnit, setDurationUnit] = useState("segundos");

  // Cargar datos de la clase si estamos en modo edición o resetear al abrir/cerrar
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
      });
      setDurationUnit(unit);
    } else {
      setFormData(initialFormState);
      setDurationUnit("segundos");
    }
    setResponseMessage({ type: "", message: "" }); // Limpiar mensajes al abrir/cerrar
  }, [classToEdit, open]); // Añadir 'open' como dependencia

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

    const dataToSend = {
      ...formData,
      accion: classToEdit ? "update" : "clase",
      modulo_id: moduleId,
      es_gratis_vista_previa: formData.es_gratis_vista_previa ? 1 : 0,
      orden: parseInt(formData.orden),
      duracion_segundos: duracionSegundosToSend,
    };

    delete dataToSend.duracion_valor;

    if (classToEdit) {
      dataToSend.id = classToEdit.id;
    }

    const apiUrl = classToEdit
      ? "https://apiacademy.hitpoly.com/ajax/editarClasesController.php"
      : "https://apiacademy.hitpoly.com/ajax/subirDatosClaseController.php";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error HTTP al ${
            classToEdit ? "actualizar" : "crear"
          } clase: ${response.status}, mensaje: ${errorText}`
        );
      }

      const data = await response.json();
      if (data.status === "success") {
        setResponseMessage({
          type: "success",
          message:
            data.message ||
            `Clase ${classToEdit ? "actualizada" : "creada"} correctamente.`,
        });
        setTimeout(() => {
          onClassSaved(); // Llama al callback para cerrar el modal y refrescar la lista
        }, 1000);
      } else {
        setResponseMessage({
          type: "error",
          message:
            data.message ||
            `Error al ${classToEdit ? "actualizar" : "crear"} la clase.`,
        });
      }
    } catch (error) {
      setResponseMessage({
        type: "error",
        message: `Error de conexión: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="class-form-dialog-title">
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
            helperText="URL del recurso de la clase (ej. video de YouTube, enlace a un PDF, etc.)"
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
          onClick={handleSubmit} // Asegura el submit
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