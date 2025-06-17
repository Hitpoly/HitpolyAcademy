// src/components/CourseCardEstado.jsx
import React, { useState } from 'react';
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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom'; // ¡Importa useNavigate!

const CourseCardEstado = ({ course, onStatusChange, onEditClick, onDeleteClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Desestructuramos el objeto 'course' para acceder a 'curso' y 'marcas'
  // Si 'course' es el objeto { curso: {...}, marcas: [...] }, entonces:
  const { curso, marcas } = course; // Obtenemos el objeto 'curso' y el array 'marcas'

  console.log("COURSE EN ESTADO CARD", course);
  

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChangeClick = (newStatus) => {
    onStatusChange(curso.id, newStatus); // Usamos curso.id para el ID
    handleMenuClose();
  };

  const handleEditCourseClick = () => {
    // Cuando editas, a menudo necesitas pasar el objeto 'curso' completo, no el 'item' anidado
    onEditClick(course); // Pasamos solo el objeto 'curso' anidado
    handleMenuClose();
  };

  const handleDeleteCourseClick = () => {
    onDeleteClick(curso.id); // Usamos curso.id para el ID
    handleMenuClose();
  };

  const handleManageModules = () => {
    // La ruta es /admin/cursos/:courseId/modulos (ver App.jsx)
    navigate(`/cursos/${curso.id}/modulos`); // Usamos curso.id para la navegación
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (String(status).trim().toLowerCase()) { // Normaliza el estado para la comparación
      case 'publicado': return 'success';
      case 'borrador': return 'info';
      case 'archivado': return 'error';
      default: return 'default';
    }
  };

  // Verificación para asegurar que 'curso' existe antes de renderizar
  if (!curso) {
    console.warn("CourseCardEstado recibió un objeto 'course' sin la propiedad 'curso' anidada.");
    return null; // O un componente de placeholder si prefieres
  }

  return (
    <Card sx={{ maxWidth: 345, margin: 'auto', position: 'relative' }}>
      <CardMedia
        component="img"
        height="140"
        image={curso.url_banner || 'https://via.placeholder.com/345x140?text=No+Image'} // Accede a curso.url_banner
        alt={curso.titulo} // Accede a curso.titulo
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip label={curso.nivel} color="secondary" size="small" /> {/* Accede a curso.nivel */}
          <Chip label={curso.estado} color={getStatusColor(curso.estado)} size="small" /> {/* Accede a curso.estado */}
        </Box>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {curso.titulo} {/* Accede a curso.titulo */}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {curso.subtitulo} {/* Accede a curso.subtitulo */}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          **Duración:** {curso.duracion_estimada} {/* Accede a curso.duracion_estimada */}
        </Typography>
        <Typography variant="body1" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
          {curso.precio} {curso.moneda} {/* Accede a curso.precio y curso.moneda */}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          Publicado: {new Date(curso.fecha_publicacion).toLocaleDateString()} {/* Accede a curso.fecha_publicacion */}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
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
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {curso.estado !== 'publicado' && ( // Accede a curso.estado
              <MenuItem onClick={() => handleStatusChangeClick('publicado')}>Publicar</MenuItem>
            )}
            {curso.estado !== 'borrador' && ( // Accede a curso.estado
              <MenuItem onClick={() => handleStatusChangeClick('borrador')}>Convertir a Borrador</MenuItem>
            )}
            {curso.estado !== 'archivado' && ( // Accede a curso.estado
              <MenuItem onClick={() => handleStatusChangeClick('archivado')}>Archivar</MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleEditCourseClick}>
              Editar Curso
            </MenuItem>
            <MenuItem onClick={handleDeleteCourseClick} sx={{ color: 'error.main' }}>
              Eliminar Curso
            </MenuItem>
          </Menu>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCardEstado;