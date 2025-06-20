// src/components/escuela/curso/components/clases/VideoPreviewModal.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
// Ajusta la ruta según tu estructura real de carpetas.
// ¡Importa VideoPlayerWithControls en lugar de Videopopup!
import VideoPlayerWithControls from "../../../../videos/VideoPlayerWithControls"; 

/**
 * Modal que muestra la previsualización de un video.
 * Ahora usa el componente VideoPlayerWithControls para incluir
 * el reproductor y sus controles por fuera.
 */
const VideoPreviewModal = ({ open, onClose, videoUrl, videoTitle }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">{videoTitle}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent dividers>
      {videoUrl ? (
        // ¡Aquí está el cambio clave! Usa VideoPlayerWithControls.
        // Este componente se encargará de renderizar el video y sus controles.
        <VideoPlayerWithControls videoUrl={videoUrl} />
      ) : (
        <Alert severity="warning">No se pudo cargar el contenido de previsualización.</Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cerrar</Button>
    </DialogActions>
  </Dialog>
);

export default VideoPreviewModal;