// src/components/CourseUploadForm.jsx

import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

// --- Base de Datos Simulada (en memoria) ---
let simulatedDatabase = []; // Aquí se "guardarán" los cursos
let nextCourseId = 1; // Para ids únicos

const saveCourseToSimulatedDB = (courseData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCourse = { ...courseData, id: nextCourseId++ };
      simulatedDatabase.push(newCourse);
      console.log("Curso guardado en la DB simulada:", newCourse);
      console.log("Estado actual de la DB simulada:", simulatedDatabase);
      resolve({ success: true, message: "Curso guardado exitosamente.", course: newCourse });
    }, 1500); // Simula una latencia de red
  });
};

const CourseUploadForm = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descripcion_corta: "",
    descripcion_larga: "",
    url_banner: "",
    url_video_introductorio: "", // Se llenará con el enlace del video
    precio: "",
    moneda: "USD",
    categoria_id: "", // Podría ser un ID o un nombre de categoría
    nivel: "",
    duracion_estimada: "",
    estado: "Borrador",
    profesor_id: "profesor123", // Simulamos un profesor ID fijo por ahora
    fecha_publicacion: "",
    fecha_actualizacion: new Date().toISOString().split("T")[0], // Fecha actual por defecto
  });

  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Manejador para el drag and drop del video
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setVideoUploadError("Solo se permiten archivos de video (mp4, webm, ogg).");
      setVideoFile(null);
      setFormData((prev) => ({ ...prev, url_video_introductorio: "" }));
      return;
    }
    const file = acceptedFiles[0];
    if (file) {
      setVideoFile(file);
      setUploadingVideo(true);
      setVideoUploadError(null);

      // Simulación de carga del video y obtención de la URL
      setTimeout(() => {
        const simulatedVideoUrl = `https://hitpoly.com/videos/curso-${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        setFormData((prev) => ({ ...prev, url_video_introductorio: simulatedVideoUrl }));
        setUploadingVideo(false);
        setSnackbarMessage("Video cargado y URL generada con éxito.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }, 2000); // Simula una carga de 2 segundos
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/ogg": [".ogg"],
    },
    multiple: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSnackbarOpen(false);

    // Validación básica
    if (!formData.titulo || !formData.descripcion_corta || !formData.nivel || !formData.precio) {
      setSnackbarMessage("Por favor, rellena los campos obligatorios (Título, Descripción Corta, Nivel, Precio).");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSubmitLoading(false);
      return;
    }

    // Convertir precio a número
    const dataToSend = {
      ...formData,
      precio: parseFloat(formData.precio),
      fecha_publicacion: formData.estado === "Publicado" ? new Date().toISOString() : null, // Asignar fecha si se publica
    };

    try {
      const response = await saveCourseToSimulatedDB(dataToSend);
      if (response.success) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        // Resetear formulario después de un envío exitoso
        setFormData({
          titulo: "",
          subtitulo: "",
          descripcion_corta: "",
          descripcion_larga: "",
          url_banner: "",
          url_video_introductorio: "",
          precio: "",
          moneda: "USD",
          categoria_id: "",
          nivel: "",
          duracion_estimada: "",
          estado: "Borrador",
          profesor_id: "profesor123",
          fecha_publicacion: "",
          fecha_actualizacion: new Date().toISOString().split("T")[0],
        });
        setVideoFile(null);
      } else {
        setSnackbarMessage("Error al guardar el curso.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setSnackbarMessage("Ocurrió un error inesperado al guardar el curso.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const commonTextFieldProps = {
    fullWidth: true,
    variant: "outlined",
    margin: "normal",
    size: "small", // Para un tamaño más compacto, corporativo
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "calc(100vh - 64px)", // Ajusta si tu header tiene otra altura
        backgroundColor: "#f5f7fa", // Fondo corporativo suave
        py: 4,
        px: { xs: 2, sm: 4, md: 8 },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 900,
          p: { xs: 3, md: 5 },
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            color: "#1a2a4e", // Color principal corporativo
            mb: 4,
            borderBottom: "2px solid #6C4DE2", // Línea decorativa
            pb: 1,
            display: "inline-block", // Para que la línea se ajuste al texto
            mx: "auto", // Centrar la línea
          }}
        >
          Cargar Nuevo Curso
        </Typography>

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mt: 3, mb: 1, color: "#333", fontWeight: 600 }}>
            Información General del Curso
          </Typography>
          <TextField
            label="Título del Curso"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            {...commonTextFieldProps}
          />
          <TextField
            label="Subtítulo del Curso"
            name="subtitulo"
            value={formData.subtitulo}
            onChange={handleChange}
            {...commonTextFieldProps}
          />
          <TextField
            label="Descripción Corta (Máx. 160 caracteres)"
            name="descripcion_corta"
            value={formData.descripcion_corta}
            onChange={handleChange}
            required
            multiline
            rows={2}
            inputProps={{ maxLength: 160 }}
            {...commonTextFieldProps}
          />
          <TextField
            label="Descripción Larga del Curso"
            name="descripcion_larga"
            value={formData.descripcion_larga}
            onChange={handleChange}
            multiline
            rows={5}
            {...commonTextFieldProps}
          />
          <TextField
            label="URL de la Imagen/Banner del Curso"
            name="url_banner"
            value={formData.url_banner}
            onChange={handleChange}
            {...commonTextFieldProps}
          />

          <Typography variant="h6" sx={{ mt: 4, mb: 2, color: "#333", fontWeight: 600 }}>
            Video Introductorio
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mt: 2,
              mb: 3,
              border: `2px dashed ${isDragActive ? "#6C4DE2" : "#ccc"}`,
              backgroundColor: isDragActive ? "#eef2f6" : "#fafafa",
              textAlign: "center",
              cursor: "pointer",
              transition: "border .24s ease-in-out",
              "&:hover": { borderColor: "#6C4DE2" },
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {uploadingVideo ? (
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <CircularProgress color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Subiendo video...
                </Typography>
              </Box>
            ) : videoFile ? (
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />
                <Typography variant="subtitle1" color="success.main" fontWeight="bold">
                  Video Seleccionado: {videoFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  URL simulada: {formData.url_video_introductorio}
                </Typography>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar que el click en el botón reabra el dropzone
                    setVideoFile(null);
                    setFormData((prev) => ({ ...prev, url_video_introductorio: "" }));
                  }}
                  color="error"
                  size="small"
                  startIcon={<HighlightOffIcon />}
                  sx={{ mt: 1 }}
                >
                  Quitar Video
                </Button>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <CloudUploadIcon sx={{ fontSize: 40, color: "#6C4DE2" }} />
                <Typography variant="body1" color="text.secondary">
                  Arrastra y suelta un video aquí, o haz clic para seleccionar.
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Formatos soportados: MP4, WebM, Ogg
                </Typography>
              </Box>
            )}
          </Paper>
          {videoUploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {videoUploadError}
            </Alert>
          )}

          <Typography variant="h6" sx={{ mt: 4, mb: 1, color: "#333", fontWeight: 600 }}>
            Detalles Comerciales y de Categoría
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              type="number"
              inputProps={{ step: "0.01" }}
              required
              {...commonTextFieldProps}
              sx={{ mt: 0 }} // Ajuste de margen para la rejilla
            />
            <FormControl fullWidth margin="normal" size="small" sx={{ mt: 0 }}>
              <InputLabel id="moneda-label">Moneda</InputLabel>
              <Select
                labelId="moneda-label"
                id="moneda"
                name="moneda"
                value={formData.moneda}
                label="Moneda"
                onChange={handleChange}
              >
                <MenuItem value="USD">USD</MenuItem>
                {/* Puedes añadir más monedas */}
              </Select>
            </FormControl>
            <TextField
              label="ID de Categoría (simulado)"
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              {...commonTextFieldProps}
              sx={{ mt: 0 }}
            />
            <FormControl fullWidth margin="normal" size="small" sx={{ mt: 0 }}>
              <InputLabel id="nivel-label" required>
                Nivel
              </InputLabel>
              <Select
                labelId="nivel-label"
                id="nivel"
                name="nivel"
                value={formData.nivel}
                label="Nivel"
                onChange={handleChange}
                required
              >
                <MenuItem value="Principiante">Principiante</MenuItem>
                <MenuItem value="Intermedio">Intermedio</MenuItem>
                <MenuItem value="Avanzado">Avanzado</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Duración Estimada (ej. '10 horas', '4 semanas')"
              name="duracion_estimada"
              value={formData.duracion_estimada}
              onChange={handleChange}
              {...commonTextFieldProps}
              sx={{ mt: 0 }}
            />
            <FormControl fullWidth margin="normal" size="small" sx={{ mt: 0 }}>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                id="estado"
                name="estado"
                value={formData.estado}
                label="Estado"
                onChange={handleChange}
              >
                <MenuItem value="Borrador">Borrador</MenuItem>
                <MenuItem value="Publicado">Publicado</MenuItem>
                <MenuItem value="Archivado">Archivado</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5, gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#6C4DE2", // Color corporativo de HitPoly
                "&:hover": { backgroundColor: "#5a3bbd" },
                py: 1.2,
                px: 4,
                borderRadius: "8px",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(108, 77, 226, 0.3)",
              }}
              disabled={submitLoading || uploadingVideo}
            >
              {submitLoading ? <CircularProgress size={24} color="inherit" /> : "Guardar Curso"}
            </Button>
          </Box>
        </form>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default CourseUploadForm;