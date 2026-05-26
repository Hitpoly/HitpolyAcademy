// src/components/modulos/ModuleForm.jsx
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle, 
  DialogContent, 
  DialogActions, 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModuleForm = ({
  courseId,
  moduleToEdit,
  open,
  onClose, 
  onModuleSaved,
  existingOrders = [],
}) => {
  const initialFormState = {
    titulo: "",
    descripcion: "",
    orden: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    if (moduleToEdit) {
      setFormData({
        titulo: moduleToEdit.titulo || "",
        descripcion: moduleToEdit.descripcion || "",
        orden: moduleToEdit.orden || "",
      });
    } else {
      setFormData(initialFormState);
    }
    setResponseMessage({ type: "", message: "" });
  }, [moduleToEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage({ type: "", message: "" });

    if (!formData.titulo || !formData.orden) {
      setResponseMessage({
        type: "error",
        message: "Por favor, rellena el título y el orden del módulo.",
      });
      setLoading(false);
      return;
    }
    const parsedOrder = parseInt(formData.orden);
    if (isNaN(parsedOrder) || parsedOrder <= 0) {
      setResponseMessage({
        type: "error",
        message: "El orden debe ser un número entero positivo.",
      });
      setLoading(false);
      return;
    }

    const isOrderTaken = existingOrders.some(
      (order) =>
        order === parsedOrder &&
        (!moduleToEdit || order !== moduleToEdit.orden)
    );

    if (isOrderTaken) {
      setResponseMessage({
        type: "error",
        message: `El orden ${parsedOrder} ya está en uso. Por favor, elige otro.`,
      });
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      accion: moduleToEdit ? "update" : "modulo",
      curso_id: courseId,
      orden: parsedOrder,
    };

    if (moduleToEdit) {
      dataToSend.id = moduleToEdit.id;
    }

    const apiUrl = moduleToEdit
      ? "https://apiacademy.hitpoly.com/ajax/editarModulosController.php"
      : "https://apiacademy.hitpoly.com/ajax/cargarModulosCursosController.php";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error HTTP al ${moduleToEdit ? "actualizar" : "crear"} módulo: ${
            response.status
          }, mensaje: ${errorText}`
        );
      }

      const data = await response.json();
      if (data.status === "success") {
        setResponseMessage({
          type: "success",
          message:
            data.message ||
            `Módulo ${moduleToEdit ? "actualizado" : "creado"} correctamente.`,
        });
        setTimeout(() => {
          onModuleSaved(); 
        }, 1000);
      } else {
        setResponseMessage({
          type: "error",
          message:
            data.message ||
            `Error al ${moduleToEdit ? "actualizar" : "crear"} el módulo.`,
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
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">
            {moduleToEdit ? "Editar Módulo" : "Crear Nuevo Módulo"}
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
            label="Título del Módulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Descripción del Módulo"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
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
          ) : moduleToEdit ? (
            "Guardar Cambios"
          ) : (
            "Crear Módulo"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleForm;