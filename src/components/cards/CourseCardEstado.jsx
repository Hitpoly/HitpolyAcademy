import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";

const CourseCardEstado = ({
  course,
  onStatusChange,
  onEditClick,
  onDeleteClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const { curso, marcas } = course;

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleStatusChangeClick = (newStatus) => {
    onStatusChange(curso.id, newStatus);
    handleMenuClose();
  };

  const handleEditCourseClick = () => {
    onEditClick(course);
    handleMenuClose();
  };

  const handleDeleteCourseClick = () => {
    onDeleteClick(curso.id);
    handleMenuClose();
  };

  const handleManageModules = () => {
    navigate(`/cursos/${curso.id}/modulos`);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (String(status).trim().toLowerCase()) {
      case "publicado":
        return "success";
      case "borrador":
        return "info";
      case "archivado":
        return "error";
      default:
        return "default";
    }
  };

  if (!curso) return null;

  return (
    <Card
      sx={{
        width: 370,
        margin: "auto",
        position: "relative",
        display: "flex",
        height: 550,
        flexDirection: "column",
      }}
    >
      <Box sx={{ height: "40%", width: "100%", overflow: "hidden" }}>
        <CardMedia
          component="img"
          image={
            curso.portada_targeta ||
            "https://via.placeholder.com/345x180?text=No+Image"
          }
          alt={curso.titulo}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover", // Recorta y adapta
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Chip label={curso.nivel} color="secondary" size="small" />
          <Chip label={curso.estado} color={getStatusColor(curso.estado)} size="small" />
        </Box>

        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            fontWeight: "bold",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mb: 1,
          }}
        >
          {curso.titulo}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mb: 1,
          }}
        >
          {curso.subtitulo}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Duración: {curso.duracion_estimada}
        </Typography>
        <Typography variant="body1" color="primary" sx={{ mt: 1, fontWeight: "bold" }}>
          {curso.precio} {curso.moneda}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          Publicado: {new Date(curso.fecha_publicacion).toLocaleDateString()}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleManageModules}
          >
            Administrar
          </Button>

          <Button
            aria-controls="course-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            variant="outlined"
            size="small"
            endIcon={<MoreVertIcon />}
          >
            Más
          </Button>

          <Menu
            id="course-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{ "aria-labelledby": "basic-button" }}
          >
            {curso.estado !== "publicado" && (
              <MenuItem onClick={() => handleStatusChangeClick("publicado")}>
                Publicar
              </MenuItem>
            )}
            {curso.estado !== "borrador" && (
              <MenuItem onClick={() => handleStatusChangeClick("borrador")}>
                Convertir a Borrador
              </MenuItem>
            )}
            {curso.estado !== "archivado" && (
              <MenuItem onClick={() => handleStatusChangeClick("archivado")}>
                Archivar
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleEditCourseClick}>Editar Curso</MenuItem>
            <MenuItem onClick={handleDeleteCourseClick} sx={{ color: "error.main" }}>
              Eliminar Curso
            </MenuItem>
          </Menu>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCardEstado;
