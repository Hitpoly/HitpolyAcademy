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
import VideoPlayerWithControls from "../../../../videos/VideoPlayerWithControls";

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