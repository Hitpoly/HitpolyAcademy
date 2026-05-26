import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const ClassCard = ({ classItem, onEdit, onDelete, onPreview }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds))
      return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}s`;
  };

  return (
    <Card
      sx={{
        width: "100%",
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Orden: {classItem.orden}
            </Typography>
            <Typography variant="h6" component="div">
              {classItem.titulo}
            </Typography>
            <Typography
              sx={{
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
              color="text.secondary"
            >
              {classItem.descripcion || "Sin descripción."}
            </Typography>
          </Box>
          <Button
            aria-controls="class-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <MoreVertIcon />
          </Button>
          <Menu
            id="class-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              onClick={() => {
                onEdit(classItem);
                handleMenuClose();
              }}
            >
              Editar Clase
            </MenuItem>
            {classItem.url_video && (
              <MenuItem
                onClick={() => {
                  if (onPreview) onPreview(classItem);
                  handleMenuClose();
                }}
              >
                <PlayCircleOutlineIcon sx={{ mr: 1 }} />
                Previsualizar
              </MenuItem>
            )}
            <Divider />
            <MenuItem
              onClick={() => {
                onDelete(classItem.id);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              Eliminar Clase
            </MenuItem>
          </Menu>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Duración: **{formatDuration(classItem.duracion_segundos)}**
        </Typography>
        <Chip
          label={
            classItem.es_gratis_vista_previa
              ? "Vista Previa Gratuita"
              : "Contenido Premium"
          }
          color={classItem.es_gratis_vista_previa ? "info" : "secondary"}
          size="small"
        />
      </Box>
    </Card>
  );
};

export default ClassCard;