// ClassForm.js
import React from "react";
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
import LinkIcon from '@mui/icons-material/Link';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';


import useClassFormLogic from "./logic/useClassFormLogic";

const ClassForm = ({
  moduleId,
  classToEdit,
  open,
  onClose,
  onClassSaved,
  existingClassOrders = [],
}) => {
  const {
    formData,
    loading,
    responseMessage,
    durationUnit,
    newResourceTitle,
    newResourceFile,
    newResourceUrl,
    newResourceType,
    handleChange,
    handleDurationUnitChange,
    handleFileChange,
    handleAddResource,
    handleDeleteResource,
    handleSubmit,
    setResponseMessage,
    setNewResourceTitle,
    setNewResourceFile,
    setNewResourceUrl,
    setNewResourceType,
  } = useClassFormLogic(moduleId, classToEdit, onClassSaved, existingClassOrders);

  React.useEffect(() => {
    if (!open) {
      setResponseMessage({ type: "", message: "" });
      setNewResourceTitle("");
      setNewResourceFile(null);
      setNewResourceUrl("");
      setNewResourceType("pdf");
    }
  }, [open, setResponseMessage, setNewResourceTitle, setNewResourceFile, setNewResourceUrl, setNewResourceType]);

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
            label="URL del Video/Contenido Principal"
            name="url_video"
            value={formData.url_video}
            onChange={handleChange}
            margin="normal"
            required
            helperText="URL del recurso principal de la clase (video de YouTube, Vimeo, etc.)"
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
                      label={`${resource.nombre} (${resource.tipo || "desconocido"})`}
                      onDelete={() => handleDeleteResource(resource)}
                      deleteIcon={<DeleteIcon />}
                      color={resource.tipo === "pdf" ? "secondary" : "primary"}
                      icon={resource.tipo === "pdf" ? <InsertDriveFileIcon  /> : <LinkIcon />}
                      variant="outlined"
                      onClick={() => resource.url && window.open(resource.url, "_blank")}
                      sx={{ cursor: "pointer" }} // El cursor de puntero siempre es apropiado si es cliqueable
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
              <InputLabel id="resource-type-select-label">Tipo de Recurso</InputLabel>
              <Select
                labelId="resource-type-select-label"
                id="resource-type-select"
                value={newResourceType}
                label="Tipo de Recurso"
                onChange={(e) => setNewResourceType(e.target.value)}
              >
                <MenuItem value="pdf">Archivo PDF</MenuItem>
                <MenuItem value="url">Enlace/URL</MenuItem>
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
                    Archivo seleccionado: {newResourceFile.name} {/* CAMBIO AQUÍ: newResourceFile.name */}
                  </Typography>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 0.5, ml: 1 }}>
                  Solo archivos .pdf
                </Typography>
              </Box>
            ) : (
              <TextField
                fullWidth
                label="URL del Recurso"
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                margin="normal"
                size="small"
                helperText="Introduce la URL completa del recurso (ej: https://ejemplo.com/documento.pdf o https://youtube.com/watch?v=...) "
              />
            )}

            <Button
              onClick={handleAddResource}
              disabled={
                !newResourceTitle.trim() ||
                (newResourceType === "pdf" && !newResourceFile) ||
                (newResourceType === "url" && !newResourceUrl.trim())
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
          {loading ? <CircularProgress size={24} /> : classToEdit ? "Guardar Cambios" : "Crear Clase"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassForm;