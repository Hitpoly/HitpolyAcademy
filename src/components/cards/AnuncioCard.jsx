// src/components/AnuncioCard.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Link,
  IconButton, // Importar IconButton
  Menu,       // Importar Menu
  MenuItem,   // Importar MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Importar MoreVertIcon
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function AnuncioCard({ id, titulo, descripcion, enlace, urlimagen, orden, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null); // Estado para el anclaje del menú
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleClose();
    onEdit({ id, titulo, descripcion, enlace, urlimagen, orden });
  };

  const handleDeleteClick = () => {
    handleClose();
    onDelete(id);
  };

  return (
    <Card sx={{ display: 'flex', marginBottom: 2, boxShadow: 3, borderRadius: '8px', position: 'relative' }}>
      {urlimagen && (
        <CardMedia
          component="img"
          sx={{ width: 250, height: 150, flexShrink: 0, objectFit: 'cover' }}
          image={urlimagen}
          alt={titulo}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {descripcion}
          </Typography>
          {enlace && (
            <Link href={enlace} target="_blank" rel="noopener" variant="body2">
              Ver más
            </Link>
          )}
        </CardContent>
      </Box>

      {/* Botón de tres puntos */}
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton
          aria-label="más opciones"
          aria-controls={open ? 'anuncio-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="anuncio-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleEditClick}>
            <EditIcon sx={{ mr: 1 }} /> Editar
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon sx={{ mr: 1 }} /> Eliminar
          </MenuItem>
        </Menu>
      </Box>
    </Card>
  );
}

export default AnuncioCard;